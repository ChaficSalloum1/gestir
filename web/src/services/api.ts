import { 
  DetectPeopleRequest, 
  DetectPeopleResponse, 
  IngestRequest, 
  IngestResponse, 
  SparkRequest, 
  SparkResponse, 
  PaletteRequest, 
  PaletteResponse 
} from '../types';

const FUNCTIONS_BASE = import.meta.env.VITE_FUNCTIONS_BASE;

class ApiService {
  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${FUNCTIONS_BASE}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async detectPeople(request: DetectPeopleRequest): Promise<DetectPeopleResponse> {
    return this.makeRequest<DetectPeopleResponse>('detectPeopleEndpoint', request);
  }

  async ingest(request: IngestRequest): Promise<IngestResponse> {
    return this.makeRequest<IngestResponse>('ingestEndpoint', request);
  }

  async spark(request: SparkRequest): Promise<SparkResponse> {
    return this.makeRequest<SparkResponse>('sparkEndpoint', request);
  }

  async palette(request: PaletteRequest): Promise<PaletteResponse> {
    return this.makeRequest<PaletteResponse>('paletteEndpoint', request);
  }
}

export const apiService = new ApiService();




