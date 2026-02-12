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
from team10.domain.models.facility import Facility, Location, FacilityType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HttpFacilitiesClient(FacilitiesServicePort):
    """
    HTTP implementation for the Facilities Service.
    """

    def __init__(self, base_url: str):
        """
        :param base_url: e.g., http://localhost:9104 (Team 4 URL)
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
        Fetches nearby facilities based on coordinates and radius.
        Maps the external API JSON response to the internal Facility domain model.
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
            logger.info(f"Requesting facilities from {endpoint} with params: {params}")
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
                logger.error(f"Facilities Service Error: {response.status_code} - {response.text}")
                return []

        except requests.exceptions.RequestException as e:
            logger.error(f"Connection error to Facilities Service: {e}")
            return []

    def _map_json_to_facility(self, place_data: dict) -> Optional[Facility]:
        """
        Helper method to convert API JSON 'place' object to internal Facility model.
        """
        try:
            coords = place_data.get("location", {}).get("coordinates", [0, 0])
            lng, lat = coords[0], coords[1]

            name = place_data.get("name_en")
            if not name or name == "unknown":
                name = place_data.get("name_fa", "Unknown Place")

            amenities_list = place_data.get("amenities", [])
            amenities = [a.get("name_en") for a in amenities_list if a.get("name_en")]

            return Facility(
                id=str(place_data.get("fac_id")),
                name=name,
                category=place_data.get("category", "general"),
                location=Location(lat=lat, lon=lng, address=place_data.get("address", "")),
                rating=float(place_data.get("avg_rating", 0.0)),
                price_level=place_data.get("price_tier", "unknown"),
                amenities=amenities
            )
        except Exception as e:
            logger.warning(f"Error mapping facility data: {e} | Data: {place_data.get('fac_id')}")
            return None

if __name__ == "__main__":
    CLIENT_URL = "http://localhost:9116" 
    
    client = HttpFacilitiesClient(base_url=CLIENT_URL)
    
    print("--- Searching for Hotels in Isfahan ---")
    facilities = client.search_facilities(
        center_lat=32.6652296,
        center_lon=51.6691105,
        radius_meters=1000,
        categories=["hotel"]
    )
    
    print(f"Found {len(facilities)} facilities.")
    for f in facilities[:3]:
        print(f"- [{f.category}] {f.name} (Rating: {f.rating})")
