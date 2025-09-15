import * as dotenv from "dotenv";
dotenv.config();

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ingest } from "./ingest";

// Initialize Admin exactly once
try { admin.initializeApp(); } catch (_) { /* ignore re-init in emulator */ }

// CORS
const corsHandler = cors({ origin: true });

// Gemini client from env (.env in functions/)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
if (!GEMINI_API_KEY) {
  functions.logger.warn("GEMINI_API_KEY is empty. Set it in functions/.env for local emulators.");
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ---- HTTP endpoints ----
// Ingest endpoint: POST { userId, imageUrl }
export const ingestHttp = functions.https.onRequest((req, res) =>
  corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body?.userId || !body?.imageUrl) return res.status(400).json({ success: false, error: "userId and imageUrl required" });

      const result = await ingest({ userId: body.userId, imageUrl: body.imageUrl }, genAI);
      return res.status(200).json(result);
    } catch (e: any) {
      functions.logger.error("ingestHttp error", e);
      return res.status(500).json({ success: false, error: String(e?.message || e) });
    }
  })
);

