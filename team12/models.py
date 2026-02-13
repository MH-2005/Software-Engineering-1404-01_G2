from django.db import models

class Region(models.Model):
    region_id = models.CharField(max_length=100, unique=True)
    region_name = models.CharField(max_length=255)

    def __str__(self):
        return self.region_name


class Place(models.Model):
    STYLE_CHOICES = [
        ('SOLO', 'Solo'), ('COUPLE', 'Couple'), ('FAMILY', 'Family'),
        ('FRIENDS', 'Friends'), ('BUSINESS', 'Business'),
    ]
    BUDGET_CHOICES = [
        ('ECONOMY', 'Economy'), ('MODERATE', 'Moderate'), ('LUXURY', 'Luxury'),
    ]
    SEASON_CHOICES = [
        ('SPRING', 'Spring'), ('SUMMER', 'Summer'), ('FALL', 'Fall'), ('WINTER', 'Winter')
    ]

    place_id = models.CharField(max_length=255, primary_key=True, unique=True)
    place_name = models.CharField(max_length=255)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='places', null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    base_score = models.FloatField(max_digits=3, decimal_places=2, default=1.0)
    wiki_summary = models.TextField(blank=True, null=True)
    ai_tags = models.JSONField(default=dict, blank=True, null=True)  # {"tag": "value"}
    ai_suitability_scores = models.JSONField(default=dict, blank=True, null=True)  # {"SINGLE": 0.8, "COUPLE": 0.6, ...}
    ai_reasoning_base = models.TextField(blank=True, null=True)  # Explanation for the scores    
    image_url = models.URLField(blank=True, null=True)
    
    def __str__(self):
        return self.place_name


