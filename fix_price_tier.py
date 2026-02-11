import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app404.settings')
django.setup()

from django.db import connections

# SQL to add price_tier column
sql = """
ALTER TABLE facilities_facility 
ADD COLUMN price_tier VARCHAR(20) NOT NULL DEFAULT 'unknown';
"""

try:
    # Use team4 database connection
    with connections['team4'].cursor() as cursor:
        cursor.execute(sql)
        print("✅ Successfully added price_tier column to facilities_facility table")
except Exception as e:
    print(f"Error: {e}")
    if "Duplicate column name" in str(e) or "duplicate column name" in str(e).lower():
        print("Column already exists!")
