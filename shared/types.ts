// Shared TypeScript interfaces for Gestir V2
// This file serves as the single source of truth for all type definitions

export interface BoundingBox {
  x: number; // normalized [0,1]
  y: number; // normalized [0,1]
  w: number; // normalized [0,1]
  h: number; // normalized [0,1]
  caption: string;
  confidence: number;
}

// Enhanced WardrobeItem with detailed garment analysis
export interface WardrobeItem {
  id: string;
  userId: string;
  name: string;
  category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'bag' | 'accessory' | 'other';
  subcategory: string;
  
  // Detailed garment analysis fields
  colorName?: string;
  colorHex?: string;
  secondaryColors?: string[];
  pattern?: 'solid' | 'stripe' | 'check' | 'floral' | 'dots' | 'graphic' | 'logo' | 'camo' | 'other';
  materialFamily?: 'cotton' | 'denim' | 'wool' | 'cashmere' | 'silk' | 'linen' | 'leather' | 'synthetic' | 'blend' | 'other';
  fit?: 'skinny' | 'slim' | 'regular' | 'relaxed' | 'oversized' | 'tailored' | 'unknown';
  length?: 'crop' | 'short' | 'midi' | 'ankle' | 'full' | 'unknown';
  rise?: 'low' | 'mid' | 'high' | 'na';
  sleeve?: 'sleeveless' | 'short' | 'three-quarter' | 'long' | 'na';
  neckline?: 'crew' | 'v-neck' | 'buttoned' | 'collared' | 'scoop' | 'turtleneck' | 'na';
  dominantFinish?: 'matte' | 'sheen' | 'satin' | 'gloss' | 'suede' | 'distressed' | 'quilted' | 'ribbed' | 'cable' | 'none';
  brandText?: string;
  notes?: string;
  confidence?: number;
  
  // Legacy fields for backward compatibility
  colors: string[];
  materials: string[];
  patterns: string[];
  style: string;
  occasion: string[];
  season: string[];
  brand?: string;
  size?: string;
  
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

// AI Analysis Response Interface
export interface GarmentAnalysisItem {
  id: string;
  category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'bag' | 'accessory' | 'other';
  subcategory: string;
  colorName: string;
  colorHex: string;
  secondaryColors: string[];
  pattern: 'solid' | 'stripe' | 'check' | 'floral' | 'dots' | 'graphic' | 'logo' | 'camo' | 'other';
  materialFamily: 'cotton' | 'denim' | 'wool' | 'cashmere' | 'silk' | 'linen' | 'leather' | 'synthetic' | 'blend' | 'other';
  fit: 'skinny' | 'slim' | 'regular' | 'relaxed' | 'oversized' | 'tailored' | 'unknown';
  length: 'crop' | 'short' | 'midi' | 'ankle' | 'full' | 'unknown';
  rise: 'low' | 'mid' | 'high' | 'na';
  sleeve: 'sleeveless' | 'short' | 'three-quarter' | 'long' | 'na';
  neckline: 'crew' | 'v-neck' | 'buttoned' | 'collared' | 'scoop' | 'turtleneck' | 'na';
  dominantFinish: 'matte' | 'sheen' | 'satin' | 'gloss' | 'suede' | 'distressed' | 'quilted' | 'ribbed' | 'cable' | 'none';
  brandText?: string;
  notes?: string;
  confidence: number;
}

export interface GarmentAnalysisResponse {
  items: GarmentAnalysisItem[];
  warnings: string[];
}

export interface IngestionResult {
  success: boolean;
  items: WardrobeItem[];
  warnings?: string[];
  error?: string;
}

export interface OutfitSuggestion {
  id: string;
  userId: string;
  items: string[]; // wardrobe item IDs
  occasion: string;
  season: string;
  style: string;
  why: string; // one-line explanation
  createdAt: Date;
}

export interface ColorCapsulePlan {
  id: string;
  userId: string;
  name: string;
  looks: {
    name: string;
    items: string[]; // wardrobe item IDs
    description: string;
  }[];
  generatedImages: string[]; // public URLs
  createdAt: Date;
}

// API Request/Response interfaces
export interface DetectPeopleRequest {
  imageUrl: string;
}

export interface DetectPeopleResponse {
  success: boolean;
  people: BoundingBox[];
  error?: string;
}

export interface IngestRequest {
  imageUrl: string;
  userId: string;
}

export interface IngestResponse {
  success: boolean;
  result: IngestionResult;
  error?: string;
}

export interface SparkRequest {
  userId: string;
  occasion?: string;
  season?: string;
}

export interface SparkResponse {
  success: boolean;
  outfit: OutfitSuggestion;
  error?: string;
}

export interface PaletteRequest {
  userId: string;
  colorGoals?: string[];
}

export interface PaletteResponse {
  success: boolean;
  capsule: ColorCapsulePlan;
  error?: string;
}

// Application constants
export const APP_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  COMPRESSION_QUALITY: 0.8,
  THUMBNAIL_SIZE: 300,
  MIN_CONFIDENCE_THRESHOLD: 0.3,
} as const;

export const API_ENDPOINTS = {
  DETECT_PEOPLE: 'detectPeopleEndpoint',
  INGEST: 'ingestEndpoint',
  SPARK: 'sparkEndpoint',
  PALETTE: 'paletteEndpoint',
} as const;

export const FIREBASE_COLLECTIONS = {
  WARDROBE: 'wardrobe',
  OUTFITS: 'outfits',
  COLOR_CAPSULES: 'colorCapsules',
  USERS: 'users',
} as const;
