# Christchurch arrival preparation — human review packet

Revision: `christchurch-6c-v1`. Guide slug: `christchurch-arrival-plan`. Stage: predeparture. Both language versions are **unreviewed drafts**, not published guidance. Source research is not human review. Never substitute a build, merge or source-fetch date for verification.

The canonical seed text is in `backend/guides/christchurch_drafts.py`; `seed_drafts` creates missing rows only. Do not run it against staging as part of this engineering PR. Existing editor changes are never overwritten.

## Sources and claim mapping

| Paragraph | Basis and review task |
| --- | --- |
| 1 | [Christchurch Airport — Parking and transport](https://www.christchurchairport.co.nz/travellers/parking-and-transport/) links public transport, taxis/shuttles and rideshare information. Reviewer checks these links and whether the broad comparison wording is useful. No fare, travel time, route or availability is promised. |
| 2 | [Metro — Getting started with Metro](https://www.metroinfo.co.nz/travel-information/getting-started-with-metro/) links planning, timetables, fares and service information. Reviewer checks current navigation and wording. Payment methods can change; this draft deliberately specifies none. |
| 3 | Practical planning/privacy suggestion, not a provider requirement or claim of accommodation availability. Reviewer checks usefulness and clarity; no address, booking, personal documents or contact records are collected by Sajilo NZ. |

Only exact `www.christchurchairport.co.nz` and `www.metroinfo.co.nz` HTTPS hosts are added to the backend/frontend source allowlists. They are the airport operator and Metro transport service sources, not a general commercial-host exemption. Passing URL validation is not editorial approval.

Checklist links: `airport-transport`, `confirm-accommodation`, `contacts`. These existing planning tasks are not newly verified by this packet.

## English draft

Title: Plan your Christchurch arrival before you fly

Summary: Prepare your airport transport plan and use official transport information before travelling.

1. Compare airport transport. Christchurch Airport’s parking and transport page links to public transport, taxis, shuttles and rideshare information. Use the official pages to compare options for your arrival. Check current availability, costs and collection points before travelling; this guide does not quote fares or promise a service.

2. Plan a bus journey if it suits you. Metro’s Getting started page links to its journey planning, timetable and fare information. Check the journey for your travel date and destination, including service updates. Do not assume a route, timetable or payment method will stay unchanged.

3. Keep your own arrival details ready. As a practical planning step, confirm your accommodation address and arrival arrangements with your host or provider. Keep contact details and a backup transport plan accessible offline. Do not upload addresses, bookings or personal documents to Sajilo NZ. Use the linked checklist to record preparation, not to book transport or accommodation.

## Nepali draft — requires fluent human review

Title: उड्नुअघि क्राइस्टचर्च आगमनको योजना बनाउनुहोस्

Summary: विमानस्थलबाट जाने यातायातको योजना तयार गर्नुहोस् र यात्राअघि आधिकारिक यातायात जानकारी हेर्नुहोस्।

१. विमानस्थलबाट जाने यातायातका विकल्प तुलना गर्नुहोस्। क्राइस्टचर्च विमानस्थलको Parking and transport पृष्ठमा सार्वजनिक यातायात, ट्याक्सी, शटल र राइडशेयरसम्बन्धी जानकारीका लिङ्क छन्। आफ्नो आगमनका लागि विकल्प तुलना गर्न आधिकारिक पृष्ठहरू प्रयोग गर्नुहोस्। यात्राअघि हालको उपलब्धता, खर्च र चढ्ने स्थान जाँच्नुहोस्; यस मार्गदर्शनले भाडा तोक्दैन वा सेवा उपलब्ध हुने वाचा गर्दैन।

२. उपयुक्त भए बस यात्राको योजना बनाउनुहोस्। Metro को Getting started पृष्ठमा यात्रा योजना, समयतालिका र भाडासम्बन्धी जानकारीका लिङ्क छन्। सेवासम्बन्धी अद्यावधिकसहित आफ्नो यात्रा मिति र गन्तव्यका लागि यात्रा जाँच्नुहोस्। रुट, समयतालिका वा भुक्तानीको तरिका सधैँ उस्तै रहन्छ भनेर नमान्नुहोस्।

३. आफ्नो आगमनका विवरण तयार राख्नुहोस्। व्यावहारिक तयारीका रूपमा बस्ने ठाउँको ठेगाना र आगमनको व्यवस्था आफ्नो होस्ट वा सेवा प्रदायकसँग पुष्टि गर्नुहोस्। सम्पर्क विवरण र यातायातको वैकल्पिक योजना इन्टरनेटबिना पनि हेर्न मिल्ने गरी राख्नुहोस्। Sajilo NZ मा ठेगाना, बुकिङ वा व्यक्तिगत कागजात अपलोड नगर्नुहोस्। तयारीको प्रगति राख्न जोडिएको चेकलिस्ट प्रयोग गर्नुहोस्; यातायात वा बस्ने ठाउँ बुक गर्न होइन।

## Review records — pending

| Version | Reviewer | Actual verification date | Next review | Decision |
| --- | --- | --- | --- | --- |
| English `christchurch-6c-v1` | Not recorded | Not recorded | Not recorded | Pending |
| Nepali `christchurch-6c-v1` | Not recorded | Not recorded | Not recorded | Pending |

Sunil can assess local usefulness; publication requires a recorded source/content review. A fluent Nepali reviewer must check meaning against the approved English, terminology, readability and the no-guarantee/privacy qualifiers. Revisions restart review for the affected language.

After approval and a separately approved deployment supporting these source hosts, an editor enters the approved text as Draft in Django admin. Reopen each language record and record its real reviewer, verification and next-review dates before publishing in a separate save. Publishing English does not publish Nepali. Do not publish just to fill an empty city page.

Confirm the city list/detail, official links, original dates, save/offline warning and linked checklist steps against that approved release. Do not count synthetic browser fixtures as editorial or real-device evidence.
