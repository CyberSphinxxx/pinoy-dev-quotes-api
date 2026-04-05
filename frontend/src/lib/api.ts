/**
 * OWNS: Centralized API Client
 * DO: All fetch calls to the backend live here.
 * DON'T: Use raw fetch() in components. Import from here.
 */

import { API_CONFIG } from './constants';

export interface Quote {
  id: number;
  quote: string;
  author: string;
  language: string;
  dialect?: string;
  english_translation?: string;
  tags?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
  error?: string;
}

export class ApiClient {
  private static BASE_URL = API_CONFIG.BASE_URL;

  /**
   * Universal fetcher with error handling
   */
  private static async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.BASE_URL}${path}`;
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle different content types
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      if (contentType?.includes('text/xml') || contentType?.includes('application/xml')) {
        return (await response.text()) as unknown as T;
      }
      if (contentType?.includes('image/')) {
        return (await response.blob()) as unknown as T;
      }

      return (await response.text()) as unknown as T;
    } catch (error: any) {
      console.error(`[API Error] ${url}:`, error);
      throw error;
    }
  }

  /**
   * Fetches data from an endpoint
   */
  public static async fetchEndpoint<T>(path: string, method: string = 'GET', apiKey?: string): Promise<T> {
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    return this.request<T>(path, { method, headers });
  }

  /**
   * Specialized method for random quote
   */
  public static async getRandomQuote(count?: number): Promise<ApiResponse<Quote | Quote[]>> {
    const query = count ? `?count=${count}` : '';
    return this.request<ApiResponse<Quote | Quote[]>>(`/api/v1/random${query}`);
  }

  // Add more methods as needed...
}
