"""
Facility Service Client - Communicates with Team 4's Facility Service (REST)
"""
import logging
import requests
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


class FacilityClient:
    """
    Client for communicating with Facility Service via REST API (Team 4)
    Fallback to mocks if configured or connection fails.
    """

    def __init__(self, base_url: str = 'http://localhost:8000/team4/api', use_mocks: bool = False):
        self.base_url = base_url.rstrip('/')
        self.use_mocks = use_mocks
        if self.use_mocks:
            logger.info("FacilityClient initializes in MOCK mode")
        else:
            logger.info(f"FacilityClient initialized with base_url: {self.base_url}")

    def search_places(
            self,
            province: str,
            city: Optional[str] = None,
            categories: Optional[List[str]] = None,
            budget_level: Optional[str] = None,
            limit: int = 20
    ) -> List[Dict]:
        """
        Search for places based on criteria
        Protocol: POST /facilities/search/
        """
        if self.use_mocks:
            return self._get_mock_places(province, city, categories, limit)

        try:
            # Prepare payload for Team 4 API
            payload = {}
            if province:
                payload['province'] = province
            if city:
                payload['city'] = city
            if categories:
                # API accepts single category string, we might need to loop or pick first?
                # The doc says "category": "string". If we have multiple, we might need multiple calls or just send one.
                # For now, let's send the first one if available.
                payload['category'] = categories[0]

            if budget_level:
                # Map our budget levels to theirs if needed
                # Ours: ECONOMY, MEDIUM, LUXURY
                # Theirs: free, budget, moderate, expensive, luxury
                budget_map = {
                    'ECONOMY': 'budget',
                    'MEDIUM': 'moderate',
                    'LUXURY': 'luxury',
                    'UNLIMITED': 'luxury'
                }
                payload['price_tier'] = budget_map.get(budget_level, 'moderate')

            # Pagination
            params = {'page': 1, 'page_size': limit}

            response = requests.post(
                f"{self.base_url}/facilities/search/",
                json=payload,
                params=params,
                timeout=5
            )
            response.raise_for_status()
            data = response.json()

            # Map response to our internal format
            results = []
            for item in data.get('results', []):
                results.append(self._map_place_to_internal(item))

            return results

        except Exception as e:
            logger.error(f"Error in search_places: {e}. Falling back to mocks.")
            return self._get_mock_places(province, city, categories, limit)

    def get_place_by_id(self, place_id: str) -> Optional[Dict]:
        """Get detailed information about a specific place"""
        if self.use_mocks:
            return self._get_mock_place(place_id)

        try:
            # Assuming place_id is an integer for Team 4, but we use strings mostly.
            # If our internal IDs are "place_001", we might need to handle that.
            # Team 4 IDs are integers.
            clean_id = place_id
            if str(place_id).startswith('place_'):
                 # It's a mock ID, fallback to mock
                 return self._get_mock_place(place_id)

            response = requests.get(
                f"{self.base_url}/facilities/{clean_id}/",
                timeout=5
            )
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return self._map_place_to_internal(response.json(), detailed=True)

        except Exception as e:
            logger.error(f"Error in get_place_by_id: {e}")
            return self._get_mock_place(place_id)

    def check_availability(
            self,
            place_id: str,
            date: str,
            start_time: str,
            end_time: str
    ) -> Dict:
        """Check if a place is available (Mock only for now)"""
        return {'is_available': True, 'reason': '', 'suggested_times': []}

    def _map_place_to_internal(self, item: Dict, detailed: bool = False) -> Dict:
        """Map Team 4 API response to our internal dictionary format"""
        # Team 4: fac_id, name_fa, category (string or obj), ...
        
        # Handle Category: could be string or object
        category = "OTHER"
        cat_raw = item.get('category')
        if isinstance(cat_raw, dict):
             cat_name = cat_raw.get('name_en', '').upper()
        else:
             cat_name = str(cat_raw).upper()
        
        # Simple mapping heuristics
        if 'HOTEL' in cat_name or 'STAY' in cat_name: category = 'STAY'
        elif 'RESTAURANT' in cat_name or 'DINING' in cat_name or 'CAFE' in cat_name: category = 'DINING'
        elif 'PARK' in cat_name or 'NATURE' in cat_name: category = 'NATURAL'
        elif 'MUSEUM' in cat_name or 'HISTORICAL' in cat_name: category = 'HISTORICAL'
        elif 'MOSQUE' in cat_name or 'RELIGIOUS' in cat_name: category = 'RELIGIOUS'
        
        # Lat/Lng
        lat, lng = 0.0, 0.0
        loc = item.get('location')
        if isinstance(loc, dict) and loc.get('coordinates'):
            # GeoJSON is [lng, lat]
            lng, lat = loc['coordinates']

        # Price Tier
        price_tier_map = {
             'free': 'FREE', 'budget': 'BUDGET', 'moderate': 'MODERATE', 
             'expensive': 'EXPENSIVE', 'luxury': 'LUXURY'
        }
        price_tier = price_tier_map.get(item.get('price_tier'), 'MODERATE')
        
        # Entry Fee
        entry_fee = 0
        price_info = item.get('price_from')
        if isinstance(price_info, dict):
             entry_fee = price_info.get('amount', 0)

        # Images
        images = []
        if item.get('primary_image'):
             images.append(item['primary_image'])
        if detailed and item.get('images'):
             for img in item.get('images', []):
                  if isinstance(img, dict) and img.get('image_url'):
                       images.append(img['image_url'])

        return {
            'id': str(item.get('fac_id')),
            'title': item.get('name_fa'),
            'category': category,
            'address': item.get('address') or f"{item.get('city')} - {item.get('province')}",
            'lat': lat,
            'lng': lng,
            'entry_fee': entry_fee,
            'price_tier': price_tier,
            'description': item.get('description_fa') or item.get('name_en'),
            'images': images,
            'opening_hours': {'24/7': item.get('is_24_hour', False)},
            'rating': float(item.get('avg_rating') or 0),
            'review_count': item.get('review_count', 0)
        }

    def _get_mock_places(
            self,
            province: str,
            city: Optional[str],
            categories: Optional[List[str]],
            limit: int
    ) -> List[Dict]:
        """Mock data for development - generates places for any province/city"""
        location = city if city else province

        # Template places that adapt to any location
        mock_templates = [
            {
                'id': f'mock_hist_1_{province}',
                'title': f'بنای تاریخی {location}',
                'category': 'HISTORICAL',
                'address': f'{province}، {location}',
                'lat': 32.65, 'lng': 51.67,
                'entry_fee': 200000,
                'price_tier': 'BUDGET',
                'description': f'بنای تاریخی مشهور در {location}',
                'images': [],
                'opening_hours': {'daily': '08:00-18:00'},
                'rating': 4.5, 'review_count': 500
            },
            {
                'id': f'mock_hist_2_{province}',
                'title': f'مسجد جامع {location}',
                'category': 'RELIGIOUS',
                'address': f'{province}، {location}',
                'lat': 32.66, 'lng': 51.68,
                'entry_fee': 0,
                'price_tier': 'FREE',
                'description': f'مسجد تاریخی {location}',
                'images': [],
                'opening_hours': {'daily': '06:00-21:00'},
                'rating': 4.7, 'review_count': 800
            },
            {
                'id': f'mock_cult_1_{province}',
                'title': f'موزه {location}',
                'category': 'CULTURAL',
                'address': f'{province}، {location}',
                'lat': 32.67, 'lng': 51.69,
                'entry_fee': 150000,
                'price_tier': 'BUDGET',
                'description': f'موزه فرهنگی و هنری {location}',
                'images': [],
                'opening_hours': {'daily': '09:00-17:00'},
                'rating': 4.4, 'review_count': 350
            },
            {
                'id': f'mock_nature_1_{province}',
                'title': f'پارک طبیعت {location}',
                'category': 'NATURAL',
                'address': f'{province}، {location}',
                'lat': 32.64, 'lng': 51.66,
                'entry_fee': 50000,
                'price_tier': 'BUDGET',
                'description': f'فضای سبز و طبیعی {location}',
                'images': [],
                'opening_hours': {'daily': '07:00-20:00'},
                'rating': 4.3, 'review_count': 600
            },
            {
                'id': f'mock_dining_1_{province}',
                'title': f'رستوران سنتی {location}',
                'category': 'DINING',
                'address': f'{province}، {location}',
                'lat': 32.65, 'lng': 51.67,
                'entry_fee': 0,
                'price_tier': 'MODERATE',
                'description': f'رستوران سنتی با غذاهای محلی {location}',
                'images': [],
                'opening_hours': {'daily': '12:00-23:00'},
                'rating': 4.5, 'review_count': 400
            },
            {
                'id': f'mock_dining_2_{province}',
                'title': f'کافه {location}',
                'category': 'DINING',
                'address': f'{province}، {location}',
                'lat': 32.66, 'lng': 51.68,
                'entry_fee': 0,
                'price_tier': 'BUDGET',
                'description': f'کافه دنج در {location}',
                'images': [],
                'opening_hours': {'daily': '10:00-23:00'},
                'rating': 4.2, 'review_count': 250
            },
            {
                'id': f'mock_stay_1_{province}',
                'title': f'هتل {location}',
                'category': 'STAY',
                'address': f'{province}، {location}',
                'lat': 32.65, 'lng': 51.67,
                'entry_fee': 3000000,
                'price_tier': 'MODERATE',
                'description': f'اقامتگاه مناسب در {location}',
                'images': [],
                'opening_hours': {'24/7': True},
                'rating': 4.3, 'review_count': 300
            },
            {
                'id': f'mock_rec_1_{province}',
                'title': f'مرکز تفریحی {location}',
                'category': 'RECREATIONAL',
                'address': f'{province}، {location}',
                'lat': 32.66, 'lng': 51.69,
                'entry_fee': 100000,
                'price_tier': 'BUDGET',
                'description': f'مرکز تفریحی و سرگرمی {location}',
                'images': [],
                'opening_hours': {'daily': '10:00-22:00'},
                'rating': 4.1, 'review_count': 200
            },
            {
                'id': f'mock_hist_3_{province}',
                'title': f'قلعه تاریخی {location}',
                'category': 'HISTORICAL',
                'address': f'{province}، {location}',
                'lat': 32.63, 'lng': 51.65,
                'entry_fee': 100000,
                'price_tier': 'BUDGET',
                'description': f'قلعه باستانی در نزدیکی {location}',
                'images': [],
                'opening_hours': {'daily': '08:00-17:00'},
                'rating': 4.4, 'review_count': 350
            },
            {
                'id': f'mock_dining_3_{province}',
                'title': f'فست‌فود {location}',
                'category': 'DINING',
                'address': f'{province}، {location}',
                'lat': 32.65, 'lng': 51.68,
                'entry_fee': 0,
                'price_tier': 'BUDGET',
                'description': f'فست‌فود محبوب {location}',
                'images': [],
                'opening_hours': {'daily': '11:00-00:00'},
                'rating': 4.0, 'review_count': 180
            },
            {
                'id': f'mock_cult_2_{province}',
                'title': f'بازار سنتی {location}',
                'category': 'CULTURAL',
                'address': f'{province}، {location}',
                'lat': 32.66, 'lng': 51.67,
                'entry_fee': 0,
                'price_tier': 'FREE',
                'description': f'بازار سنتی و صنایع دستی {location}',
                'images': [],
                'opening_hours': {'daily': '09:00-20:00'},
                'rating': 4.6, 'review_count': 700
            },
            {
                'id': f'mock_nature_2_{province}',
                'title': f'کوهستان {location}',
                'category': 'NATURAL',
                'address': f'{province}، {location}',
                'lat': 32.62, 'lng': 51.64,
                'entry_fee': 0,
                'price_tier': 'FREE',
                'description': f'مسیر کوهنوردی در {location}',
                'images': [],
                'opening_hours': {'24/7': True},
                'rating': 4.5, 'review_count': 400
            },
        ]

        filtered = mock_templates

        # Filter by categories
        if categories:
            filtered = [p for p in filtered if p['category'] in categories]

        return filtered[:limit]

    def _get_mock_place(self, place_id: str) -> Optional[Dict]:
        """Get mock place by ID"""
        places = self._get_mock_places('', None, None, 100)
        for place in places:
            if place['id'] == place_id:
                return place
        return None

    def close(self):
        """Close gRPC connection"""
        if self.channel:
            self.channel.close()
            logger.info("Closed connection to Facility Service")
