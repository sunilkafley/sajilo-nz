"""Authoring helpers. Model validation remains the publication authority."""
from copy import copy
from urllib.parse import urlsplit

from django.core.exceptions import ValidationError
from django.utils import timezone

from .models import SourceDomain


def approved_article_source(url):
    """Match an already approved exact host; never create or approve a domain."""
    try:
        hostname = urlsplit(url).hostname
    except ValueError:
        return None
    return SourceDomain.objects.filter(hostname=hostname, kind='official', approved=True,
        approved_by__is_active=True, approved_by__is_staff=True,
        approved_on__lte=timezone.localdate()).first()


def article_readiness(article, reviewer=None):
    if not article or not article.pk:
        return ['Save your draft before reviewing and publishing it.']
    candidate = copy(article)
    candidate.status = 'published'
    # Assess the proposed publisher without recording a review or changing the record.
    if reviewer is not None:
        candidate.reviewed_by = reviewer
    try:
        candidate.full_clean()
    except ValidationError as error:
        return list(dict.fromkeys(error.messages))
    return []
