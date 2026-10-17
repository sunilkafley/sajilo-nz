# Study & Courses content update

The existing page shell, hero, navigation, topic columns, sidebar and cards are retained. The study landing page now contains a locally bundled institution directory, international study information, programme examples and qualification levels. Existing published article and course routes remain available. No deployment or prototype changes.

## Directory scope and evidence

Public NZQA register retrieved 16 October 2026. This is a retrieval date, not a human verification or review date.

- Source: https://www.nzqa.govt.nz/providers/index.do
- Queries: all regions, types UNI, POLLY, PTE, WANA. Each queried once without Code filter and once with `copApprovalStatus=Y`.
- 411 distinct provider IDs: 8 university, 17 polytechnic, 383 private training establishment, 3 wānanga records.
- 197 distinct IDs appear in the Code signatory queries: 8 university, 17 polytechnic, 171 PTE, 1 wānanga.
- 395 records supply a website. The other 16 retain their NZQA record link and explicitly say the website is not supplied.
- These are **provider records**, not an independently verified count of distinct institutions. MIT/Unitec and NZIST/divisions retain separate IDs. They have not been silently counted as independent institutions. Schools, government training establishments, course owners and industry bodies are outside the four queried categories.
- Grouping uses the town/city from the head-office contact address, not an assumption that all programmes are taught there. Auckland suburb aliases and selected town spellings are normalised. Six missing addresses and one ambiguous address stay in “Head-office city not listed”; two overseas head offices remain explicitly labelled overseas. Original NZQA delivery-location names are available on each row and searchable, including any overseas sites.
- Known NZIST divisions use recognisable display names based on the register search rows, with NZIST in the label; the legal record name is retained in data. The register and detail pages can use different names during restructuring.
- Websites are the provider URLs supplied by NZQA, not independently checked for every institution. Malformed `http://https://` anchor markup was avoided by extracting the displayed website field. Missing websites are not guessed.

The supplied [View NZQA qualification search](https://www.nzqa.govt.nz/nzqf/search/results.do?q=&area=All&searchSubject=All&type=&lvl=&credit=&status=Current) is retained exactly. This is a qualification search and requires search criteria; it does not return an institution total.

## Other primary sources

- [NZQA: choosing a tertiary provider](https://www2.nzqa.govt.nz/tertiary/tertiary-education-in-new-zealand/choosing-a-tertiary-provider/).
- [NZQA: becoming a Code signatory](https://www2.nzqa.govt.nz/tertiary/the-code/the-code-for-education-providers/becoming-a-signatory-to-the-code/). Signatory status is required for international enrolment. Being listed does not establish specific programme availability, intake, admission or visa eligibility.
- [NZQA qualification levels](https://www2.nzqa.govt.nz/qualifications-and-standards/about-new-zealand-qualifications-credentials-framework/) and [qualification rules](https://www2.nzqa.govt.nz/about-us/rules-fees-policies/nzqa-rules/qualification-and-micro-credentials/).
- [Education New Zealand: popular study areas](https://www.studywithnewzealand.govt.nz/en/study-options/courses-and-programmes/areas-of-study). Supports popular subject areas, not a ranked list of individual qualifications. The page therefore labels four programmes as real examples in those areas, not “most popular” programmes.
- Programme sources are linked beside each example: AUT Bachelor of Business (7), Ara Bachelor of Nursing (7), UC Bachelor of Engineering with Honours (8), Auckland Master of Information Technology (9).
- [TEC: establishment of polytechnics](https://www.tec.govt.nz/strategic-initiatives/vocational-education-system/changes-to-the-vocational-education-and-training-vet-system/establishment-of-institutes-of-technology-and-polytechnics) explains 2026 restructuring; do not equate 17 register IDs with 17 independent polytechnics.
- The [Education Counts directory](https://www.educationcounts.govt.nz/directories/list-of-tertiary-providers) advertised an October 2026 download, but the download was blocked. Its contents were not used to produce counts or listings.

## Updating

Run `scripts/collect-study-directory.ps1` with public network access, then `node scripts/build-study-directory.mjs`. Review source changes, missing fields, city overrides and institutional restructuring before accepting regenerated data. The browser does not scrape or call NZQA at runtime. Do not change the source date merely on build/deployment.

## Acceptance criteria

- Existing layout/navigation and original prototype are preserved.
- All distinct records in the four queries are present; cities and provider names sort alphabetically.
- Filters combine; location searches ignore case and macrons; zero-results and reset work.
- Provider type, source link, supplied website and observed Code-filter membership are displayed without invented accreditation or review badges.
- Exact supplied NZQA link is labelled “View NZQA”.
- Popular areas have official attribution; real programme examples show qualification levels and official links.
- English directory is not silently substituted for an unavailable Nepali translation.
- Run `npm run check` and `npm test`; visually inspect the study page before handoff.

## Validation

- `npm run check` passed.
- `npm test` passed: 6 prototype tests and 111 frontend tests. Initial sandbox execution failed to access Vitest temporary files; the permitted rerun outside the sandbox passed.
- `npm run build` passed, with a bundle-size advisory (main JS approximately 522 kB before gzip).
- Browser inspected the existing page shell and filtered Christchurch + University to the University of Canterbury. Mobile viewport check found no horizontal overflow.
