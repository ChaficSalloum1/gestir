import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { 
  IngestRequest, 
  IngestResponse, 
  WardrobeItem, 
  GarmentAnalysisResponse,
  GarmentAnalysisItem,
  APP_CONFIG 
} from "./types";
import { urlToBase64 } from "./lib/urlToBase64";

// Schema to enforce JSON output
const IngestionResultSchema = {
  type: "object",
  required: ["items", "warnings"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        required: ["id","category","subcategory","colorName","colorHex","pattern","materialFamily","confidence"],
        properties: {
          id: { type:"string" },
          category: { type:"string", enum:["top","bottom","dress","outerwear","shoes","bag","accessory","other"] },
          subcategory: { type:"string" },
          colorName: { type:"string" },
          colorHex: { type:"string", pattern:"^#([0-9A-Fa-f]{6})$" },
          secondaryColors: { type:"array", items: { type:"string" } },
          pattern: { type:"string", enum:["solid","stripe","check","floral","dots","graphic","logo","camo","other"] },
          materialFamily: { type:"string", enum:["cotton","denim","wool","cashmere","silk","linen","leather","synthetic","blend","other"] },
          fit: { type:"string", enum:["skinny","slim","regular","relaxed","oversized","tailored","unknown"] },
          length: { type:"string", enum:["crop","short","midi","ankle","full","unknown"] },
          rise: { type:"string", enum:["low","mid","high","na"] },
          sleeve: { type:"string", enum:["sleeveless","short","three-quarter","long","na"] },
          neckline: { type:"string", enum:["crew","v-neck","buttoned","collared","scoop","turtleneck","na"] },
          dominantFinish: { type:"string", enum:["matte","sheen","satin","gloss","suede","distressed","quilted","ribbed","cable","none"] },
          brandText: { type:"string" },
          notes: { type:"string" },
          confidence: { type:"number", minimum: 0, maximum: 1 }
        }
      }
    },
    warnings: { type:"array", items:{ type:"string" } }
  }
} as const;

// Helper: load optional few-shot example images
function assetB64(name: string) {
  const p = path.resolve(__dirname, "../assets", name);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p).toString("base64");
}

// Helper: convert GarmentAnalysisItem to WardrobeItem
function convertToWardrobeItem(
  analysisItem: GarmentAnalysisItem, 
  userId: string, 
  imageUrl: string
): WardrobeItem {
  return {
    id: analysisItem.id,
    userId,
    name: generateItemName(analysisItem),
    category: analysisItem.category,
    subcategory: analysisItem.subcategory,
    
    // Detailed analysis fields (all required in WardrobeItem)
    colorName: analysisItem.colorName,
    colorHex: analysisItem.colorHex,
    secondaryColors: analysisItem.secondaryColors,
    pattern: analysisItem.pattern,
    materialFamily: analysisItem.materialFamily,
    fit: analysisItem.fit,
    length: analysisItem.length,
    rise: analysisItem.rise,
    sleeve: analysisItem.sleeve,
    neckline: analysisItem.neckline,
    dominantFinish: analysisItem.dominantFinish,
    brandText: analysisItem.brandText,
    notes: analysisItem.notes,
    confidence: analysisItem.confidence,
    
    // Legacy fields for backward compatibility
    colors: [analysisItem.colorName, ...analysisItem.secondaryColors],
    materials: [analysisItem.materialFamily],
    patterns: [analysisItem.pattern],
    style: "casual", // Default value, can be enhanced later
    occasion: ["casual"], // Default value, can be enhanced later
    season: ["all"], // Default value, can be enhanced later
    brand: analysisItem.brandText,
    size: undefined,
    
    imageUrl,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

function generateItemName(item: GarmentAnalysisItem): string {
  const parts = [
    item.colorName,
    item.materialFamily,
    item.subcategory
  ].filter(Boolean);
  
  return parts.join(' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Main ingest function
export async function ingest(
  request: { userId: string; imageUrl: string },
  genAI: import("@google/generative-ai").GoogleGenerativeAI
): Promise<{ success: boolean; result: any }> {
  try {
    const { userId, imageUrl } = request;
    if (!userId) throw new Error("userId required");

    // Load the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // SYSTEM prompt
    const SYSTEM = `
You are a wardrobe ingestion engine for single-person photos.

Goal:
- Identify each distinct garment visible on the person and return STRICT JSON only.
- Use the provided enums exactly; do not invent new labels.
- If unsure about any field, set a lower "confidence" (0–1) and add a short "notes" hint.

Output contract (JSON only; no prose):
{
  "items": [
    {
      "id": "<photoUrl>#<index>",
      "category": "top|bottom|dress|outerwear|shoes|bag|accessory|other",
      "subcategory": "...(from enum list below)...",
      "colorName": "<common name: black, navy, beige, ...>",
      "colorHex": "#RRGGBB",
      "secondaryColors": ["<optional names>"],
      "pattern": "solid|stripe|check|floral|dots|graphic|logo|camo|other",
      "materialFamily": "cotton|denim|wool|cashmere|silk|linen|leather|synthetic|blend|other",
      "fit": "skinny|slim|regular|relaxed|oversized|tailored|unknown",
      "length": "crop|short|midi|ankle|full|unknown",
      "rise": "low|mid|high|na",
      "sleeve": "sleeveless|short|three-quarter|long|na",
      "neckline": "crew|v-neck|buttoned|collared|scoop|turtleneck|na",
      "dominantFinish": "matte|sheen|satin|gloss|suede|distressed|quilted|ribbed|cable|none",
      "brandText": "<short visible word(s) on garment, if any>",
      "notes": "<1 short line if you lowered confidence>",
      "confidence": 0.0-1.0
    }
  ],
  "warnings": ["<string>", "..."]
}

Category subcategory enum:
- top: t-shirt, polo, shirt, tank, sweatshirt, hoodie, blouse
- bottom: jeans, trousers, shorts, skirt
- dress: midi-dress, mini-dress, maxi-dress, jumpsuit
- outerwear: blazer, coat, jacket, cardigan, gilet
- shoes: sneakers, boots, heels, flats, loafers, sandals
- bag: tote, crossbody, backpack, clutch
- accessory: belt, hat, scarf, watch, jewelry, sunglasses
- other: other

Rules:
- If two tops are layered (e.g., tee under blazer), list both as separate items.
- Choose the closest enum; if unknown, use "other" and lower confidence.
- Always provide both colorName and colorHex (approximate the hex).
- Use "logo" pattern only if a logo graphic dominates the front.
- Keep "brandText" short (what you can read, not a guess).
- IDs must be "<photoUrl>#<index>" starting at 1.
Return JSON only.
`;

    // Build contents
    const contents: any[] = [
      { role: "user", parts: [{ text: SYSTEM }] }
    ];

    // Optional: add 1–2 few-shot examples (skip if no assets folder)
    const studio = assetB64("studio.jpg");
    if (studio) {
      contents.push(
        { role:"user", parts:[{ inlineData:{ mimeType:"image/jpeg", data: studio } }] },
        { role:"user", parts:[{ text: JSON.stringify({
          items:[{
            id:"example#1", category:"top", subcategory:"t-shirt",
            colorName:"white", colorHex:"#F2F2F2",
            pattern:"solid", materialFamily:"cotton", confidence:0.99
          }],
          warnings:[]
        }) }]}
      );
    }

    // Add the real user photo
    const base64 = await urlToBase64(imageUrl);
    contents.push(
      { role:"user", parts:[{ inlineData:{ mimeType:"image/jpeg", data: base64 } }] },
      { role:"user", parts:[{ text: `photoUrl: ${imageUrl}` }] }
    );

    // Call Gemini with structured output
    const result = await model.generateContent({
      contents,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: IngestionResultSchema as any
      }
    });

    // Parse result
    const text = result.response.text();
    const parsed: GarmentAnalysisResponse = JSON.parse(text || '{"items":[],"warnings":[]}');
    if (!Array.isArray(parsed.items)) throw new Error("Invalid model response");

    // Filter out low-confidence items
    const highConfidenceItems = parsed.items.filter(item => 
      item.confidence >= APP_CONFIG.MIN_CONFIDENCE_THRESHOLD
    );
    const lowConfidenceItems = parsed.items.filter(item => 
      item.confidence < APP_CONFIG.MIN_CONFIDENCE_THRESHOLD
    );

    // Add warnings for low-confidence items
    const warnings = [...(parsed.warnings || [])];
    if (lowConfidenceItems.length > 0) {
      warnings.push(`${lowConfidenceItems.length} items had low confidence and were excluded`);
    }

    // Convert to WardrobeItem format
    const wardrobeItems = highConfidenceItems.map((item, index) => 
      convertToWardrobeItem(
        { ...item, id: item.id || `${imageUrl}#${index + 1}` }, 
        userId, 
        imageUrl
      )
    );

    // Save items to Firestore using unified collection
    const db = admin.firestore();
    const batch = db.batch();
    const savedItems: WardrobeItem[] = [];

    wardrobeItems.forEach((item) => {
      const doc = db.collection("wardrobe").doc();
      const itemWithId = { ...item, id: doc.id };
      batch.set(doc, itemWithId);
      savedItems.push(itemWithId);
    });

    await batch.commit();

    return { 
      success: true, 
      result: { 
        success: true, 
        items: savedItems, 
        warnings 
      } 
    };

  } catch (err: any) {
    console.error("ingest error:", err);
    return { 
      success: false, 
      result: { 
        success: false, 
        items: [], 
        warnings: [],
        error: String(err.message || err) 
      } 
    };
  }
}