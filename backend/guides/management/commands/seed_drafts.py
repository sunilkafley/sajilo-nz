from django.core.management.base import BaseCommand
from guides.models import Guide

class Command(BaseCommand):
    help = 'Create unreviewed draft starters; never overwrites existing content or publishes.'
    def handle(self, *args, **options):
        drafts = [
            ('travel-documents', 'en', 'Prepare your travel documents', 'Keep your travel documents together.',
             'Use Immigration New Zealand’s official guidance to check the documents relevant to your travel.\n\nKeep your passport, eVisa and offer of place accessible. Review the requirements for your own circumstances.',
             'Immigration New Zealand', 'https://www.immigration.govt.nz/', ['passport', 'visa', 'offer', 'document-copies']),
            ('travel-documents', 'ne', 'यात्राका कागजात तयार राख्नुहोस्', 'यात्राका आवश्यक कागजात एकै ठाउँमा राख्नुहोस्।',
             'आफ्नो यात्राका लागि चाहिने कागजातबारे अध्यागमन न्युजिल्यान्डको आधिकारिक जानकारी हेर्नुहोस्।\n\nराहदानी, ई-भिसा र अध्ययनको प्रस्तावपत्र सजिलै निकाल्न मिल्ने गरी राख्नुहोस्। आफ्नो अवस्थाअनुसार आवश्यक कुरा जाँच्नुहोस्।',
             'Immigration New Zealand', 'https://www.immigration.govt.nz/', ['passport', 'visa', 'offer', 'document-copies']),
            ('packing-biosecurity', 'en', 'Check what you are packing', 'Check official biosecurity guidance before packing.',
             'Read the Ministry for Primary Industries guidance before deciding what to pack.\n\nCheck the New Zealand Traveller Declaration website for the declaration process. These links are starting points, not personalised advice.',
             'Ministry for Primary Industries', 'https://www.mpi.govt.nz/', ['biosecurity', 'declaration'])]
        for slug, language, title, summary, body, source, url, ids in drafts:
            _, created = Guide.objects.get_or_create(slug=slug, language=language, defaults={
                'title': title, 'summary': summary, 'body': body, 'sources': [{'title': source, 'url': url}], 'checklist_ids': ids})
            self.stdout.write(f'{slug}/{language}: {"draft created" if created else "unchanged"}')
