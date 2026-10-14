from django.db.models import Q
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from rest_framework import generics, serializers
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny

from .models import Article, Course, DirectoryEntry, LANGUAGES, STAGES, TOPICS


class EditorialSerializer(serializers.ModelSerializer):
    source_kind = serializers.CharField(source='source.kind')
    source_hostname = serializers.CharField(source='source.hostname')
    review_overdue = serializers.SerializerMethodField()

    def get_review_overdue(self, obj):
        return obj.next_review_on <= timezone.localdate()


PUBLIC_FIELDS = ['slug', 'language', 'topic', 'stage', 'title', 'summary', 'body', 'tags',
                 'source_url', 'source_kind', 'source_hostname', 'verified_on', 'next_review_on', 'review_overdue']


class ArticleSerializer(EditorialSerializer):
    source_kind = serializers.CharField(source='source.kind', default=None, allow_null=True)
    source_hostname = serializers.CharField(source='source.hostname', default=None, allow_null=True)

    class Meta:
        model = Article
        fields = [*PUBLIC_FIELDS, 'sections', 'article_type']


class CourseSerializer(EditorialSerializer):
    class Meta:
        model = Course
        fields = [*PUBLIC_FIELDS, 'provider', 'city', 'subject', 'qualification_level',
                  'duration', 'intake', 'tuition', 'entry_requirements']


class DirectorySerializer(EditorialSerializer):
    class Meta:
        model = DirectoryEntry
        fields = [*PUBLIC_FIELDS, 'kind', 'city', 'category', 'starts_at', 'ends_at']


class EditorialPagination(PageNumberPagination):
    page_size = 24


class PublicEditorial:
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = EditorialPagination

    @method_decorator(never_cache)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        params = self.request.query_params
        language = params.get('lang', 'en')
        if language not in dict(LANGUAGES):
            raise ValidationError({'lang': 'Choose en or ne.'})
        queryset = self.serializer_class.Meta.model.objects.public().select_related('source').filter(language=language)
        for key, choices in [('topic', TOPICS), ('stage', STAGES)]:
            if key in params:
                if params[key] not in dict(choices):
                    raise ValidationError({key: 'Choose an available filter value.'})
                queryset = queryset.filter(**{key: params[key]})
        query = params.get('q', '').strip()
        if len(query) > 200:
            raise ValidationError({'q': 'Search must be at most 200 characters.'})
        if query:
            # Plain-text search; no HTML/SQL evaluation and never bypasses public().
            queryset = queryset.filter(Q(title__icontains=query) | Q(summary__icontains=query) | Q(body__icontains=query))
        return queryset


class ArticleList(PublicEditorial, generics.ListAPIView):
    serializer_class = ArticleSerializer


class ArticleDetail(PublicEditorial, generics.RetrieveAPIView):
    serializer_class = ArticleSerializer
    lookup_field = 'slug'


class CourseList(PublicEditorial, generics.ListAPIView):
    serializer_class = CourseSerializer

    filter_fields = ['city', 'qualification_level', 'subject', 'provider', 'duration', 'intake']

    def get_queryset(self):
        # Reuse all public eligibility/language checks before discovery filters.
        queryset = super().get_queryset()
        query = self.request.query_params.get('q', '').strip()
        if query:
            # The shared search does not include provider or subject; rebuild only
            # the search predicate, never the publication boundary.
            queryset = Course.objects.public().select_related('source').filter(
                language=self.request.query_params.get('lang', 'en'))
            for key in ['topic', 'stage']:
                if key in self.request.query_params:
                    queryset = queryset.filter(**{key:self.request.query_params[key]})
            queryset = queryset.filter(Q(title__icontains=query) | Q(summary__icontains=query) |
                Q(body__icontains=query) | Q(provider__icontains=query) | Q(subject__icontains=query))
        for key in self.filter_fields:
            value = self.request.query_params.get(key, '')
            if not value:
                continue
            if len(value) > 200:
                raise ValidationError({key: 'Filter value is too long.'})
            if key == 'qualification_level':
                if value not in [str(level) for level in range(1, 11)]:
                    raise ValidationError({key: 'Choose a level from 1 to 10.'})
                value = int(value)
            queryset = queryset.filter(**{key:value})
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        public = Course.objects.public().filter(language=request.query_params.get('lang', 'en'))
        # Facets never reveal drafts, other languages or disabled-source records.
        response.data['facets'] = {key: list(public.exclude(**{key:None} if key == 'qualification_level' else {key:''})
            .order_by(key).values_list(key, flat=True).distinct()) for key in self.filter_fields}
        return response


class CourseDetail(PublicEditorial, generics.RetrieveAPIView):
    serializer_class = CourseSerializer
    lookup_field = 'slug'


class DirectoryList(PublicEditorial, generics.ListAPIView):
    serializer_class = DirectorySerializer


class DirectoryDetail(PublicEditorial, generics.RetrieveAPIView):
    serializer_class = DirectorySerializer
    lookup_field = 'slug'
