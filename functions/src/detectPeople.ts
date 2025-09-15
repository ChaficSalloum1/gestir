import { GoogleGenerativeAI } from "@google/generative-ai";
import { DetectPeopleRequest, DetectPeopleResponse, BoundingBox } from "../../shared/types";

export async function detectPeople(
  request: DetectPeopleRequest,
  genAI: GoogleGenerativeAI
): Promise<DetectPeopleResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Analyze this image and detect all people in it. For each person detected, provide:
1. Normalized bounding box coordinates (x, y, width, height) where all values are between 0 and 1
2. A brief caption describing the person (e.g., "person in blue shirt", "woman with long hair")
3. Confidence score between 0 and 1

Return the response as a JSON object with this exact structure:
{
  "people": [
    {
      "x": 0.25,
      "y": 0.3,
      "w": 0.2,
      "h": 0.4,
      "caption": "person in blue shirt",
      "confidence": 0.95
    }
  ]
}

Image URL: ${request.imageUrl}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const parsed = JSON.parse(text);
    
    if (!parsed.people || !Array.isArray(parsed.people)) {
      throw new Error("Invalid response format from Gemini");
    }

    // Validate bounding boxes
    const people: BoundingBox[] = parsed.people.map((person: any) => {
      if (
        typeof person.x !== "number" || person.x < 0 || person.x > 1 ||
        typeof person.y !== "number" || person.y < 0 || person.y > 1 ||
        typeof person.w !== "number" || person.w < 0 || person.w > 1 ||
        typeof person.h !== "number" || person.h < 0 || person.h > 1 ||
        typeof person.caption !== "string" ||
        typeof person.confidence !== "number" || person.confidence < 0 || person.confidence > 1
      ) {
        throw new Error("Invalid bounding box data");
      }
      return person as BoundingBox;
    });

    return {
      success: true,
      people
    };
  } catch (error) {
    console.error("Error detecting people:", error);
    return {
      success: false,
      people: [],
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

