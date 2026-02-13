from django.urls import path, include
from . import views

TEAM_PREFIX = "team12/"

urlpatterns = [
    path("", views.base, name="base"),
    path("ping/", views.ping, name="ping"),

    path("api/recommend-places/", views.ScoreCandidatePlacesView.as_view(), name="recommend-places"),
    path("api/recommend-regions/", views.SuggestRegionsView.as_view(), name="recommend-regions"),
    path("api/recommend-places-in-region/", views.SuggestPlacesInRegionView.as_view(), name="recommend-places-in-region"),
]