from django.http import JsonResponse
from django.shortcuts import render
from core.auth import api_login_required
from .models import Place
from .score import *
import json
from django.views.decorators.csrf import csrf_exempt

TEAM_NAME = "team12"

@api_login_required
def ping(request):
    return JsonResponse({"team": TEAM_NAME, "ok": True})

def base(request):
    return render(request, f"{TEAM_NAME}/index.html")

@api_login_required
@csrf_exempt
def get_recommendations(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)
        
        # 1. Basic validation
        candidate_ids = data.get('candidate_place', [])
        if not candidate_ids:
            return JsonResponse({"scored_places": [], "message": "No candidates provided"}, status=200)

        places = Place.objects.filter(place_id__in=candidate_ids)
        if not places.exists():
            return JsonResponse({"scored_places": [], "message": "None of the candidate IDs found in database"}, status=200)

        # 2. Extract inputs
        user_style = data.get('Travel_style')
        user_budget = data.get('Budget_level')
        user_duration = data.get('Trip_duration')
        user_season = data.get('Season') 
        
        score_map = {p.place_id: 1.0 for p in places}
        applied_any = False

        # 3. Scoring Blocks with Strict Validation
        if user_style:
            user_style = str(user_style).upper()
            if user_style not in styleIndex:
                return JsonResponse({"error": f"Invalid Travel_style. Options: {list(styleIndex.keys())}"}, status=400)
            applied_any = True
            for p_id, val in scoreByStyle(places, user_style):
                score_map[p_id] *= val

        if user_budget:
            user_budget = str(user_budget).upper()
            if user_budget not in budgetIndex:
                return JsonResponse({"error": f"Invalid Budget_level. Options: {list(budgetIndex.keys())}"}, status=400)
            applied_any = True
            for p_id, val in scoreByBudget(places, user_budget):
                score_map[p_id] *= val

        if user_season:
            user_season = str(user_season).upper()
            if user_season not in seasonIndex:
                return JsonResponse({"error": f"Invalid Season. Allowed: {list(seasonIndex.keys())}"}, status=400)
            applied_any = True
            for p_id, val in scoreBySeason(places, user_season):
                score_map[p_id] *= val

        if user_duration is not None:
            try:
                dur = float(user_duration)
                if dur < 0:
                    return JsonResponse({"error": "Trip_duration cannot be negative"}, status=400)
                applied_any = True
                for p_id, val in scoreByDuration(places, dur):
                    score_map[p_id] *= val
            except (ValueError, TypeError):
                return JsonResponse({"error": "Invalid Trip_duration. Must be a numeric value."}, status=400)

        # 4. Final Processing
        scored_places = []
        for p_id, total in score_map.items():
            final_val = total if applied_any else 1.0 
            scored_places.append({
                "place_id": p_id,
                "score": round(final_val, 4)
            })

        # Sort by score descending
        scored_places.sort(key=lambda x: x['score'], reverse=True)

        return JsonResponse({"scored_places": scored_places})

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)