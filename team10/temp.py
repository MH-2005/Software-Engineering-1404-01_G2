# scaffold_team10.py
from pathlib import Path

ROOT = Path("team10")

DIRS = [
    "__pycache__",  # harmless if ignored; you can remove this line if you want
    "api/controllers",
    "api/dtos",
    "domain/entities",
    "domain/enums",
    "domain/models",
    "domain/services",
    "application/services",
    "application/orchestrators",
    "infrastructure/ports",
    "infrastructure/models",
    "infrastructure/clients",
    "pipeline/stages",
    "events/listener",
    "events/events",
    "templates/team10",
    "static/team10",
    "migrations",
]

FILES = [
    "__init__.py",
    "apps.py",
    "admin.py",
    "urls.py",
    "views.py",
    "models.py",

    "api/__init__.py",
    "api/controllers/__init__.py",
    "api/controllers/trip_controller.py",
    "api/dtos/__init__.py",
    "api/dtos/trip_dto.py",
    "api/dtos/trip_create_request.py",
    "api/dtos/style_update_request.py",
    "api/dtos/cost_analysis_response.py",
    "api/dtos/budget_check_request.py",
    "api/dtos/change_trigger_dto.py",

    "domain/__init__.py",
    "domain/entities/__init__.py",
    "domain/entities/trip.py",
    "domain/entities/daily_plan.py",
    "domain/entities/hotel_schedule.py",
    "domain/entities/trip_requirements.py",
    "domain/entities/preference_constraint.py",

    "domain/enums/__init__.py",
    "domain/enums/activity_type.py",
    "domain/enums/place_source_type.py",
    "domain/enums/trip_status.py",
    "domain/enums/season.py",
    "domain/enums/transport_mode.py",
    "domain/enums/weather_condition.py",

    "domain/models/__init__.py",
    "domain/models/weather_info.py",
    "domain/models/rule_adjustment.py",
    "domain/models/cost_analysis_result.py",
    "domain/models/facility.py",
    "domain/models/constraint_violation.py",
    "domain/models/budget_constraint.py",
    "domain/models/change_trigger.py",

    "domain/services/__init__.py",
    "domain/services/seasonal_rules_engine.py",
    "domain/services/budget_validator.py",
    "domain/services/time_distance_calculator.py",
    "domain/services/constraint_evaluator.py",

    "application/__init__.py",
    "application/services/__init__.py",
    "application/services/trip_planning_service.py",
    "application/orchestrators/__init__.py",
    "application/orchestrators/trip_orchestrator.py",
    "application/orchestrators/trip_context.py",

    "infrastructure/__init__.py",
    "infrastructure/ports/__init__.py",
    "infrastructure/ports/map_service_port.py",
    "infrastructure/ports/facilities_service_port.py",
    "infrastructure/ports/wiki_service_port.py",
    "infrastructure/ports/weather_service_port.py",
    "infrastructure/ports/recommendation_service_port.py",

    "infrastructure/models/__init__.py",
    "infrastructure/models/location.py",
    "infrastructure/models/coordinates.py",
    "infrastructure/models/search_criteria.py",
    "infrastructure/models/facility_cost_estimate.py",
    "infrastructure/models/destination_info.py",
    "infrastructure/models/weather_forecast.py",
    "infrastructure/models/recommended_item.py",

    "infrastructure/clients/__init__.py",
    "infrastructure/clients/map_client.py",
    "infrastructure/clients/facilities_client.py",
    "infrastructure/clients/wiki_client.py",
    "infrastructure/clients/weather_client.py",
    "infrastructure/clients/recommendation_client.py",

    "pipeline/__init__.py",
    "pipeline/stages/__init__.py",
    "pipeline/stages/collect_data_stage.py",
    "pipeline/stages/prioritize_activities_stage.py",
    "pipeline/stages/cluster_and_route_stage.py",
    "pipeline/stages/budget_analysis_stage.py",
    "pipeline/stages/time_constraints_validation_stage.py",
    "pipeline/stages/seasonal_weather_filter_stage.py",
    "pipeline/stages/final_arrangement_stage.py",

    "events/__init__.py",
    "events/listener/__init__.py",
    "events/listener/external_event_listener.py",
    "events/events/__init__.py",
    "events/events/facility_status_changed_event.py",
    "events/events/weather_alert_event.py",
    "events/events/event_cancelled_event.py",

    "migrations/__init__.py",

    "docker-compose.yml",
    "gateway.conf",
    "Dockerfile",
]

TEMPLATES = {
    "apps.py": """from django.apps import AppConfig

class Team10Config(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "team10"
""",
    "urls.py": """from django.urls import path
from .api.controllers.trip_controller import ping

urlpatterns = [
    path("ping/", ping, name="team10_ping"),
]
""",
    "api/controllers/trip_controller.py": """from django.http import JsonResponse

def ping(request):
    return JsonResponse({"team": 10, "service": "trip-plan", "status": "ok"})
""",
}

def ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)

def write_file_if_missing(path: Path, content: str = "") -> None:
    if path.exists():
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")

def main():
    ensure_dir(ROOT)

    for d in DIRS:
        ensure_dir(ROOT / d)

    for f in FILES:
        rel = Path(f)
        content = TEMPLATES.get(f, "")

        # auto-fill __init__.py with minimal content
        if rel.name == "__init__.py" and content == "":
            content = ""

        write_file_if_missing(ROOT / rel, content)

    print(f"Scaffold created/updated under: {ROOT.resolve()} (no existing files overwritten)")

if __name__ == "__main__":
    main()
