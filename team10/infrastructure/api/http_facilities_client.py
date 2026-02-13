import sys
import os
import requests
import logging
from typing import List, Optional

current_file_path = os.path.abspath(__file__)
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(current_file_path))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from team10.infrastructure.ports.facilities_service_port import FacilitiesServicePort
from team10.domain.models.facility import Facility

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HttpFacilitiesClient(FacilitiesServicePort):
    """
    HTTP implementation for the Facilities Service (Team 4).
    Maps the external API JSON response to the internal Facility dataclass.
    """

    def __init__(self, base_url: str):
        """
        :param base_url: e.g., http://localhost:9104
        """
        self.base_url = base_url.rstrip("/")

    def search_facilities(
        self, 
        center_lat: float, 
        center_lon: float, 
        radius_meters: int, 
        categories: List[str] = None
    ) -> List[Facility]:
        """
        Fetches nearby facilities and converts them to Facility objects.
        """
        endpoint = f"{self.base_url}/team4/api/facilities/nearby/"
        
        params = {
            "lat": center_lat,
            "lng": center_lon,
            "radius": radius_meters,
            "page_size": 50
        }
        
        if categories:
            params["categories"] = ",".join(categories)

        try:
            logger.info(f"Requesting facilities from {endpoint} params={params}")
            response = requests.get(endpoint, params=params, timeout=10)

            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                
                facilities = []
                for item in results:
                    place_data = item.get("place", {})
                    facility = self._map_json_to_facility(place_data)
                    if facility:
                        facilities.append(facility)
                
                return facilities
            
            else:
                logger.error(f"Facilities Service Error: {response.status_code}")
                return []

        except requests.exceptions.RequestException as e:
            logger.error(f"Connection error to Facilities Service: {e}")
            return []

    def _map_json_to_facility(self, place_data: dict) -> Optional[Facility]:
        """
        Maps API JSON 'place' object to the internal Facility dataclass.
        """
        try:
            coords = place_data.get("location", {}).get("coordinates", [0.0, 0.0])
            lng = float(coords[0])
            lat = float(coords[1])

            name = place_data.get("name_en")
            if not name or name == "unknown":
                name = place_data.get("name_fa", "Unknown Place")

            amenities_list = place_data.get("amenities", [])
            tags = [a.get("name_en") for a in amenities_list if a.get("name_en")]

            price_tier = place_data.get("price_tier", "unknown")
            estimated_cost = self._estimate_cost(price_tier)

            try:
                rating = float(place_data.get("avg_rating", 0.0))
            except (ValueError, TypeError):
                rating = 0.0

            return Facility(
                id=int(place_data.get("fac_id", 0)),
                name=name,
                facility_type=place_data.get("category", "general"),
                latitude=lat,
                longitude=lng,
                cost=estimated_cost,
                rating=rating,
                tags=tags,
                description=None, 
                region_id=None,   
                visit_duration_minutes=60, 
                opening_hour=8,
                closing_hour=22
            )
        except Exception as e:
            logger.warning(f"Error mapping facility: {e} | ID: {place_data.get('fac_id')}")
            return None

    def _estimate_cost(self, price_tier: str) -> float:
        """
        Helper to convert string price tiers to numeric cost estimates (Rials).
        """
        tier_map = {
            "free": 0.0,
            "budget": 500000.0,      
            "moderate": 2000000.0,   
            "expensive": 5000000.0,  
            "luxury": 10000000.0,   
            "unknown": 0.0
        }
        return tier_map.get(price_tier.lower(), 0.0)

if __name__ == "__main__":
    CLIENT_URL = "http://localhost:9104"
    
    client = HttpFacilitiesClient(base_url=CLIENT_URL)
    
    print("--- Searching for Hotels ---")
    facilities = client.search_facilities(
        center_lat=32.6652296,
        center_lon=51.6691105,
        radius_meters=1000,
        categories=["hotel"]
    )
    
    print(f"Found {len(facilities)} facilities.")
    for f in facilities[:3]:
        print(f"ID: {f.id} | Name: {f.name} | Cost: {f.cost} | Rating: {f.rating}")
        print(f"   Coords: ({f.latitude}, {f.longitude})")
        print(f"   Tags: {f.tags}")
        print("-" * 30)
