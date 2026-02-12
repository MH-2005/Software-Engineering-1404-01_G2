import { API_CONFIG } from '../config/api';
import { authHelper } from '../utils/authHelper';

const FAVORITES_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.TEAM_PREFIX}/api/favorites`;

export interface FavoriteToggleResponse {
  message: 'added' | 'removed';
  is_favorite: boolean;
}

export interface FavoriteCheckResponse {
  is_favorite: boolean;
  facility_id: string;
}

export interface FavoritePlace {
  id: string;
  place_id: string;
  place_name: string;
  place_address: string;
  place_category: string;
  place_rating: number;
  place_image?: string;
  latitude: number;
  longitude: number;
}


export const favoritesService = {
  /**
   * Toggle favorite status for a facility
   */
  async toggleFavorite(facilityId: number): Promise<FavoriteToggleResponse> {
    const response = await fetch(`${FAVORITES_URL}/toggle/`, {
      method: 'POST',
      headers: authHelper.getAuthHeaders(),
      body: JSON.stringify({
        facility: facilityId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to toggle favorite');
    }

    return response.json();
  },

  /**
   * Check if a facility is favorited
   */
  async checkFavorite(facilityId: number): Promise<boolean> {
    const response = await fetch(`${FAVORITES_URL}/check/?facility=${facilityId}`, {
      method: 'GET',
      headers: authHelper.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to check favorite status');
    }

    const data: FavoriteCheckResponse = await response.json();
    return data.is_favorite;
  },

  /**
   * Get all user favorites
   */
  async getFavorites(): Promise<FavoritePlace[]> {
    const response = await fetch(FAVORITES_URL, {
      method: 'GET',
      headers: authHelper.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }

    return response.json();
  }
};
