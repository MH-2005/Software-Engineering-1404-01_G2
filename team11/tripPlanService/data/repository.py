from .models import Trip

class TripRepository:

    @staticmethod
    def create_trip(destination: str):
        return Trip.objects.create(destination=destination)

    @staticmethod
    def list_trips():
        return Trip.objects.all()
