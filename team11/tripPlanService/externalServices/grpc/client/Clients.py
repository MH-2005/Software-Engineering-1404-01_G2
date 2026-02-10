import os

from presentation.grpc.protos import trip_pb2_grpc as pb2_grpc, trip_pb2 as pb2
import grpc

TRIP_PLAN_GRPC_URL = os.getenv("TRIP_PLAN_GRPC_URL", "localhost:59007")

class Clients:

    @staticmethod
    def get_trip_plan_client():
        channel = grpc.insecure_channel(TRIP_PLAN_GRPC_URL)
        stub = pb2_grpc.TripServiceStub(channel)
        return stub

