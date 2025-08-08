/**
 * NeXTMatrix DEM (Data Exchange Matrix) API Client
 * Handles AWS SigV4 signing and federated analytics requests
 */

interface DemConfig {
  baseUrl: string;
  region: string;
  accessKey: string;
  secretKey: string;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

interface SurvivalData {
  km: { t: number[]; s: number[] };
  hazard: { t: number[]; h: number[] };
  percentiles: { p10: number; p50: number; p90: number };
  n: number;
  censored: number;
}

interface PredictionData {
  t: number[];
  s: number[];
  atHorizons: Record<string, number>;
}

interface ComplementStats {
  feature: string;
  failed_mean: number;
  complement_mean: number;
  delta_mean: number;
  failed_iqr: [number, number];
  complement_iqr: [number, number];
  delta_iqr: number;
}

interface TDigestData {
  failed: { bins: number[]; counts: number[] };
  survived: { bins: number[]; counts: number[] };
}

class DemClient {
  private config: DemConfig | null = null;

  constructor() {
    // Initialize with environment variables if available
    this.initializeConfig();
  }

  private initializeConfig() {
    // Using mock configuration for demo purposes
    this.config = {
      baseUrl: 'https://api.nextmatrix.demo',
      region: 'us-west-2',
      accessKey: 'mock-access-key',
      secretKey: 'mock-secret-key',
    };
  }

  private async signRequest(url: string, options: RequestInit = {}): Promise<RequestInit> {
    // In a real implementation, this would perform AWS SigV4 signing
    // For demo purposes, we'll return the options as-is with auth headers
    
    const headers = new Headers(options.headers);
    headers.set('Authorization', `AWS4-HMAC-SHA256 Credential=${this.config?.accessKey}/...`);
    headers.set('X-Amz-Date', new Date().toISOString());
    headers.set('Content-Type', 'application/json');

    return {
      ...options,
      headers,
    };
  }

  async fetch<T = any>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    if (!this.config) {
      return { error: 'DEM client not configured. Please check environment variables.' };
    }

    try {
      const url = `${this.config.baseUrl}${path}`;
      const signedOptions = await this.signRequest(url, options);
      
      // For demo purposes, return mock data instead of making real requests
      return this.getMockResponse<T>(path, options);
      
      // Real implementation would be:
      // const response = await fetch(url, signedOptions);
      // const data = await response.json();
      // return { data };
      
    } catch (error) {
      console.error('DEM API Error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  private getMockResponse<T>(path: string, options: RequestInit): ApiResponse<T> {
    // Mock responses for demonstration
    if (path.includes('/federation/aggregate')) {
      const mockSurvival: SurvivalData = {
        km: {
          t: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
          s: [1.0, 0.98, 0.95, 0.92, 0.88, 0.83, 0.78, 0.72, 0.66, 0.59, 0.52, 0.45, 0.38, 0.31, 0.24, 0.18]
        },
        hazard: {
          t: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
          h: [0.02, 0.022, 0.025, 0.028, 0.032, 0.036, 0.041, 0.047, 0.053, 0.060, 0.068, 0.077, 0.087, 0.098, 0.111, 0.125]
        },
        percentiles: { p10: 35, p50: 89, p90: 145 },
        n: 1542,
        censored: 0.31
      };
      return { data: mockSurvival as T };
    }

    if (path.includes('/models/survival/predict')) {
      const mockPrediction: PredictionData = {
        t: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
        s: [1.0, 0.97, 0.94, 0.90, 0.85, 0.80, 0.74, 0.68, 0.62, 0.55, 0.48, 0.42, 0.35, 0.29, 0.23, 0.18],
        atHorizons: {
          "10": 0.97,
          "50": 0.80,
          "100": 0.48,
          "150": 0.18
        }
      };
      return { data: mockPrediction as T };
    }

    if (path.includes('/exploration/complement-stats')) {
      const mockStats: ComplementStats[] = [
        {
          feature: "RPM",
          failed_mean: 180.5,
          complement_mean: 165.2,
          delta_mean: 15.3,
          failed_iqr: [150, 210],
          complement_iqr: [140, 190],
          delta_iqr: 10
        },
        {
          feature: "WOB",
          failed_mean: 25.8,
          complement_mean: 22.1,
          delta_mean: 3.7,
          failed_iqr: [20, 30],
          complement_iqr: [18, 26],
          delta_iqr: 2
        },
        {
          feature: "ROP",
          failed_mean: 45.2,
          complement_mean: 38.6,
          delta_mean: 6.6,
          failed_iqr: [35, 55],
          complement_iqr: [30, 47],
          delta_iqr: 5
        }
      ];
      return { data: mockStats as T };
    }

    if (path.includes('/exploration/conditional-tdigest')) {
      const mockTDigest: TDigestData = {
        failed: {
          bins: [140, 150, 160, 170, 180, 190, 200, 210, 220],
          counts: [12, 28, 45, 67, 89, 76, 54, 32, 18]
        },
        survived: {
          bins: [130, 140, 150, 160, 170, 180, 190, 200, 210],
          counts: [18, 42, 78, 112, 134, 98, 67, 34, 15]
        }
      };
      return { data: mockTDigest as T };
    }

    return { error: 'Mock endpoint not implemented' };
  }

  // API Methods
  async getFederationPeers(projectId: string): Promise<ApiResponse<string[]>> {
    return this.fetch(`/api/v1/projects/${projectId}/federation/peers`);
  }

  async aggregateData(projectId: string, cohort: any, metrics: string[], horizons: number[]): Promise<ApiResponse<SurvivalData>> {
    return this.fetch(`/api/v1/projects/${projectId}/federation/aggregate`, {
      method: 'POST',
      body: JSON.stringify({ cohort, metrics, horizons })
    });
  }

  async getComplementStats(projectId: string, cohort: any, condition: string, features: string[]): Promise<ApiResponse<ComplementStats[]>> {
    return this.fetch(`/api/v1/projects/${projectId}/exploration/complement-stats`, {
      method: 'POST',
      body: JSON.stringify({ cohort, condition, features })
    });
  }

  async getConditionalTDigest(projectId: string, feature: string, classBy: string, bins: number): Promise<ApiResponse<TDigestData>> {
    return this.fetch(`/api/v1/projects/${projectId}/exploration/conditional-tdigest`, {
      method: 'POST',
      body: JSON.stringify({ feature, classBy, bins })
    });
  }

  async trainSurvivalModel(projectId: string, algo: 'weibull' | 'cox', label: string, censor: string, features: string[], cohort: any): Promise<ApiResponse<{ modelId: string; params: any; metrics: any }>> {
    return this.fetch(`/api/v1/projects/${projectId}/models/survival/train`, {
      method: 'POST',
      body: JSON.stringify({ algo, label, censor, features, cohort })
    });
  }

  async predictSurvival(projectId: string, modelId: string, features: any, horizons: number[]): Promise<ApiResponse<PredictionData>> {
    return this.fetch(`/api/v1/projects/${projectId}/models/survival/predict`, {
      method: 'POST',
      body: JSON.stringify({ modelId, features, horizons })
    });
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  getConfig(): DemConfig | null {
    return this.config;
  }

  updateConfig(config: Partial<DemConfig>) {
    if (this.config) {
      this.config = { ...this.config, ...config };
    }
  }
}

// Export singleton instance
export const demClient = new DemClient();
export type { DemConfig, SurvivalData, PredictionData, ComplementStats, TDigestData };