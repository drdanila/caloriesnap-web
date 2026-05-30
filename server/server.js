const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const admin = require('firebase-admin');
const crypto = require('crypto');

const app = express();
app.use(express.json({ limit: '40mb' }));

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Storage bucket is environment-specific (prod vs staging); falls back to prod.
const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'eatappmain-e7503.firebasestorage.app';
admin.initializeApp({
  storageBucket: STORAGE_BUCKET
});
const bucket = admin.storage().bucket();

app.post('/analyze', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  try {
    const { imageBase64, userId, mimeType } = req.body;

    if (!imageBase64 || !userId) {
      return res.status(400).json({ error: 'Missing imageBase64 or userId' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    const mediaType = mimeType || 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mediaType)) {
      return res.status(400).json({ error: 'Unsupported image format' });
    }

    // Validate it's a food image
    const validationMessage = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Is this image a photo of FOOD or a PREPARED MEAL? Answer only with 'yes' or 'no'. If you see any cooked food, prepared dish, ingredients, or beverage, answer 'yes'. Otherwise answer 'no'.`
            }
          ],
        }
      ],
    });

    const isFood = validationMessage.content[0]?.text?.toLowerCase().includes('yes');
    if (!isFood) {
      return res.status(400).json({
        error: 'Not a food image',
        message: 'Пожалуйста, загрузите фото еды или приготовленного блюда.',
      });
    }

    // Analyze nutrition
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `You are a professional nutritionist and food analyst. Analyze this food image with MAXIMUM ACCURACY and provide detailed nutritional information.

IMPORTANT INSTRUCTIONS:
1. Identify the exact dish/food items visible
2. Estimate portion size based on visual cues (plate size, utensils, glass size reference)
3. Calculate calories based on USDA and international food databases
4. Be as precise as possible with macronutrients
5. If multiple items, sum up the totals
6. Consider cooking method visible in the image
7. Estimate hidden ingredients/oils used in cooking

Return ONLY valid JSON (no markdown, no extra text) with these fields:
{
  "dishName": "specific name of the dish (e.g., 'Grilled Salmon with Rice and Vegetables')",
  "calories": number (total, be as accurate as possible),
  "protein": number (in grams, consider all ingredients),
  "fat": number (in grams, include cooking oils),
  "carbs": number (in grams, all sources),
  "fiber": number (in grams, estimate from ingredients; if unclear, use 0),
  "confidence": number (0-100, how confident in accuracy: 100=very clear/standard dish, 50=unclear/mixed items),
  "portionSize": "specific portion size (e.g., '250g', '1.5 cups', '150ml')",
  "ingredients": ["ingredient1", "ingredient2", ...],
  "notes": "any important notes about estimation (e.g., 'sauce not visible', 'oil used estimated')"
}

Be conservative with estimates - better to slightly overestimate calories.

IMPORTANT: Respond in Russian language. All text fields (dishName, portionSize, ingredients, notes) must be in Russian.

ТОЧНОСТЬ: Используй базу данных USDA FoodData Central как эталон для калорийности и БЖУ. Твои оценки должны быть воспроизводимыми — если анализировать это блюдо несколько раз, результат должен отличаться не более чем на 5%. Будь конкретным в размерах порций (измеримые единицы, не "средний").`
            }
          ],
        }
      ],
    });

    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent) {
      console.error('No text content in Claude response');
      return res.status(500).json({ error: 'No text response from Claude' });
    }

    console.log('Claude response text:', textContent.text);

    let nutritionData;
    try {
      let jsonText = textContent.text.trim();

      // Extract JSON from markdown code block if present
      const jsonMatch = jsonText.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }

      // Also try to extract JSON object directly if no markdown
      if (!jsonMatch) {
        const objectMatch = jsonText.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          jsonText = objectMatch[0];
        }
      }

      console.log('Extracted JSON text:', jsonText.substring(0, 200));
      nutritionData = JSON.parse(jsonText);
    } catch (e) {
      console.error('JSON parse error:', e.message);
      console.error('Attempted to parse:', textContent.text.substring(0, 500));
      return res.status(500).json({ error: 'Failed to parse nutrition data', details: e.message });
    }

    console.log('Successfully parsed nutrition data:', nutritionData);

    // Normalize nutrition data - ensure all fields are present and valid
    nutritionData.fiber = Math.max(0, nutritionData.fiber || 0);
    nutritionData.protein = Math.max(0, nutritionData.protein || 0);
    nutritionData.fat = Math.max(0, nutritionData.fat || 0);
    nutritionData.carbs = Math.max(0, nutritionData.carbs || 0);
    nutritionData.calories = Math.max(0, nutritionData.calories || 0);
    nutritionData.confidence = Math.min(100, Math.max(0, nutritionData.confidence || 50));

    // Upload image to Firebase Storage
    let imageUrl;
    try {
      const token = crypto.randomUUID();
      const timestamp = Date.now();
      const fileName = `meals/${userId}/${timestamp}.jpg`;

      await bucket.file(fileName).save(Buffer.from(imageBase64, 'base64'), {
        metadata: {
          contentType: mediaType || 'image/jpeg',
          metadata: { firebaseStorageDownloadTokens: token }
        }
      });

      imageUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(fileName)}?alt=media&token=${token}`;
    } catch (uploadErr) {
      console.warn('Image upload failed:', uploadErr.message);
    }

    res.json({ ...nutritionData, ...(imageUrl && { imageUrl }) });

  } catch (error) {
    console.error('Error analyzing meal:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    res.status(500).json({
      error: 'Analysis failed',
      details: error.message,
      type: error.constructor.name
    });
  }
});

app.options('*', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
