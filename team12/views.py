from django.http import JsonResponse
from django.shortcuts import render
from core.auth import api_login_required
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.http import require_http_methods
from django.conf import settings


TEAM_NAME = "team12"
CORE_BASE = settings.CORE_BASE_URL.rstrip('/')   # http://core:8000


@api_login_required
@require_http_methods(["GET"])
def ping(request):
    return JsonResponse({"team": TEAM_NAME, "ok": True})

def base(request):
    return render(request, f"{TEAM_NAME}/index.html")

@method_decorator(api_login_required, name='dispatch')
class RecommendAPIView(APIView):
    def post(self, request):
        url_name = request.resolver_match.url_name
        data = request.data

        if url_name == "recommend-places":
            return self.handle_recommend_places(data)
        elif url_name == "recommend-regions":
            return self.handle_recommend_regions(data)
        elif url_name == "recommend-places-in-region":
            return self.handle_places_in_region(data)
        
        return Response({"error": "Invalid Endpoint"}, status=404)

    def handle_recommend_places(self, data):
        required = ["candidate_place_id", "Travel_style", "Budget_level", "Trip_duration"]
        if not all(k in data for k in required):
            return Response({"error": "Missing fields for place recommendation"}, status=400)
        
        # TODO: منطق دریافت دیتا از Core و فیلترینگ [cite: 107]
        # TODO: اضافه کردن تگ‌های AI
        
        result = [
            {"place_id": data.get("candidate_place_id"), "score": 0.95},
            {"place_id": "other_id", "score": 0.85}
        ]
        return Response({"scored_places": result})

    def handle_recommend_regions(self, data):
        required = ["Limit", "Season"]
        if not all(k in data for k in required):
            return Response({"error": "Missing fields for region recommendation"}, status=400)

        result = [
            {
                "region_id": "reg_10",
                "region_name": "شمال ایران",
                "match_score": 0.88,
                "image_url": "http://example.com/north.jpg"
            }
        ]
        return Response({"destinations": result})

    def handle_places_in_region(self, data):
        required = ["Region_id", "Budget_level", "Travel_style"]
        if not all(k in data for k in required):
            return Response({"error": "Missing fields for region-specific places"}, status=400)

        result = [
            {"place_id": "p_50", "score": 0.75}
        ]
        return Response({"scored_places": result})