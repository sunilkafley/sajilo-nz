"""Structured editorial content. Public eligibility is shared by every endpoint."""
import re
from urllib.parse import urlsplit

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator, URLValidator
from django.db import models
from django.utils import timezone


TOPICS = [(key, label) for key, label in (
    ('study', 'Study & courses'), ('immigration', 'Immigration'),
    ('predeparture', 'Prepare to travel'), ('arrival', 'Arrive & settle'),
    ('housing', 'Housing & flatting'), ('money', 'Money & budgeting'),
    ('work', 'Work & careers'), ('community', 'Community'), ('nepal', 'Nepal services'),
    ('transport', 'Travel & transport'), ('support', 'Student support'),
    ('education', 'Education system'), ('aotearoa', 'Get to know Aotearoa'), ('cities', 'City information'),
)]
STAGES = [('predeparture', 'Before you leave'), ('firstweek', 'Arrival / First week'),
          ('settling', 'Settling in'), ('daily', 'Work / Study / Daily life')]
LANGUAGES = [('en', 'English'), ('ne', 'Nepali')]


def validate_strings(value):
    if not isinstance(value, list) or len(value) > 30 or any(
        not isinstance(item, str) or not item.strip() or len(item) > 100 for item in value
    ):
        raise ValidationError('Use a list of up to 30 non-empty text tags (100 characters each).')


def validate_sections(value):
    if not isinstance(value, list) or len(value) > 30 or any(
        not isinstance(section, dict) or set(section) != {'heading', 'body'} or
        any(not isinstance(section[key], str) or not section[key].strip() for key in ('heading', 'body'))
        or len(section['heading']) > 200 or len(section['body']) > 20000 for section in value
    ):
        raise ValidationError('Use up to 30 objects with non-empty heading and body text, not HTML.')


def validate_source_url(value, domain):
    try:
        URLValidator(schemes=['https'])(value)
        parts = urlsplit(value)
        if (parts.hostname != domain or parts.username or parts.password or
                parts.port not in (None, 443) or '\\' in value or any(c.isspace() for c in value)):
            raise ValueError
    except (ValidationError, ValueError, TypeError):
        raise ValidationError('Use an HTTPS URL on the exact approved hostname, without credentials or a custom port.')


class SourceDomain(models.Model):
    hostname = models.CharField(max_length=253, unique=True,
        help_text='Exact lowercase DNS hostname, without scheme, path or wildcard. Identity is immutable after saving.')
    kind = models.CharField(max_length=12, choices=[('official', 'Official authority'),
        ('provider', 'Education provider'), ('community', 'Community organisation'), ('commercial', 'Commercial business')])
    approved = models.BooleanField(default=False)
    review_note = models.TextField(blank=True, help_text='Record how ownership and classification were checked; do not enter secrets.')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    approved_on = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['hostname']

    def __str__(self):
        return f'{self.hostname} ({self.get_kind_display()})'

    def clean(self):
        super().clean()
        if not re.fullmatch(r'(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}', self.hostname):
            raise ValidationError({'hostname': 'Use an exact lowercase public DNS hostname, not an IP, wildcard or URL.'})
        if self.pk:
            old = type(self).objects.get(pk=self.pk)
            if (old.hostname, old.kind) != (self.hostname, self.kind):
                raise ValidationError('Create a new source domain to change hostname or classification; disable the old one.')
        if self.approved_on and self.approved_on > timezone.localdate():
            raise ValidationError({'approved_on': 'Approval cannot be in the future.'})
        if self.approved and (not self.review_note.strip() or not self.approved_on or not self.approved_by_id
                or not self.approved_by.is_active or not self.approved_by.is_staff):
            raise ValidationError('Domain approval requires a rationale, active staff reviewer and actual approval date.')

    def save(self, *args, **kwargs):
        if kwargs.get('update_fields') is not None:
            raise ValueError('Save the full source domain so validation cannot be bypassed.')
        self.full_clean()
        return super().save(*args, **kwargs)


class EditorialQuerySet(models.QuerySet):
    def reviewed(self):
        today = timezone.localdate()
        return self.filter(status='published', is_sample=False, reviewed_by__is_active=True,
            reviewed_by__is_staff=True, verified_on__lte=today,
            next_review_on__gt=models.F('verified_on'))

    def public(self):
        today = timezone.localdate()
        return self.reviewed().filter(source__approved=True,
            source__approved_by__is_active=True, source__approved_by__is_staff=True,
            source__approved_on__lte=today).exclude(source_url='').exclude(source__review_note='')


class ArticleQuerySet(EditorialQuerySet):
    def public(self):
        sourced = super().public().filter(source__kind='official')
        general = self.reviewed().filter(article_type='general', source__isnull=True, source_url='')
        return (sourced | general).filter(article_type__in=['guidance', 'general'])


class EditorialRecord(models.Model):
    slug = models.SlugField()
    language = models.CharField(max_length=2, choices=LANGUAGES, default='en')
    topic = models.CharField(max_length=20, choices=TOPICS)
    stage = models.CharField(max_length=20, choices=STAGES, blank=True)
    title = models.CharField(max_length=200)
    summary = models.TextField()
    body = models.TextField(blank=True, help_text='Plain text only. Separate paragraphs with blank lines.')
    tags = models.JSONField(default=list, blank=True, validators=[validate_strings])
    source = models.ForeignKey(SourceDomain, null=True, blank=True, on_delete=models.PROTECT)
    source_url = models.URLField(max_length=1000, blank=True)
    status = models.CharField(max_length=10, choices=[('draft', 'Draft'), ('published', 'Published')], default='draft')
    is_sample = models.BooleanField(default=False, help_text='Samples can never be published.')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        related_name='%(app_label)s_%(class)s_reviews')
    verified_on = models.DateField(null=True, blank=True)
    next_review_on = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    objects = EditorialQuerySet.as_manager()

    class Meta:
        abstract = True
        ordering = ['title', 'pk']
        constraints = [models.UniqueConstraint(fields=['slug', 'language'], name='%(app_label)s_%(class)s_language')]
        indexes = [models.Index(fields=['language', 'topic'], condition=models.Q(status='published'),
                                name='%(class)s_public_topic')]

    def __str__(self):
        return f'{self.title} ({self.language})'

    def content_changed(self):
        old = type(self).objects.filter(pk=self.pk).first() if self.pk else None
        metadata = {'id', 'status', 'reviewed_by', 'verified_on', 'next_review_on', 'updated_at'}
        return old and any(getattr(old, f.attname) != getattr(self, f.attname)
            for f in self._meta.concrete_fields if f.name not in metadata)

    def allowed_source_kinds(self):
        return {'official'}

    def requires_source(self):
        return True

    def clean(self):
        super().clean()
        errors = {}
        try:
            validate_strings(self.tags)
        except ValidationError as error:
            errors['tags'] = error.messages
        if self.source_url:
            try:
                if not self.source_id:
                    raise ValidationError('Choose a source domain first.')
                validate_source_url(self.source_url, self.source.hostname)
            except ValidationError as error:
                errors['source_url'] = error.messages
        if self.source_id and self.source.kind not in self.allowed_source_kinds():
            errors['source'] = 'Source classification is not appropriate for this record type.'
        if self.verified_on and self.verified_on > timezone.localdate():
            errors['verified_on'] = 'A review cannot be in the future.'
        if self.next_review_on and self.verified_on and self.next_review_on <= self.verified_on:
            errors['next_review_on'] = 'Next review must follow verification.'
        if self.status == 'published':
            if self.content_changed():
                errors['status'] = 'Save content changes as a draft first, then review and publish in a separate save.'
            if self.is_sample:
                errors['is_sample'] = 'Sample content cannot be published.'
            if not self.reviewed_by_id or not self.verified_on or not self.next_review_on:
                errors['status'] = 'Publication requires an actual human reviewer, review date and next review date.'
            elif not self.reviewed_by.is_active or not self.reviewed_by.is_staff:
                errors['reviewed_by'] = 'Choose an active staff reviewer.'
            if (self.requires_source() or self.source_id or self.source_url) and (not self.source_id or not self.source_url):
                errors['source'] = 'Publication requires a source and source URL.'
            elif self.source_id:
                try:
                    self.source.full_clean()
                    if not self.source.approved:
                        raise ValidationError('Source domain has not been approved.')
                except ValidationError:
                    errors['source'] = 'Source domain needs valid human approval before publication.'
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        if kwargs.get('update_fields') is not None:
            raise ValueError('Save the full record so review invalidation is persisted.')
        old = type(self).objects.filter(pk=self.pk).first() if self.pk else None
        if self.status == 'draft' and (self.content_changed() or (old and old.status == 'published')):
            self.reviewed_by = None
            self.verified_on = None
            self.next_review_on = None
        self.full_clean()
        return super().save(*args, **kwargs)


class Article(EditorialRecord):
    article_type = models.CharField(max_length=10, default='guidance', choices=[
        ('guidance', 'Sourced guidance'), ('general', 'General information')],
        help_text='Use General information only for original introductions, welcome pages or site instructions. Factual advice about visas, rights, health, housing or money must use Sourced guidance. Human review is required for both types and each translation.')
    objects = ArticleQuerySet.as_manager()
    sections = models.JSONField(default=list, blank=True, validators=[validate_sections],
        help_text='Optional sections: [{"heading": "Section title", "body": "Plain text"}]. No HTML.')

    def requires_source(self):
        return self.article_type != 'general'

    def clean(self):
        super().clean()
        try:
            validate_sections(self.sections)
        except ValidationError as error:
            raise ValidationError({'sections': error.messages})
        if self.status == 'published' and not self.body.strip() and not self.sections:
            raise ValidationError({'body': 'Published articles need body text or sections.'})


class Course(EditorialRecord):
    provider = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    subject = models.CharField(max_length=100)
    qualification_level = models.PositiveSmallIntegerField(null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(10)])
    duration = models.CharField(max_length=100, blank=True)
    intake = models.CharField(max_length=200, blank=True)
    tuition = models.TextField(blank=True, help_text='Source-attributed fee information; leave blank until reviewed.')
    entry_requirements = models.TextField(blank=True)

    def allowed_source_kinds(self):
        return {'official', 'provider'}

    def clean(self):
        super().clean()
        if self.topic != 'study':
            raise ValidationError({'topic': 'Courses belong to Study & courses.'})


class DirectoryEntry(EditorialRecord):
    kind = models.CharField(max_length=15, choices=[('organisation', 'Organisation'),
        ('business', 'Business'), ('event', 'Event')])
    city = models.CharField(max_length=100, help_text='City or National; no detected visitor location.')
    category = models.CharField(max_length=100)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)

    class Meta(EditorialRecord.Meta):
        verbose_name_plural = 'directory entries'

    def allowed_source_kinds(self):
        return {'commercial'} if self.kind == 'business' else {'official', 'community'}

    def clean(self):
        super().clean()
        if self.kind != 'event' and (self.starts_at or self.ends_at):
            raise ValidationError('Only events may have event times.')
        if self.ends_at and (not self.starts_at or self.ends_at <= self.starts_at):
            raise ValidationError({'ends_at': 'End must follow the event start.'})
        if self.kind == 'event' and self.status == 'published' and not self.starts_at:
            raise ValidationError({'starts_at': 'Published events need a sourced start time.'})
