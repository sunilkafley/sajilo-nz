from django.core.management.base import BaseCommand
from guides.models import Guide
from guides.christchurch_drafts import SLUG, SOURCES, TASK_IDS, TEXT

class Command(BaseCommand):
    help = 'Create unreviewed draft starters; never overwrites existing content or publishes.'
    def handle(self, *args, **options):
        # Draft source research is not human review. Keep review metadata unset.
        travel_sources = [
            {'title': 'INZ — Before you travel to New Zealand',
             'url': 'https://www.immigration.govt.nz/visit/what-you-need-to-visit-new-zealand/before-you-travel-to-new-zealand/'},
            {'title': 'INZ — Using eVisas and visa labels',
             'url': 'https://www.immigration.govt.nz/process-to-apply/once-you-have-a-visa/manage-your-visa-and-passport/using-evisas-and-visa-labels/'},
            {'title': 'INZ — Fee Paying Student Visa',
             'url': 'https://www.immigration.govt.nz/visas/fee-paying-student-visa/'},
        ]
        drafts = [
            ('travel-documents', 'en', 'Prepare your travel documents',
             'Check your passport and eVisa, organise study documents and keep private copies ready.',
             '1. Check your passport. Before packing, check its expiry and condition against Immigration New Zealand’s “Before you travel” guidance. Use the requirements that apply to your travel document and circumstances.\n\n'
             '2. Prepare your eVisa. Print your eVisa letter and carry it when travelling to New Zealand. Read its dates and conditions. Check the details against your passport; contact INZ about errors. If you have a new passport, follow INZ’s visa-transfer process before travelling.\n\n'
             '3. Organise study documents. As a planning step, keep your offer of place or enrolment confirmation accessible and ask your education provider what to bring for arrival. INZ’s Fee Paying Student Visa page explains study evidence for that visa; this is not a claim that every traveller must show an offer at the border.\n\n'
             '4. Check supporting evidence. Read the official travel guidance and your visa conditions for documents you may need to show, such as evidence of living funds and onward travel. Check the requirements for your own visa; this short guide is not a complete entry-document list.\n\n'
             '5. Keep private copies. As a practical backup, keep copies of important documents somewhere secure that you can access without internet. Do not upload passports or visa documents to Sajilo NZ. Use the linked checklist tasks to record your preparation; ticking them does not establish immigration eligibility or guarantee entry.',
             travel_sources, ['passport', 'visa', 'offer', 'document-copies']),
            ('travel-documents', 'ne', 'यात्राका कागजात तयार राख्नुहोस्',
             'राहदानी र ई-भिसा जाँच्नुहोस्, अध्ययनका कागजात मिलाउनुहोस् र व्यक्तिगत प्रतिलिपिहरू तयार राख्नुहोस्।',
             '१. राहदानी जाँच्नुहोस्। सामान मिलाउनुअघि अध्यागमन न्युजिल्यान्ड (INZ) को “Before you travel” जानकारीअनुसार राहदानीको म्याद र अवस्था जाँच्नुहोस्। आफ्नो यात्रा कागजात र परिस्थितिमा लागू हुने आवश्यकताहरू हेर्नुहोस्।\n\n'
             '२. ई-भिसा तयार राख्नुहोस्। न्युजिल्यान्ड यात्रा गर्दा आफ्नो ई-भिसा पत्र प्रिन्ट गरेर साथमा लैजानुहोस्। त्यसमा भएका मिति र सर्तहरू पढ्नुहोस्। विवरण राहदानीसँग मिल्छ कि जाँच्नुहोस्; गल्ती भए INZ लाई सम्पर्क गर्नुहोस्। नयाँ राहदानी लिएको भए यात्राअघि INZ को भिसा सार्ने प्रक्रिया पूरा गर्नुहोस्।\n\n'
             '३. अध्ययनका कागजात मिलाउनुहोस्। तयारीका लागि अध्ययनको प्रस्तावपत्र (offer of place) वा भर्ना पुष्टि सजिलै निकाल्न मिल्ने गरी राख्नुहोस् र आइपुग्दा के ल्याउनुपर्छ भनेर आफ्नो शिक्षण संस्थालाई सोध्नुहोस्। INZ को Fee Paying Student Visa पृष्ठले उक्त भिसाका लागि अध्ययनसम्बन्धी प्रमाणबारे बताउँछ; हरेक यात्रुले सीमामा प्रस्तावपत्र देखाउनैपर्छ भन्ने अर्थ होइन।\n\n'
             '४. थप प्रमाण जाँच्नुहोस्। बसाइ खर्च धान्ने रकम र न्युजिल्यान्डबाट बाहिर जाने यात्राको प्रमाणजस्ता देखाउनुपर्ने हुन सक्ने कागजातबारे आधिकारिक यात्रा जानकारी र आफ्नो भिसाका सर्तहरू पढ्नुहोस्। आफ्नै भिसाका आवश्यकताहरू जाँच्नुहोस्; यो छोटो मार्गदर्शन प्रवेशका लागि चाहिने सबै कागजातको सूची होइन।\n\n'
             '५. व्यक्तिगत प्रतिलिपिहरू सुरक्षित राख्नुहोस्। व्यावहारिक जगेडाका रूपमा महत्त्वपूर्ण कागजातका प्रतिलिपि इन्टरनेटबिना पनि हेर्न सकिने सुरक्षित ठाउँमा राख्नुहोस्। Sajilo NZ मा राहदानी वा भिसाका कागजात अपलोड नगर्नुहोस्। आफ्नो तयारीको प्रगति राख्न तल जोडिएका चेकलिस्टका कामहरू प्रयोग गर्नुहोस्; टिक लगाउँदैमा अध्यागमन योग्यता प्रमाणित हुँदैन वा प्रवेशको ग्यारेन्टी हुँदैन।',
             travel_sources, ['passport', 'visa', 'offer', 'document-copies']),
            ('packing-biosecurity', 'en', 'Check what you are packing', 'Check official biosecurity guidance before packing.',
             'Read the Ministry for Primary Industries guidance before deciding what to pack.\n\nCheck the New Zealand Traveller Declaration website for the declaration process. These links are starting points, not personalised advice.',
             [{'title': 'Ministry for Primary Industries', 'url': 'https://www.mpi.govt.nz/'}], ['biosecurity', 'declaration'])]
        drafts.extend((SLUG, language, text['title'], text['summary'], text['body'], SOURCES, TASK_IDS)
                      for language, text in TEXT.items())
        for slug, language, title, summary, body, sources, ids in drafts:
            _, created = Guide.objects.get_or_create(slug=slug, language=language, defaults={
                'title': title, 'summary': summary, 'body': body, 'sources': sources, 'checklist_ids': ids,
                'status': 'draft', 'reviewed_by': None, 'verified_on': None, 'next_review_on': None})
            self.stdout.write(f'{slug}/{language}: {"draft created" if created else "unchanged"}')
        from guides import arrival_drafts
        for language, text in arrival_drafts.TEXT.items():
            _, created = Guide.objects.get_or_create(slug=arrival_drafts.SLUG, language=language, defaults={
                **text, 'stage': 'firstweek', 'sources': arrival_drafts.SOURCES,
                'checklist_ids': arrival_drafts.TASK_IDS, 'status': 'draft',
                'reviewed_by': None, 'verified_on': None, 'next_review_on': None})
            self.stdout.write(f'{arrival_drafts.SLUG}/{language}: {"draft created" if created else "unchanged"}')
