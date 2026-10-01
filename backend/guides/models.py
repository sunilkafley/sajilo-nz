from urllib.parse import urlsplit
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.db import models
from django.utils import timezone

OFFICIAL_HOSTS = {'www.immigration.govt.nz', 'www.mpi.govt.nz', 'www.travellerdeclaration.govt.nz'}
TASK_IDS = {'passport', 'visa', 'offer', 'academic', 'insurance', 'accommodation', 'flight', 'emergency-contacts',
            'clothing', 'laptop', 'chargers', 'medication', 'document-copies', 'personal', 'cash', 'cards',
            'emergency-money', 'budget', 'passport-validity', 'visa-conditions', 'confirm-accommodation',
            'airport-transport', 'baggage', 'transit', 'contacts', 'biosecurity', 'declaration'}
CONTENT_FIELDS = ('slug', 'language', 'stage', 'title', 'summary', 'body', 'sources', 'checklist_ids', 'is_sample')

class Guide(models.Model):
    slug = models.SlugField()
    language = models.CharField(max_length=2, choices=[('en', 'English'), ('ne', 'Nepali')])
    stage = models.CharField(max_length=20, default='predeparture', choices=[('predeparture', 'Before you fly')])
    title = models.CharField(max_length=200)
    summary = models.TextField()
    body = models.TextField(help_text='Plain text. Separate paragraphs with blank lines.')
    sources = models.JSONField(default=list, blank=True, help_text='List of objects with title and url. Approved official HTTPS hosts only.')
    checklist_ids = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=10, choices=[('draft', 'Draft'), ('published', 'Published')], default='draft')
    is_sample = models.BooleanField(default=False, help_text='Sample content can never be published.')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    verified_on = models.DateField(null=True, blank=True, help_text='Actual human review date; never a build date.')
    next_review_on = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['slug', 'language'], name='unique_guide_language')]
        ordering = ['title']

    def __str__(self):
        return f'{self.title} ({self.language})'

    def content_changed(self):
        old = type(self).objects.filter(pk=self.pk).first() if self.pk else None
        return old and any(getattr(old, field) != getattr(self, field) for field in CONTENT_FIELDS)

    def clean(self):
        errors = {}
        if not isinstance(self.sources, list):
            errors['sources'] = 'Sources must be a list.'
        else:
            for source in self.sources:
                if not isinstance(source, dict) or not isinstance(source.get('title'), str) or not source['title'].strip():
                    errors['sources'] = 'Each source needs a title and official URL.'
                    break
                url = source.get('url')
                try:
                    URLValidator(schemes=['https'])(url)
                    parts = urlsplit(url)
                    if parts.hostname not in OFFICIAL_HOSTS or parts.username or parts.password or parts.port not in (None, 443):
                        raise ValidationError('Unapproved source host.')
                except (ValidationError, ValueError, TypeError, AttributeError):
                    errors['sources'] = 'Use an approved official HTTPS URL; update the reviewed host allowlist for new sources.'
        if not isinstance(self.checklist_ids, list) or any(not isinstance(item, str) or item not in TASK_IDS for item in self.checklist_ids):
            errors['checklist_ids'] = 'Use valid checklist task IDs.'
        if self.verified_on and self.verified_on > timezone.localdate():
            errors['verified_on'] = 'A review cannot be in the future.'
        if self.next_review_on and self.verified_on and self.next_review_on <= self.verified_on:
            errors['next_review_on'] = 'Next review must follow verification.'
        if self.status == 'published':
            if self.is_sample:
                errors['is_sample'] = 'Sample content must remain a draft.'
            if not self.sources:
                errors['sources'] = 'Publication requires an official source.'
            if not self.reviewed_by_id or not self.verified_on or not self.next_review_on:
                errors['status'] = 'Record the human reviewer, actual review date and next review date before publication.'
            if self.content_changed():
                errors['status'] = 'Save content changes as a draft first, then review and publish in a separate save.'
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        if kwargs.get('update_fields') is not None:
            raise ValueError('Partial saves are unsupported: save the full guide so review invalidation is persisted.')
        if self.status == 'draft' and self.content_changed():
            self.reviewed_by = None
            self.verified_on = None
            self.next_review_on = None
        self.full_clean()
        return super().save(*args, **kwargs)
