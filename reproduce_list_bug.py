
import os
import uuid
import sys

def check_internal():
    # Setup Django environment
    import django
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tripPlanService.settings")
    django.setup()
    
    from presentation.views import TripViewSet
    from rest_framework.test import APIRequestFactory
    from data.models import Trip
    
    factory = APIRequestFactory()
    user_id = str(uuid.uuid4())
    print(f"Internal Test User ID: {user_id}")
    
    # Test Create
    view = TripViewSet.as_view({'post': 'create'})
    data = {
        "title": "Internal Test Trip",
        "province": "Kerman",
        "startDate": "2026-05-01", 
        "budgetLevel": "ECONOMY"
    }
    request = factory.post('/api/trips/', data, format='json')
    request.jwt_user_id = user_id # Mock Middleware
    
    print("Sending Create Request...")
    response = view(request)
    print(f"Create Response: {response.status_code}")
    
    if response.status_code == 201:
        print("Trip created successfully.")
        trip_id = response.data['id']
        
        # Verify it's in DB with correct user_id
        trip = Trip.objects.get(pk=trip_id)
        print(f"DB Trip user_id: {trip.user_id}")
        if trip.user_id == user_id:
             print("SUCCESS: user_id saved correctly.")
        else:
             print(f"FAILURE: user_id mismatch. Expected {user_id}, got {trip.user_id}")
             
        # Test List
        list_view = TripViewSet.as_view({'get': 'list'})
        # Test with query param
        request_list = factory.get('/api/trips/', {'user_id': user_id})
        # Test with implicit jwt_user_id (which view logic should default to if param missing, but here we provide param)
        # However, let's also set jwt_user_id to simulate authenticated request
        request_list.jwt_user_id = user_id
        
        print("Sending List Request...")
        response_list = list_view(request_list)
        print(f"List Response: {response_list.status_code}")
        
        # New format: {"count": X, "results": [...]}
        results = response_list.data.get('results', [])
        print(f"List Count: {len(results)}")
        
        found = any(t['trip_id'] == trip_id for t in results)
        if found:
            print("SUCCESS: Trip found in list.")
        else:
            print("FAILURE: Trip NOT found in list.")
            print(f"List Data: {response_list.data}")
            
    else:
        print(f"Create failed: {response.data}")

if __name__ == "__main__":
    try:
        check_internal()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
