from django.conf import settings
from django.db import models


class Trip(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "پیش‌نویس"
        ACTIVE = "active", "فعال"
        DONE = "done", "تمام‌شده"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="team10_trips",
    )

    destination_name = models.CharField(max_length=120)
    origin_name = models.CharField(max_length=120, blank=True, default="")

    days = models.PositiveIntegerField(default=1)
    start_at = models.DateField(null=True, blank=True)

    people = models.PositiveIntegerField(default=1)
    budget = models.BigIntegerField(null=True, blank=True)

    total_cost = models.BigIntegerField(null=True, blank=True)

    # لیست سبک‌ها مثل ["nature", "history"]
    styles = models.JSONField(default=list, blank=True)

    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.DRAFT
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.destination_name} ({self.days} days)"
