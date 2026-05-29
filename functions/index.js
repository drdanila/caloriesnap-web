const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk');

admin.initializeApp();

let client;

function getAnthropicClient() {
  if (client) return client;

  const config = functions.config();
  const apiKey = config.anthropic?.api_key || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  client = new Anthropic({ apiKey });
  return client;
}

exports.analyzeMeal = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { imageBase64, userId, mimeType } = req.body;

    if (!imageBase64 || !userId) {
      res.status(400).json({ error: 'Missing imageBase64 or userId' });
      return;
    }

    const mediaType = mimeType || 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mediaType)) {
      res.status(400).json({ error: 'Unsupported image format' });
      return;
    }

    const anthropic = getAnthropicClient();
    const validationMessage = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
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
      res.status(400).json({
        error: 'Not a food image',
        message: 'Please upload a photo of food or a prepared meal. The image should show actual food items or a dish.',
      });
      return;
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
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
  "fiber": number (in grams, if significant),
  "confidence": number (0-100, how confident in accuracy: 100=very clear/standard dish, 50=unclear/mixed items),
  "portionSize": "specific portion size (e.g., '250g', '1.5 cups', '150ml')",
  "ingredients": ["ingredient1", "ingredient2", ...],
  "notes": "any important notes about estimation (e.g., 'sauce not visible', 'oil used estimated')"
}

Be conservative with estimates - better to slightly overestimate calories.`
            }
          ],
        }
      ],
    });

    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent) {
      throw new Error('No text response from Claude');
    }

    let nutritionData;
    try {
      nutritionData = JSON.parse(textContent.text);
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse nutrition data', details: e.message });
      return;
    }

    res.json({
      success: true,
      data: nutritionData
    });

  } catch (error) {
    console.error('Error analyzing meal:', error);
    res.status(500).json({
      error: 'Analysis failed',
      details: error.message
    });
  }
});
