from django import forms
from django.contrib import admin, messages
from django.core.exceptions import PermissionDenied
from django.http import Http404
from django.http import HttpResponseRedirect
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils.html import format_html
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_safe
from django.utils.text import slugify

from .models import Article, Course, DirectoryEntry, SourceDomain
from .publishing import approved_article_source, article_readiness


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
            'can_review_article': isinstance(obj, Article) and self.has_change_permission(request, obj),
        })
        response['X-Robots-Tag'] = 'noindex, nofollow, noarchive'
        response['Referrer-Policy'] = 'no-referrer'
        return response


class ArticleForm(forms.ModelForm):
    confirm_review = forms.BooleanField(required=False, label='I have reviewed this saved version in the selected language.',
        help_text='Publishing records you as the reviewer. Check the content, article type and required official sources before confirming.')
    class Meta:
        model = Article
        fields = '__all__'
        labels = {'body': 'Content', 'verified_on': 'Reviewed on', 'slug': 'URL name (slug)'}
        help_texts = {'slug': 'Generated from an English title if blank. For Nepali, enter a short Latin-letter URL name; use the same name for corresponding translations.'}

    def __init__(self, *args, actor=None, **kwargs):
        self.actor = actor
        super().__init__(*args, **kwargs)
        if 'slug' not in self.fields:  # Django removes editable fields for view-only staff.
            return
        self.fields['slug'].required = False
        self.fields['status'].widget = forms.HiddenInput()
        self.fields['reviewed_by'].widget = forms.HiddenInput()
        self.fields['source_url'].label = 'Official source link'
        self.fields['source_url'].help_text = 'Paste the exact HTTPS page. A matching approved official domain is selected when you save; no domain is approved automatically.'
        self.fields['source'].label = 'Source domain (optional when the link matches)'
        self.fields['source'].queryset = SourceDomain.objects.filter(kind='official')
        self.fields['verified_on'].help_text = 'Enter the date you actually checked this version and its sources. Never filled automatically.'
        self.fields['next_review_on'].help_text = 'Choose when this content should be checked again, after the review date.'

    def clean(self):
        data = super().clean()
        if '_save_draft' in self.data or '_preview' in self.data:
            data['status'] = 'draft'
        if '_publish' in self.data:
            data['status'] = 'published'
        if data.get('source_url') and not data.get('source'):
            data['source'] = approved_article_source(data['source_url'])
            if not data['source']:
                self.add_error('source_url', 'No approved official domain matches this link. Save without the link for now, or ask a source administrator to approve its exact hostname.')
        if data.get('status') == 'published':
            if not self.instance.pk:
                self.add_error(None, 'Save and preview a draft before publishing.')
            if not data.get('confirm_review'):
                self.add_error('confirm_review', 'Confirm that you reviewed this saved version in its selected language before publishing.')
            elif not self.actor or not self.actor.is_active or not self.actor.is_staff:
                self.add_error('confirm_review', 'An active staff reviewer must publish this article.')
            else:
                data['reviewed_by'] = self.actor
        if not data.get('slug'):
            data['slug'] = slugify(data.get('title', ''))[:50].strip('-')
            if not data['slug']:
                self.add_error('slug', 'Enter a Latin-letter URL name under Optional organisation and URL.')
        return data

    def _post_clean(self):
        super()._post_clean()
        # The workflow hides these model controls; their validation errors must
        # remain visible at the top rather than inside a hidden form row.
        for name in ('status', 'reviewed_by'):
            errors = self._errors.pop(name, None)
            if errors:
                self.add_error(None, errors)


@admin.register(Article)
class ArticleAdmin(EditorialAdmin):
    form = ArticleForm
    change_form_template = 'admin/editorial/article/change_form.html'
    content_fields = ['sections']
    list_filter = ['article_type', *EditorialAdmin.list_filter]

    def get_form(self, request, obj=None, **kwargs):
        base_form = super().get_form(request, obj, **kwargs)
        class StaffArticleForm(base_form):
            def __init__(self, *args, **form_kwargs):
                super().__init__(*args, actor=request.user, **form_kwargs)
        return StaffArticleForm

    def render_change_form(self, request, context, add=False, change=False, form_url='', obj=None):
        saved = Article.objects.filter(pk=obj.pk).first() if obj and obj.pk else None
        context['publication_issues'] = article_readiness(saved, reviewer=request.user)
        context['article_status'] = saved.get_status_display() if saved else 'New draft'
        context['publishing_reviewer'] = request.user.get_username()
        context['can_publish_article'] = self.has_change_permission(request, obj)
        return super().render_change_form(request, context, add, change, form_url, obj)

    def article_response(self, request, obj):
        if ('_save_draft' in request.POST or '_preview' in request.POST) and not self.has_view_or_change_permission(request, obj):
            self.message_user(request, 'Draft saved. It is not published.', messages.SUCCESS)
            return HttpResponseRedirect(reverse('admin:index'))
        if '_preview' in request.POST:
            self.message_user(request, 'Draft saved. This preview is private.', messages.SUCCESS)
            return HttpResponseRedirect(reverse('admin:editorial_article_preview', args=[obj.pk]))
        if '_save_draft' in request.POST:
            self.message_user(request, 'Draft saved. It is not published.', messages.SUCCESS)
            return HttpResponseRedirect(reverse('admin:editorial_article_change', args=[obj.pk]))
        if '_publish' in request.POST:
            self.message_user(request, 'Article published with your recorded review.', messages.SUCCESS)
            return HttpResponseRedirect(reverse('admin:editorial_article_change', args=[obj.pk]))

    def response_add(self, request, obj, post_url_continue=None):
        return self.article_response(request, obj) or super().response_add(request, obj, post_url_continue)

    def response_change(self, request, obj):
        return self.article_response(request, obj) or super().response_change(request, obj)

    def get_fieldsets(self, request, obj=None):
        fieldsets = [
            ('Write your article', {'fields': ['title', 'topic', 'language', 'article_type', 'summary', 'body'],
                'description': 'Start here and save as Draft. Content is plain text; separate paragraphs with blank lines. General information is not a shortcut for unsourced factual advice.'}),
            ('Source attribution', {'fields': ['source_url'],
                'description': 'Required for Sourced guidance. Optional for General information; if supplied, both fields and an approved official source are required.'}),
            ('Source settings (optional)', {'classes': ['collapse'], 'fields': ['source'],
                'description': 'Usually selected from the official source link when you save. Choose manually only if needed. Source approval is a separate administrator task.'}),
            ('Optional sections', {'classes': ['collapse'], 'fields': ['sections'],
                'description': 'You can leave this empty and write everything in Content. Structured sections are optional.'}),
            ('Optional organisation and URL', {'classes': ['collapse'], 'fields': ['slug', 'stage', 'tags']}),
            ('Review and publication', {'fields': ['status', 'reviewed_by', 'verified_on', 'next_review_on', 'confirm_review'],
                'description': 'Save and preview first. Then check this version, enter the actual review dates and confirm your review. Publish article records the signed-in staff member as reviewer. Content changes need a draft save before publishing.'}),
            ('Test content', {'classes': ['collapse'], 'fields': ['is_sample'], 'description': 'Sample content cannot be published.'}),
            ('Saved-record preview', {'fields': ['preview_link', 'updated_at']}),
        ]
        if not obj:
            for title, options in fieldsets:
                if title == 'Review and publication':
                    options['classes'] = ['collapse']
        if obj and not self.has_change_permission(request, obj):
            for _, options in fieldsets:
                options['fields'] = [field for field in options['fields'] if field != 'confirm_review']
        return fieldsets


@admin.register(Course)
class CourseAdmin(EditorialAdmin):
    content_fields = ['provider', 'city', 'subject', 'qualification_level', 'duration', 'intake', 'tuition', 'entry_requirements']


@admin.register(DirectoryEntry)
class DirectoryEntryAdmin(EditorialAdmin):
    content_fields = ['kind', 'city', 'category', 'starts_at', 'ends_at']
