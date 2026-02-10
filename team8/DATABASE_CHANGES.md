# Database Architecture Changes

## Summary of Updates

### 1. **Backend Database (PostgreSQL with PostGIS)**
   - **Location**: `team8/backend/db/migrations/001_initial_schema.sql`
   - **Image**: `postgis/postgis:16-3.4-alpine` in docker-compose
   
   **Key Changes:**
   - ✅ Added PostGIS extension for geographic data
   - ✅ Created custom ENUMs: `content_status`, `report_status`, `report_target`
   - ✅ **Denormalized user fields**: Added `user_name`, `user_email` to `media`, `comments`, `ratings` tables
   - ✅ Changed `places.location` from lat/lng to `GEOGRAPHY(POINT, 4326)`
   - ✅ Updated status values: `PENDING_AI`, `PENDING_ADMIN`, `APPROVED`, `REJECTED`
   - ✅ Added sophisticated indexes including GIST spatial index

### 2. **AI Service Database (PostgreSQL)**
   - **Location**: `team8/ai-service/db/migrations/001_initial_schema.sql`
   - **Image**: `postgres:16-alpine` in docker-compose
   
   **Key Changes:**
   - ✅ Created `analysis_status` ENUM (PENDING, PROCESSING, COMPLETED, FAILED)
   - ✅ Added `status` and `error_message` columns for tracking
   - ✅ Added unique constraints to prevent duplicate completed analysis
   - ✅ Added indexes on status and reference IDs
   
   **Tables:**
   - `media_analysis` - Analysis results for photos/videos
   - `text_analysis` - Spam detection for comments
   - `place_summaries` - AI-generated place summaries

### 3. **Backend Django Models**
   - **File**: `team8/backend/models.py`
   
   **Changes:**
   - ✅ Rewrote from scratch to match SQL schema exactly
   - ✅ Changed all primary keys to match SQL (`category_id`, `place_id`, `media_id`, etc.)
   - ✅ Added denormalized user fields: `user_name`, `user_email`, `reporter_email`
   - ✅ Changed `Place.location` to PostGIS `PointField(geography=True, srid=4326)`
   - ✅ Updated status choices to match ENUMs
   - ✅ Added proper indexes and constraints
   - ✅ Used `db_column` for explicit column naming

### 4. **AI Service Models**
   - **File**: `team8/ai-service/models.py` (NEW)
   
   **Changes:**
   - ✅ Created SQLAlchemy models for AI database
   - ✅ Added `AnalysisStatus` enum
   - ✅ Models: `MediaAnalysis`, `TextAnalysis`, `PlaceSummary`

### 5. **AI Service Database Layer**
   - **File**: `team8/ai-service/database.py` (NEW)
   
   **Changes:**
   - ✅ SQLAlchemy engine and session management
   - ✅ `get_db()` dependency for FastAPI
   - ✅ Reads `AI_DATABASE_URL` from environment

### 6. **Docker Compose**
   - **File**: `team8/docker-compose.yml`
   
   **Changes:**
   - ✅ Changed main postgres to `postgis/postgis:16-3.4-alpine`
   - ✅ Added separate `ai-postgres` service
   - ✅ Updated migration paths: `./backend/db/migrations` and `./ai-service/db/migrations`
   - ✅ Added `AI_DATABASE_URL` environment variable to ai-service
   - ✅ Added `ai_postgres_data` volume

### 7. **Dependencies**
   - **Backend** (`backend/requirements.txt`):
     - ✅ Added `djangorestframework-gis==1.0` for GeoDjango REST support
   
   - **AI Service** (`ai-service/requirements.txt`):
     - ✅ Added `sqlalchemy==2.0.25`
     - ✅ Added `psycopg2-binary==2.9.9`
     - ✅ Added `asyncpg==0.29.0`

### 8. **Settings**
   - **File**: `team8/backend/settings.py`
   
   **Changes:**
   - ✅ Added `django.contrib.gis` to INSTALLED_APPS
   - ✅ Added `rest_framework_gis` to INSTALLED_APPS

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Team 8 Microservice                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐        ┌──────────────┐                     │
│  │   Backend   │───────>│  postgres    │                     │
│  │   (Django)  │        │  (PostGIS)   │                     │
│  │             │        │              │                     │
│  │ - Media     │        │ - categories │                     │
│  │ - Comments  │        │ - places     │                     │
│  │ - Ratings   │        │ - media      │                     │
│  └─────────────┘        │ - comments   │                     │
│        │                │ - ratings    │                     │
│        │ API Call       │ - reports    │                     │
│        v                │ - activity   │                     │
│  ┌─────────────┐        └──────────────┘                     │
│  │ AI Service  │                                             │
│  │  (FastAPI)  │        ┌──────────────┐                     │
│  │             │───────>│ ai-postgres  │                     │
│  │ - Spam Det  │        │              │                     │
│  │ - Place Rec │        │ - media_analysis                   │
│  └─────────────┘        │ - text_analysis                    │
│                         │ - place_summaries                  │
│                         └──────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

## Key Benefits

1. **Database Isolation**: Backend and AI services have independent databases
2. **Denormalized User Data**: No need to call Core API to get user names/emails for display
3. **PostGIS Integration**: Efficient geographic queries for nearby places
4. **Type Safety**: PostgreSQL ENUMs enforce valid status values
5. **Analysis Tracking**: AI service can track processing status and failures
6. **Performance**: Proper indexes on all foreign keys and frequently queried columns

## Migration Path

1. **Stop all containers**: `docker-compose down -v`
2. **Pull new images**: `docker-compose pull`
3. **Start services**: `docker-compose up -d`
4. **Verify migrations**: Both databases will auto-initialize from SQL files

## Next Steps

1. Create Django migrations: `python manage.py makemigrations && python manage.py migrate`
2. Update serializers to handle denormalized user fields
3. Update ViewSets to populate `user_name`, `user_email` from `request.user_data`
4. Update AI service `main.py` to use database models
5. Test geographic queries with PostGIS
