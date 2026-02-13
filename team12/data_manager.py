import requests
from django.conf import settings
from .models import Place
from .ai_service import generate_ai_metadata_for_place

CORE_URL = getattr(settings, 'CORE_BASE_URL', 'http://core:8000')


def fetch_wiki_data(place_id):
    try:
        url = f"{CORE_URL}/api/wiki/content?place={place_id}"
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return data.get("summary", ""), data.get("tags", [])
    except:
        pass
    return "", []


def fetch_engagement_data(place_id):
    try:
        url = f"{CORE_URL}/api/v1/engagement?entityType=place&entityId={place_id}&commentLimit=0&includeMedia=false"
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            summary = resp.json().get("ratingSummary", {})
            return float(summary.get("avg", 0.0)) if summary else 0.0
    except:
        pass
    return 3.0


def get_or_enrich_places(candidate_place_ids):
    existing_places = Place.objects.filter(place_id__in=candidate_place_ids)
    existing_ids = set(p.place_id for p in existing_places)

    missing_ids = set(candidate_place_ids) - existing_ids
    new_places = []

    for pid in missing_ids:
        summary, tags = fetch_wiki_data(pid)
        avg_rating = fetch_engagement_data(pid)

        ai_data = generate_ai_metadata_for_place(pid, summary, tags, avg_rating)

        new_place = Place(
            place_id=pid,
            name=pid.replace("-", " ").title(),
            base_rate=avg_rating,
            ai_tags=ai_data.get("ai_tags", []),
            ai_suitability_scores=ai_data.get("ai_suitability_scores", {}),
            ai_reasoning_base=ai_data.get("ai_reasoning_base", "")
        )
        new_places.append(new_place)

    if new_places:
        Place.objects.bulk_create(new_places)

    return Place.objects.filter(place_id__in=candidate_place_ids)