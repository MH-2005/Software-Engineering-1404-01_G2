from django.http import JsonResponse
from django.shortcuts import render
from core.auth import api_login_required
from django.utils.decorators import method_decorator
import requests

from rest_framework.views import APIView
from django.views.decorators.http import require_http_methods
from django.conf import settings
from .models import Place
from .score import *
import json


TEAM_NAME = "team12"
CORE_BASE = settings.CORE_BASE_URL.rstrip('/')   # http://core:8000
WIKI_SERVICE_URL = "http://wiki-service:8000/api/place-info/"
MEDIA_SERVICE_URL = "http://media-service:8000/api/stats/"


@api_login_required
@require_http_methods(["GET"])
def ping(request):
    return JsonResponse({"team": TEAM_NAME, "ok": True})

def base(request):
    return render(request, f"{TEAM_NAME}/index.html")

def fetch_external_data(self, place_id):
    context = {"wiki": {}, "media": {}}
    try:
        wiki_res = requests.get(f"{WIKI_SERVICE_URL}?place_id={place_id}", timeout=2)
        if wiki_res.status_code == 200:
            context["wiki"] = wiki_res.json()

        media_res = requests.get(f"{MEDIA_SERVICE_URL}?place_id={place_id}", timeout=2)
        if media_res.status_code == 200:
            context["media"] = media_res.json()
    except Exception as e:
        print(f"Error fetching from external services: {e}")
    
    return context

@method_decorator(api_login_required, name='dispatch')
class RecommendAPIView(APIView):
    def post(self, request):
        url_name = request.resolver_match.url_name
        data = json.loads(request.body)

        if url_name == "recommend-places":
            return self.handle_recommend_places(data)
        elif url_name == "recommend-regions":
            return self.handle_recommend_regions(data)
        elif url_name == "recommend-places-in-region":
            return self.handle_places_in_region(data)
        
        return JsonResponse({"error": "Invalid Endpoint"}, status=404)

    def handle_recommend_places(self, data):
        required = ["candidate_place", "Travel_style", "Budget_level", "Trip_duration"]
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing fields for place recommendation"}, status=400)
            
        user_style = data.get('Travel_style')
        user_budget = data.get('Budget_level')
        user_duration = data.get('Trip_duration')
        candidate_ids = data.get('candidate_place', []) 

        places = Place.objects.filter(place_id__in=candidate_ids)
        
        # Start with a base score of 1.0 for multiplication
        score_map = {p.place_id: 1.0 for p in places}
        applied_any_score = False

        # 1. Style Scoring
        if user_style:
            applied_any_score = True
            for p_id, val in scoreByStyle(places, user_style):
                score_map[p_id] *= val
        
        # 2. Budget Scoring
        if user_budget:
            applied_any_score = True
            for p_id, val in scoreByBudget(places, user_budget):
                score_map[p_id] *= val

        # 3. Duration Scoring
        if user_duration:
            applied_any_score = True
            for p_id, val in scoreByDuration(places, user_duration):
                score_map[p_id] *= val

        scored_places = []
        for p_id, total in score_map.items():
            # If no metrics were provided, we should probably return 0 or a neutral score
            final_val = total if applied_any_score else 0.0
            scored_places.append({
                "place_id": p_id,
                "score": round(final_val, 4)
            })

        # Sort by score descending
        scored_places.sort(key=lambda x: x['score'], reverse=True)

        return JsonResponse({"scored_places": scored_places})

    def handle_recommend_regions(self, data):
        required = ["Limit", "Season"]
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing fields for region recommendation"}, status=400)

        result = [
            {
                "region_id": "reg_10",
                "region_name": "شمال ایران",
                "match_score": 0.88,
                "image_url": "http://example.com/north.jpg"
            }
        ]
        return JsonResponse({"destinations": result})
    
    def handle_places_in_region(self, data):
        required = ["Region_id", "Budget_level", "Travel_style"]
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing fields for region-specific places"}, status=400)
        result = [
            {"place_id": "p_50", "score": 0.75}
        ]
        return JsonResponse({"scored_places": result})
