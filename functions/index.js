const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk');

admin.initializeApp();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

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

    const message = await client.messages.create({
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
              text: `Analyze this food image and provide nutritional information in JSON format.

              Return ONLY valid JSON (no markdown, no extra text) with these fields:
              {
                "dishName": "name of the dish",
                "calories": number,
                "protein": number (in grams),
                "fat": number (in grams),
                "carbs": number (in grams),
                "confidence": number (0-100, how confident you are),
                "portionSize": "estimated portion size (e.g., '200g', '1 cup')"
              }

              Be as accurate as possible based on the image.`
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
