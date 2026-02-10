from data.repository import TripRepository

class TripService:

    @staticmethod
    def create_trip(destination: str):
        if not destination:
            raise ValueError("Destination required")
        return TripRepository.create_trip(destination)

    @staticmethod
    def get_trips():
        return TripRepository.list_trips()
