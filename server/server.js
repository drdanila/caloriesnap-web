const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { normalizeAnalysis } = require('./lib/normalizeAnalysis');

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
    const { imageBase64, userId, mimeType, locale } = req.body;

    if (!imageBase64 || !userId) {
      return res.status(400).json({ error: 'Missing imageBase64 or userId' });
    }

    // Language for the AI's text fields; defaults to Russian for back-compat.
    const langName = locale === 'en' ? 'English' : 'Russian';

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
      // i18n: the rejection message follows the requested locale.
      const notFoodMessage = locale === 'en'
        ? 'Please upload a photo of food or a prepared meal.'
        : 'Пожалуйста, загрузите фото еды или приготовленного блюда.';
      return res.status(400).json({
        error: 'Not a food image',
        message: notFoodMessage,
      });
    }

    // Analyze nutrition.
    // Evidence-first: report only what is visible; never infer oils/cooking/spices.
    // Strict structured output is enforced via a forced tool call (input_schema),
    // not prompt-coaxed JSON — this removes the previous regex-parsing fallback.
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      temperature: 0.1, // low + deterministic; do NOT also set top_p (Anthropic advises one or the other)
      system: `You are a precise, evidence-first food and nutrition analyst. Your goal: maximize factual accuracy, minimize assumptions, never hallucinate.

REASONING PRIORITY (never reverse this order):
1. Visible evidence in the image
2. USDA FoodData Central / standard nutrition databases
3. Deterministic calculation from known portions
4. (User profile — not provided here)
5. Your own interpretation (lowest priority)

WHAT YOU MAY REPORT:
- Only foods and ingredients that are VISIBLE in the image.
- Do NOT infer cooking methods. Do NOT infer added oils. Do NOT infer spices. Do NOT infer hidden ingredients.
- Do NOT use hedging words ("предположительно", "вероятно", "presumably", "likely", "possibly", "maybe") in ANY text field, and never add parenthetical guesses. State ingredients as plain terms (write "Крем", not "Крем (предположительно заварной)"); if unsure, omit the item.
- Estimate portion size ONLY when your confidence in it is above 80%. Otherwise set portionSize to null (unknown).
- If you cannot confidently identify a food item (confidence below 50), omit it rather than guessing.
- Never compensate for a poor-quality image with assumptions — lower confidence instead.

ALLERGENS: you MAY list allergens that are characteristic of the clearly identified dish (e.g. a Napoleon → gluten, milk, eggs) as SHORT single terms with no qualifiers, parentheses, or explanations (e.g. "Глютен", "Молоко", "Яйца"). These are presented to the user as POSSIBLE allergens, so do not hedge inside the term itself.

CONFIDENCE (0-100): 90+ high, 70-89 medium, 50-69 low, below 50 = do not report that item.

CALORIES & MACROS:
- calories is the single best point estimate. Also provide caloriesMin and caloriesMax.
- When overall confidence is high (90+), caloriesMin = caloriesMax = calories.
- When confidence is not high, return a sensible range (e.g. min 420, max 520) reflecting the uncertainty.
- Round all macros (protein, fat, carbs, fiber) to whole grams.
- healthScore: 0-100 nutritional quality of the meal based only on visible composition.

IMAGE QUALITY: if the image is blurry, dark, partial, or otherwise hard to read, set imageQuality to "poor" and reduce confidence accordingly. Otherwise "good".

TEXT (be concise — facts over explanations, no storytelling, no motivational text, no recipes, no nutrition lectures):
- summary: at most ONE short sentence.
- recommendations: at most 3 short items.
- warnings: at most 2 short items.
- recommendations and warnings must be about NUTRITION and HEALTH only. Never give advice about the photo/image, the app, or how to estimate the meal (e.g. do NOT say "remove shells before eating to make portion estimation easier").

LANGUAGE: write every human-readable text field (dishName, portionSize, ingredients, allergens, tags, summary, recommendations, warnings) in ${langName}. Keep mealType, imageQuality, and all numbers as specified regardless of language.

Call the record_meal_analysis tool exactly once with your structured result.`,
      tools: [
        {
          name: 'record_meal_analysis',
          description: 'Record the structured, evidence-based nutrition analysis of the food image.',
          input_schema: {
            type: 'object',
            properties: {
              dishName: { type: 'string', description: 'Specific name of the dish based only on what is visible.' },
              calories: { type: 'number', description: 'Best single point estimate of total calories (kcal).' },
              caloriesMin: { type: 'number', description: 'Lower bound of the calorie estimate.' },
              caloriesMax: { type: 'number', description: 'Upper bound of the calorie estimate.' },
              protein: { type: 'number', description: 'Protein in whole grams.' },
              fat: { type: 'number', description: 'Fat in whole grams (only visible/known fats, not inferred oils).' },
              carbs: { type: 'number', description: 'Carbohydrates in whole grams.' },
              fiber: { type: 'number', description: 'Fiber in whole grams; 0 if unclear.' },
              confidence: { type: 'number', description: 'Overall confidence 0-100.' },
              healthScore: { type: 'number', description: 'Nutritional quality 0-100 from visible composition.' },
              portionSize: { type: ['string', 'null'], description: 'Measurable portion (e.g. "250g"); null if confidence in portion is not above 80%.' },
              ingredients: { type: 'array', items: { type: 'string' }, description: 'Visible ingredients only, as plain terms — no hedging words or parenthetical guesses.' },
              allergens: { type: 'array', items: { type: 'string' }, description: 'Possible allergens characteristic of the identified dish, as short single terms with no qualifiers/parentheses.' },
              tags: { type: 'array', items: { type: 'string' }, description: 'Short dietary tags (e.g. high-protein, vegetarian).' },
              mealType: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack', 'unknown'], description: 'Meal type if evident, else "unknown".' },
              imageQuality: { type: 'string', enum: ['good', 'poor'], description: 'Quality of the input image.' },
              summary: { type: 'string', description: 'At most one short sentence describing the visible meal.' },
              recommendations: { type: 'array', items: { type: 'string' }, description: 'At most 3 short nutrition/health recommendations — never about the photo, the app, or estimation.' },
              warnings: { type: 'array', items: { type: 'string' }, description: 'At most 2 short nutrition/health warnings — never about the photo, the app, or estimation.' },
            },
            required: ['dishName', 'calories', 'protein', 'fat', 'carbs', 'confidence'],
          },
        },
      ],
      tool_choice: { type: 'tool', name: 'record_meal_analysis' },
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
              text: 'Analyze this food image and record the result with the record_meal_analysis tool. Report only what is visible.'
            }
          ],
        }
      ],
    });

    const toolUse = message.content.find(block => block.type === 'tool_use' && block.name === 'record_meal_analysis');
    if (!toolUse) {
      console.error('No tool_use block in Claude response', JSON.stringify(message.content));
      return res.status(500).json({ error: 'No structured analysis from Claude' });
    }

    // Normalize - ensure all fields are present, valid, and within bounds.
    // Pure, unit-tested in lib/normalizeAnalysis.test.js (guards prod `meals` writes).
    const nutritionData = normalizeAnalysis(toolUse.input);
    console.log('Structured nutrition data:', nutritionData);

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
