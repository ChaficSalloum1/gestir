import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";
import { PaletteRequest, PaletteResponse, ColorCapsulePlan } from "../../shared/types";

export async function palette(
  request: PaletteRequest,
  genAI: GoogleGenerativeAI,
  admin: admin.app.App
): Promise<PaletteResponse> {
  try {
    // Get user's wardrobe items
    const db = admin.firestore();
    const wardrobeSnapshot = await db
      .collection("wardrobe")
      .where("userId", "==", request.userId)
      .get();

    if (wardrobeSnapshot.empty) {
      return {
        success: false,
        capsule: {} as ColorCapsulePlan,
        error: "No wardrobe items found. Please add some items first."
      };
    }

    const wardrobeItems = wardrobeSnapshot.docs.map(doc => doc.data());

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Based on the user's wardrobe items, create a 3-look color capsule wardrobe plan.

User's wardrobe:
${JSON.stringify(wardrobeItems, null, 2)}

Color goals: ${request.colorGoals ? request.colorGoals.join(", ") : "balanced and versatile"}

Create 3 distinct looks that work together as a cohesive capsule wardrobe. Each look should:
- Use items from the user's wardrobe
- Have a clear color theme
- Be suitable for different occasions
- Work well together as a complete wardrobe

Return a JSON object with this exact structure:
{
  "capsule": {
    "name": "Spring Essentials Capsule",
    "looks": [
      {
        "name": "Casual Day Look",
        "items": ["itemId1", "itemId2"],
        "description": "A relaxed outfit perfect for running errands or casual outings"
      },
      {
        "name": "Work Ready Look",
        "items": ["itemId3", "itemId4", "itemId5"],
        "description": "Professional yet stylish for the office"
      },
      {
        "name": "Evening Out Look",
        "items": ["itemId6", "itemId7"],
        "description": "Elevated style for dinner or social events"
      }
    ]
  }
}

Make sure all item IDs exist in the wardrobe.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const parsed = JSON.parse(text);
    
    if (!parsed.capsule || !parsed.capsule.looks || !Array.isArray(parsed.capsule.looks)) {
      throw new Error("Invalid response format from Gemini");
    }

    // Validate that all item IDs exist in the wardrobe
    const validItemIds = wardrobeItems.map(item => item.id);
    const allOutfitItems = parsed.capsule.looks.flatMap((look: any) => look.items);
    
    for (const itemId of allOutfitItems) {
      if (!validItemIds.includes(itemId)) {
        throw new Error(`Item ID ${itemId} not found in wardrobe`);
      }
    }

    // Generate images using Imagen
    const imagenModel = genAI.getGenerativeModel({ model: "imagen-4.0-generate-001" });
    const generatedImages: string[] = [];

    for (let i = 0; i < 2; i++) {
      try {
        const imagePrompt = `Fashion illustration showing a stylish outfit from the ${parsed.capsule.name} capsule wardrobe. Clean, modern style, neutral background, high quality fashion photography style.`;
        
        const imageResult = await imagenModel.generateContent(imagePrompt);
        const imageResponse = await imageResult.response;
        
        // Note: In a real implementation, you would need to handle the image generation
        // and upload to Firebase Storage. For now, we'll use placeholder URLs.
        const imageUrl = `https://storage.googleapis.com/your-bucket/generated-image-${Date.now()}-${i}.jpg`;
        generatedImages.push(imageUrl);
      } catch (imageError) {
        console.warn(`Failed to generate image ${i}:`, imageError);
        // Continue with other images
      }
    }

    // Create color capsule plan
    const capsuleId = db.collection("colorCapsules").doc().id;
    const capsule: ColorCapsulePlan = {
      id: capsuleId,
      userId: request.userId,
      name: parsed.capsule.name,
      looks: parsed.capsule.looks,
      generatedImages,
      createdAt: new Date()
    };

    // Save to Firestore
    await db.collection("colorCapsules").doc(capsuleId).set(capsule);

    return {
      success: true,
      capsule
    };
  } catch (error) {
    console.error("Error creating palette:", error);
    return {
      success: false,
      capsule: {} as ColorCapsulePlan,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}




