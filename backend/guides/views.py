from django.utils import timezone
from rest_framework import generics, serializers
from rest_framework.exceptions import ValidationError
from .models import Guide

class GuideSerializer(serializers.ModelSerializer):
    review_overdue = serializers.SerializerMethodField()
    def get_review_overdue(self, obj):
        return obj.next_review_on <= timezone.localdate()
    class Meta:
        model = Guide
        fields = ['slug', 'language', 'stage', 'title', 'summary', 'body', 'sources', 'checklist_ids', 'verified_on', 'next_review_on', 'review_overdue']

class PublicGuides:
    serializer_class = GuideSerializer
    def get_queryset(self):
        language = self.request.query_params.get('lang', 'en')
        if language not in ('en', 'ne'):
            raise ValidationError({'lang': 'Choose en or ne.'})
        return Guide.objects.filter(status='published', is_sample=False, language=language,
            reviewed_by__isnull=False, verified_on__lte=timezone.localdate(), next_review_on__isnull=False).exclude(sources=[])

class GuideList(PublicGuides, generics.ListAPIView):
    pass

class GuideDetail(PublicGuides, generics.RetrieveAPIView):
    lookup_field = 'slug'
