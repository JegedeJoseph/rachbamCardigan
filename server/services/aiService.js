import axios from 'axios';

/**
 * Smart Fallback Knitwear Heuristics
 * Produces accurate, luxury editorial specs when Gemini API key is not yet configured or offline.
 */
export const getFallbackKnitwearSpecs = ({ name = '', category = 'Cardigan', knitGauge = '' }) => {
  const lowerName = name.toLowerCase();
  const lowerCat = category.toLowerCase();

  let determinedGauge = knitGauge || 'Medium / All-Season';
  let warmth = 3;
  let fiber = '70% Soft Merino Wool, 30% Cotton Blend';
  let care = 'Hand wash cold with delicate wool detergent. Do not wring. Press excess water between towels and lay flat to dry in shade. Use a garment comb for gentle de-pilling.';
  let measurements = {
    chest: '54 cm (Pit-to-Pit)',
    length: '65 cm',
    sleeve: '60 cm',
  };
  let modelStats = {
    height: "5'8\" (173 cm)",
    sizeWorn: 'Small / Medium',
  };
  let tips = [
    'Wear open over a satin slip dress for relaxed evening elegance.',
    'Button up fully as a standalone knit top paired with tailored wide-leg trousers.',
    'Drape effortlessly over your shoulders for air-conditioned office and evening warmth.'
  ];
  let variants = [
    { size: 'S', color: 'Natural Cream', stock: 5 },
    { size: 'M', color: 'Natural Cream', stock: 8 },
    { size: 'L', color: 'Natural Cream', stock: 5 },
    { size: 'XL', color: 'Natural Cream', stock: 3 },
  ];

  if (lowerName.includes('chunky') || lowerCat.includes('chunky') || lowerName.includes('cable') || lowerName.includes('oversized')) {
    determinedGauge = 'Chunky / Heavyweight';
    warmth = 5;
    fiber = '80% Premium Soft Acrylic, 20% Virgin Wool';
    care = 'Hand wash cool. Never hang when wet to prevent stretching. Dry flat on a clean bath towel. Keep folded in drawer with cedar balls.';
    measurements = { chest: '60 cm (Pit-to-Pit)', length: '70 cm', sleeve: '62 cm' };
    tips = [
      'Layer over a lightweight cotton t-shirt with straight-leg denim for a harmattan morning statement.',
      'Cinch at the waist with a thin leather belt to accentuate your silhouette.',
      'Style with high-waisted linen pants for a textural contrast.'
    ];
  } else if (lowerName.includes('crop') || lowerCat.includes('crop') || lowerName.includes('light') || lowerName.includes('summer')) {
    determinedGauge = 'Fine / Lightweight';
    warmth = 2;
    fiber = '100% Breathable Combed Cotton';
    care = 'Machine wash gentle cycle cold in a mesh wash bag. Reshape while damp and dry flat away from direct sun.';
    measurements = { chest: '48 cm (Pit-to-Pit)', length: '48 cm', sleeve: '57 cm' };
    tips = [
      'Button fully and style with high-waisted trousers or an A-line midi skirt.',
      'Leave the top two buttons undone for an effortless, casual silhouette.',
      'Ideal lightweight layer for sunny Nigerian afternoons and air-conditioned spaces.'
    ];
  } else if (lowerName.includes('duster') || lowerCat.includes('duster') || lowerName.includes('long')) {
    determinedGauge = 'Medium / All-Season';
    warmth = 4;
    fiber = '60% Merino Wool, 40% Viscose Blend';
    care = 'Hand wash gently in lukewarm water. Dry flat. Steam lightly with a garment steamer to restore drape.';
    measurements = { chest: '56 cm (Pit-to-Pit)', length: '110 cm', sleeve: '61 cm' };
    tips = [
      'Wear fully open over a monochrome base outfit to elongate your profile.',
      'Add a statement belt for an evening dinner look.',
      'Pair with ankle boots or strappy heels for transitional elegance.'
    ];
  } else if (lowerName.includes('cashmere') || lowerCat.includes('cashmere')) {
    determinedGauge = 'Fine / Lightweight';
    warmth = 4;
    fiber = '100% Mongolian Cashmere';
    care = 'Gentle hand wash in cold water using a pH-neutral cashmere shampoo. Never wring. Reshape and lay flat to dry.';
    measurements = { chest: '52 cm (Pit-to-Pit)', length: '63 cm', sleeve: '59 cm' };
    tips = [
      'Wear against bare skin for unmatched cloud-soft luxury.',
      'Pair with tailored wool trousers for an understated quiet-luxury outfit.',
      'Care with a natural bristle cashmere brush to preserve its plush loft.'
    ];
  }

  const generatedDescription = `Crafted with artisanal care by local artisans, this ${name || 'signature cardigan'} showcases meticulous attention to knit structure and timeless silhouette. Designed to transition effortlessly from Harmattan mornings to air-conditioned evenings, it offers unmatched comfort, breathable insulation, and refined elegance.`;

  return {
    description: generatedDescription,
    knitGauge: determinedGauge,
    warmthLevel: warmth,
    fiberComposition: fiber,
    careInstructions: care,
    measurements,
    modelStats,
    stylingTips: tips,
    variants,
    source: 'heuristic',
  };
};

/**
 * Gemini AI Specification Generator
 * Uses Gemini API if GEMINI_API_KEY is available, otherwise falls back gracefully to smart heuristics.
 */
export const generateCardiganSpecifications = async ({ name = '', category = '', imageBase64 = '', knitGauge = '' }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('Gemini API key not configured. Using smart knitwear heuristics fallback.');
    return getFallbackKnitwearSpecs({ name, category, knitGauge });
  }

  try {
    const prompt = `You are a master knitwear designer and luxury fashion copywriter for "Rachbam Cardigans", an artisanal knitwear brand in Nigeria.
Analyze this cardigan item:
Product Name: "${name || 'Signature Handmade Cardigan'}"
Category: "${category || 'Cardigan'}"
Specified Knit Gauge: "${knitGauge || 'Not specified'}"

Return ONLY a valid JSON object (no markdown fences, no extra text) with the following structure:
{
  "name": "Refined luxury title",
  "description": "2-3 sentences of evocative, sensory product storytelling tailored for Nigerian climate (Harmattan, AC offices, evening wear)",
  "knitGauge": "Fine / Lightweight" | "Medium / All-Season" | "Chunky / Heavyweight",
  "warmthLevel": integer from 1 to 5 (1=Airy, 3=AC layer, 5=Harmattan cozy),
  "fiberComposition": "e.g. 80% Combed Cotton, 20% Merino Wool",
  "careInstructions": "Practical washing, drying, and de-pilling guidelines",
  "measurements": {
    "chest": "e.g. 54 cm / 21 in",
    "length": "e.g. 68 cm / 27 in",
    "sleeve": "e.g. 60 cm / 23.5 in"
  },
  "modelStats": {
    "height": "e.g. 5'8\\" / 173 cm",
    "sizeWorn": "e.g. Small (S) for relaxed drape"
  },
  "stylingTips": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ],
  "variants": [
    {"size": "S", "color": "Main Color", "stock": 5},
    {"size": "M", "color": "Main Color", "stock": 8},
    {"size": "L", "color": "Main Color", "stock": 6},
    {"size": "XL", "color": "Main Color", "stock": 4}
  ]
}`;

    const parts = [{ text: prompt }];

    // If an image is provided in base64, attach it to Gemini multimodal payload
    if (imageBase64) {
      const match = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      },
      { timeout: 15000 }
    );

    const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidate) {
      const cleanJson = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        ...parsed,
        source: 'gemini',
      };
    }

    return getFallbackKnitwearSpecs({ name, category, knitGauge });
  } catch (error) {
    console.error('Error invoking Gemini API:', error.message);
    // Graceful fallback so local producer is never blocked
    return getFallbackKnitwearSpecs({ name, category, knitGauge });
  }
};
