import { Router } from "express";
import { db } from "@workspace/db";
import { diseaseScansTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

const DISEASE_DATABASE: Record<string, {
  symptoms: string[];
  fertilizers: Array<{ name: string; dosage: string; frequency: string; notes: string; canBook: boolean }>;
  preventionTips: string[];
  description: string;
}> = {
  "Leaf Blight": {
    description: "A fungal disease causing large, brown lesions on leaves that spread rapidly in humid conditions.",
    symptoms: ["Brown leaf spots", "Yellow halos around spots", "Wilting leaves", "Early leaf drop"],
    fertilizers: [
      { name: "Mancozeb 75% WP", dosage: "2.5g per litre of water", frequency: "Every 7-10 days", notes: "Spray in early morning or evening", canBook: true },
      { name: "Copper Oxychloride", dosage: "3g per litre", frequency: "Every 10 days", notes: "Avoid spraying during flowering", canBook: true },
      { name: "NPK 19:19:19", dosage: "5g per litre", frequency: "Weekly foliar spray", notes: "Boosts plant immunity", canBook: false },
    ],
    preventionTips: ["Ensure proper drainage", "Avoid overhead irrigation", "Remove infected plant debris", "Use disease-resistant varieties"]
  },
  "Powdery Mildew": {
    description: "A fungal infection causing white powdery coating on leaves, reducing photosynthesis.",
    symptoms: ["White powdery spots on leaves", "Yellowing of affected areas", "Stunted growth", "Leaf curl"],
    fertilizers: [
      { name: "Sulphur 80% WP", dosage: "3g per litre", frequency: "Every 7 days", notes: "Most effective preventive treatment", canBook: true },
      { name: "Hexaconazole 5% EC", dosage: "2ml per litre", frequency: "Every 14 days", notes: "Systemic fungicide for better coverage", canBook: true },
      { name: "Potassium Bicarbonate", dosage: "5g per litre", frequency: "Weekly", notes: "Organic option, safe for pollinators", canBook: false },
    ],
    preventionTips: ["Improve air circulation", "Avoid excessive nitrogen fertilizer", "Water at base of plant", "Apply mulch to reduce soil splash"]
  },
  "Rust Disease": {
    description: "Fungal rust causes orange-brown pustules on leaves, significantly reducing yield.",
    symptoms: ["Orange/rust colored pustules", "Yellowing between pustules", "Premature leaf fall", "Reduced yield"],
    fertilizers: [
      { name: "Propiconazole 25% EC", dosage: "1ml per litre", frequency: "Every 14 days", notes: "Highly effective systemic fungicide", canBook: true },
      { name: "Tebuconazole 25.9% EC", dosage: "1ml per litre", frequency: "Every 10-14 days", notes: "Best for severe infections", canBook: true },
      { name: "Potassium Phosphonate", dosage: "3ml per litre", frequency: "Every 10 days", notes: "Strengthens plant cell walls", canBook: false },
    ],
    preventionTips: ["Plant disease-resistant varieties", "Rotate crops annually", "Avoid planting near infected fields", "Monitor weather for high humidity"]
  },
  "Bacterial Leaf Spot": {
    description: "Bacterial infection causing water-soaked spots that turn brown with yellow halos.",
    symptoms: ["Water-soaked angular spots", "Brown/black spots with yellow halos", "Spots limited by leaf veins", "Bacterial ooze in humid conditions"],
    fertilizers: [
      { name: "Copper Hydroxide 77% WP", dosage: "2g per litre", frequency: "Every 7-10 days", notes: "Broad-spectrum bactericide", canBook: true },
      { name: "Streptomycin Sulphate", dosage: "0.5g per litre", frequency: "Every 7 days", notes: "Use only when severely infected", canBook: true },
      { name: "Calcium Nitrate", dosage: "5g per litre", frequency: "Bi-weekly foliar", notes: "Strengthens cell walls against bacteria", canBook: false },
    ],
    preventionTips: ["Use certified disease-free seeds", "Sanitize tools regularly", "Avoid working in wet fields", "Practice crop rotation"]
  },
  "Yellow Leaf Virus": {
    description: "Viral disease spread by whiteflies causing yellow mosaic patterns and stunted growth.",
    symptoms: ["Yellow mosaic patterns", "Leaf curling", "Stunted plant growth", "Reduced fruit set"],
    fertilizers: [
      { name: "Imidacloprid 17.8% SL", dosage: "0.5ml per litre", frequency: "Every 7 days", notes: "Controls whitefly vectors", canBook: true },
      { name: "Thiamethoxam 25% WG", dosage: "0.3g per litre", frequency: "Every 10 days", notes: "Systemic insecticide for vector control", canBook: true },
      { name: "Seaweed Extract", dosage: "5ml per litre", frequency: "Weekly", notes: "Boosts plant immunity against viruses", canBook: false },
    ],
    preventionTips: ["Remove and destroy infected plants immediately", "Control whitefly with yellow sticky traps", "Use reflective mulches", "Plant virus-resistant varieties"]
  }
};

const CROP_DISEASES: Record<string, string[]> = {
  rice: ["Leaf Blight", "Bacterial Leaf Spot", "Rust Disease"],
  wheat: ["Rust Disease", "Powdery Mildew", "Leaf Blight"],
  tomato: ["Bacterial Leaf Spot", "Powdery Mildew", "Yellow Leaf Virus"],
  cotton: ["Leaf Blight", "Bacterial Leaf Spot"],
  default: ["Leaf Blight", "Powdery Mildew", "Rust Disease", "Bacterial Leaf Spot", "Yellow Leaf Virus"]
};

router.post("/disease/detect", async (req, res) => {
  const { imageBase64, cropType } = req.body;
  
  if (!imageBase64) {
    res.status(400).json({ error: "Image is required" });
    return;
  }

  try {
    const prompt = `You are an expert agricultural scientist specializing in crop disease detection.
    
Analyze this image and determine:
1. Is this image showing a PLANT LEAF? (Yes/No) - Only plant leaves are valid. Reject people, animals, objects, food, buildings, or anything that is not a plant leaf.
2. If it IS a leaf, what disease (if any) does it show?

Respond in this EXACT JSON format only, no other text:
{
  "isLeaf": true or false,
  "diseaseName": "disease name or Healthy Plant",
  "confidence": 0.0 to 1.0,
  "severity": "low" or "medium" or "high" or "none"
}

If not a leaf, set isLeaf to false and other fields to defaults.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, "")
              }
            },
            { text: prompt }
          ]
        }
      ]
    });

    const responseText = response.text ?? "{}";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    const aiResult = JSON.parse(jsonMatch[0]);

    if (!aiResult.isLeaf) {
      res.json({
        isLeaf: false,
        diseaseName: "Not a leaf",
        confidence: 0,
        severity: "low",
        description: "The image does not appear to be a plant leaf. Please point your camera at a plant leaf for disease detection.",
        symptoms: [],
        fertilizers: [],
        preventionTips: [],
        scanId: 0
      });
      return;
    }

    const diseaseName = aiResult.diseaseName || "Leaf Blight";
    const confidence = aiResult.confidence || 0.85;
    const severity = aiResult.severity || "medium";
    const detectedCropType = cropType || "unknown";

    let diseaseInfo = DISEASE_DATABASE[diseaseName];
    if (!diseaseInfo) {
      const availableDiseases = CROP_DISEASES[detectedCropType.toLowerCase()] || CROP_DISEASES.default;
      const matchedDisease = availableDiseases.find(d => 
        diseaseName.toLowerCase().includes(d.toLowerCase().split(" ")[0].toLowerCase())
      ) || availableDiseases[0];
      diseaseInfo = DISEASE_DATABASE[matchedDisease] || DISEASE_DATABASE["Leaf Blight"];
    }

    const [scan] = await db.insert(diseaseScansTable).values({
      diseaseName,
      confidence,
      severity,
      cropType: detectedCropType,
    }).returning();

    res.json({
      isLeaf: true,
      diseaseName,
      confidence,
      severity,
      description: diseaseInfo.description,
      symptoms: diseaseInfo.symptoms,
      fertilizers: diseaseInfo.fertilizers,
      preventionTips: diseaseInfo.preventionTips,
      scanId: scan.id
    });
  } catch (err) {
    req.log.error({ err }, "Disease detection error");
    res.status(500).json({ error: "Disease detection failed" });
  }
});

router.get("/disease/history", async (req, res) => {
  try {
    const scans = await db.select().from(diseaseScansTable).orderBy(desc(diseaseScansTable.scannedAt)).limit(20);
    res.json(scans);
  } catch (err) {
    req.log.error({ err }, "Failed to get disease history");
    res.status(500).json({ error: "Failed to retrieve history" });
  }
});

export default router;
