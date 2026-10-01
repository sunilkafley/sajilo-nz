from django.contrib import admin
from .models import Guide

@admin.register(Guide)
class GuideAdmin(admin.ModelAdmin):
    list_display = ['title', 'language', 'status', 'is_sample', 'verified_on', 'next_review_on']
    list_filter = ['language', 'status', 'is_sample']
    search_fields = ['title', 'slug']
    readonly_fields = ['updated_at']
    fieldsets = [('Content', {'fields': ('slug', 'language', 'stage', 'title', 'summary', 'body', 'sources', 'checklist_ids')}),
                ('Human review and publication', {'description': 'Review each language separately. Content edits must first be saved as drafts and clear the old review. Record only an actual review.',
                 'fields': ('is_sample', 'reviewed_by', 'verified_on', 'next_review_on', 'status', 'updated_at')})]
