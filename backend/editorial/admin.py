from django import forms
from django.contrib import admin
from django.core.exceptions import PermissionDenied
from django.http import Http404
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils.html import format_html
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_safe
from django.utils.text import slugify

from .models import Article, Course, DirectoryEntry, SourceDomain


@admin.register(SourceDomain)
class SourceDomainAdmin(admin.ModelAdmin):
    list_display = ['hostname', 'kind', 'approved', 'approved_on']
    list_filter = ['kind', 'approved']
    search_fields = ['hostname']
    actions = None
    fields = ['hostname', 'kind', 'approved', 'review_note', 'approved_by', 'approved_on']

    def get_readonly_fields(self, request, obj=None):
        return ['hostname', 'kind'] if obj else []


class EditorialAdmin(admin.ModelAdmin):
    list_display = ['title', 'language', 'topic', 'status', 'is_sample', 'verified_on', 'next_review_on', 'preview_link']
    list_filter = ['status', 'language', 'topic', 'is_sample']
    search_fields = ['title', 'slug', 'summary']
    readonly_fields = ['updated_at', 'preview_link']
    actions = None
    content_fields = []

    def get_fieldsets(self, request, obj=None):
        return [
            ('Content', {'fields': ['slug', 'language', 'topic', 'stage', 'title', 'summary', 'body', 'tags', *self.content_fields]}),
            ('Source attribution', {'fields': ['source', 'source_url'], 'description':
                'Choose the exact source domain and link to the authoritative page. Domain approval is separate from content review.'}),
            ('Review and publication', {'fields': ['status', 'is_sample', 'reviewed_by', 'verified_on', 'next_review_on'],
                'description': 'Save edits as Draft first. This clears prior review. Review each language separately, then record the actual reviewer/dates and publish in a separate save. Withdrawing to Draft also clears review.'}),
            ('Saved-record preview', {'fields': ['preview_link', 'updated_at'],
                'description': 'Save before previewing. This staff-only preview is not a public page or the final visitor layout.'}),
        ]

    @admin.display(description='Preview')
    def preview_link(self, obj):
        if not obj or not obj.pk:
            return 'Save a draft to preview it.'
        url = reverse(f'admin:editorial_{self.model._meta.model_name}_preview', args=[obj.pk])
        return format_html('<a href="{}">Preview saved record</a>', url)

    def get_urls(self):
        return [path('<int:object_id>/preview/', self.admin_site.admin_view(self.preview),
            name=f'editorial_{self.model._meta.model_name}_preview'), *super().get_urls()]

    @method_decorator(never_cache)
    @method_decorator(require_safe)
    def preview(self, request, object_id):
        obj = self.get_object(request, str(object_id))
        if obj is None:
            raise Http404
        if not self.has_view_or_change_permission(request, obj):
            raise PermissionDenied
        details = [(self.model._meta.get_field(name).verbose_name, getattr(obj, name))
                   for name in self.content_fields if name != 'sections']
        response = TemplateResponse(request, 'admin/editorial/preview.html', {
            **self.admin_site.each_context(request), 'title': 'Editorial preview', 'record': obj,
            'sections': getattr(obj, 'sections', []), 'details': details,
            'change_url': reverse(f'admin:editorial_{self.model._meta.model_name}_change', args=[obj.pk]),
        })
        response['X-Robots-Tag'] = 'noindex, nofollow, noarchive'
        response['Referrer-Policy'] = 'no-referrer'
        return response


class ArticleForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = '__all__'
        labels = {'body': 'Content', 'verified_on': 'Reviewed on', 'slug': 'URL name (slug)'}
        help_texts = {'slug': 'Generated from an English title if blank. For Nepali, enter a short Latin-letter URL name; use the same name for corresponding translations.'}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['slug'].required = False

    def clean(self):
        data = super().clean()
        if not data.get('slug'):
            data['slug'] = slugify(data.get('title', ''))[:50].strip('-')
            if not data['slug']:
                self.add_error('slug', 'Enter a Latin-letter URL name under Optional organisation and URL.')
        return data


@admin.register(Article)
class ArticleAdmin(EditorialAdmin):
    form = ArticleForm
    content_fields = ['sections']
    list_filter = ['article_type', *EditorialAdmin.list_filter]

    def get_fieldsets(self, request, obj=None):
        return [
            ('Write your article', {'fields': ['title', 'topic', 'language', 'article_type', 'summary', 'body'],
                'description': 'Start here and save as Draft. Content is plain text; separate paragraphs with blank lines. General information is not a shortcut for unsourced factual advice.'}),
            ('Source attribution', {'classes': ['collapse'], 'fields': ['source', 'source_url'],
                'description': 'Required for Sourced guidance. Optional for General information; if supplied, both fields and an approved official source are required.'}),
            ('Optional sections', {'classes': ['collapse'], 'fields': ['sections'],
                'description': 'You can leave this empty and write everything in Content. Structured sections are optional.'}),
            ('Optional organisation and URL', {'classes': ['collapse'], 'fields': ['slug', 'stage', 'tags']}),
            ('Review and publication', {'fields': ['status', 'is_sample', 'reviewed_by', 'verified_on', 'next_review_on'],
                'description': '1. Save a draft. 2. Preview and review the content, article type and this language. 3. Enter the actual reviewer and dates, then publish. Editing published content or its type requires a draft save and a new review. No dates are filled automatically.'}),
            ('Saved-record preview', {'fields': ['preview_link', 'updated_at']}),
        ]


@admin.register(Course)
class CourseAdmin(EditorialAdmin):
    content_fields = ['provider', 'city', 'subject', 'qualification_level', 'duration', 'intake', 'tuition', 'entry_requirements']


@admin.register(DirectoryEntry)
class DirectoryEntryAdmin(EditorialAdmin):
    content_fields = ['kind', 'city', 'category', 'starts_at', 'ends_at']
