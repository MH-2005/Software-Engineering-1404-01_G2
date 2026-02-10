from django.urls import path
from . import views

app_name = "team10"

urlpatterns = [
    path("", views.home, name="home"),
    path("trips/", views.trips_list, name="trips_list"),
    path("trips/<int:trip_id>/", views.trip_detail, name="trip_detail"),
    path("trips/<int:trip_id>/cost/", views.trip_cost, name="trip_cost"),
    path("trips/<int:trip_id>/styles/", views.trip_styles, name="trip_styles"),
    path("trips/<int:trip_id>/replan/", views.trip_replan, name="trip_replan"),
    path("create/", views.create_trip, name="create_trip"),
]
