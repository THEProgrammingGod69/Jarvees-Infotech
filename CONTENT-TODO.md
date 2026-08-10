# Content to supply before launch

Everything on this list is something the site does **not** invent. Each item is
either a visible `{{TOKEN}}` placeholder, an image the academy must provide, or
a claim that needs the academy's confirmation.

Nothing here should be filled in with an estimate. If a figure is not known,
leave the token in place — it renders as a quiet "To be confirmed", which is
honest, rather than as a plausible-looking invention, which is not.

---

## 1. Placeholder tokens in the content files

All 30 live in `src/content/courses/*.ts`. Each is one line: find the token,
replace it with the real value in quotes, done.

```ts
// src/content/courses/sap-fico.ts
duration: "{{FICO_DURATION}}",        →   duration: "8 weeks",
batchTimings: "{{FICO_BATCH_TIMINGS}}",  →   batchTimings: "Mon–Fri, 7–9 AM",
```

| File | Tokens |
|---|---|
| `sap-fico.ts` | `{{FICO_DURATION}}` · `{{FICO_BATCH_TIMINGS}}` |
| `sap-mm.ts` | `{{MM_DURATION}}` · `{{MM_BATCH_TIMINGS}}` |
| `sap-sd.ts` | `{{SD_DURATION}}` · `{{SD_BATCH_TIMINGS}}` |
| `sap-abap.ts` | `{{ABAP_DURATION}}` · `{{ABAP_BATCH_TIMINGS}}` |
| `sap-s4hana.ts` | `{{S4HANA_DURATION}}` · `{{S4HANA_BATCH_TIMINGS}}` |
| `sap-ecc.ts` | `{{ECC_DURATION}}` · `{{ECC_BATCH_TIMINGS}}` |
| `sap-basis.ts` | `{{BASIS_DURATION}}` · `{{BASIS_BATCH_TIMINGS}}` |
| `sap-hana.ts` | `{{HANA_DURATION}}` · `{{HANA_BATCH_TIMINGS}}` |
| `salesforce.ts` | `{{SALESFORCE_DURATION}}` · `{{SALESFORCE_BATCH_TIMINGS}}` |
| `data-science.ts` | `{{DATA_SCIENCE_DURATION}}` · `{{DATA_SCIENCE_BATCH_TIMINGS}}` |
| `automation-testing.ts` | `{{AUTOMATION_TESTING_DURATION}}` · `{{AUTOMATION_TESTING_BATCH_TIMINGS}}` |
| `software-testing.ts` | `{{SOFTWARE_TESTING_DURATION}}` · `{{SOFTWARE_TESTING_BATCH_TIMINGS}}` |
| `java.ts` | `{{JAVA_DURATION}}` · `{{JAVA_BATCH_TIMINGS}}` |
| `dotnet.ts` | `{{DOTNET_DURATION}}` · `{{DOTNET_BATCH_TIMINGS}}` |
| `cpp.ts` | `{{CPP_DURATION}}` · `{{CPP_BATCH_TIMINGS}}` |

To find them all at any time:

```bash
grep -rn "{{" src/content/courses/
```

*(`{{TOKEN}}` and `{{DOUBLE_BRACE}}` also appear in `src/content/types.ts` and
`src/components/ui.tsx` — those are documentation examples, not content.)*

---

## 2. Images the academy must supply

The site currently ships **no photographs at all**. This is deliberate: stock
images of unrelated people in an unrelated office are worse than none, and
third-party photographs were not scraped or reused. Every image below is
optional — the site is complete and launchable without them — but each one
would earn its place.

| Where | What is needed | Notes |
|---|---|---|
| `/centres` | 2–4 photographs of each centre: the entrance from the street, the classroom, the building frontage | The street-level entrance shot is the most valuable single image on the site — it is what a first-time visitor uses to find the door. Landscape, at least 1600px wide. |
| `/about` | One photograph of a session in progress | Real learners at real machines. Get written consent from anyone identifiable. |
| `/corporate-training` | One photograph of an on-site corporate session | Check the client's permission before publishing anything showing their premises or staff. |
| Open Graph card | Optional replacement for the generated card | A card is generated automatically at `src/app/opengraph-image.tsx` and needs nothing. Replace only if the academy has a designed one. |
| Favicon | Optional replacement | Currently the schematic mark at `src/app/icon.svg`. |

**Do not** add: stock photography of generic offices or models, screenshots of
SAP software (SAP's interface is SAP's copyright), or logos of any company
presented as a hiring or training partner.

---

## 3. Claims requiring the academy's confirmation before launch

| Item | Where | Why it needs checking |
|---|---|---|
| **Centre geo-coordinates** | `src/lib/site.ts` → `centres[].geo` | These are **area-level approximations**, not surveyed pins, and they appear in the `LocalBusiness` structured data. Open each centre in Google Maps, copy the exact coordinates, and replace them. Every map link a visitor actually clicks is built from the verified address text rather than these numbers, so a wrong value will not misdirect anyone — but it should still be corrected. |
| **ISO 9001:2015 issue year (2020)** | `src/lib/site.ts` → `certificationIssued` | Confirm against the certificate. Also confirm the certificate is **current**; if it has lapsed, the claim must come off the site entirely. |
| **Certificate number and certifying body** | not currently shown | Worth adding to `/about` if available — a verifiable certificate number is stronger than the bare claim. |
| **Rating: 4.5 from 59 ratings** | `src/lib/site.ts` → `site.rating` | Taken from the JustDial listing. This number moves. It is displayed in the footer of every page and asserted in `AggregateRating` structured data, so it must be re-checked before launch and periodically after. **If it changes, change it here — the structured data reads from the same constant.** |
| **Trainer profiles** | offered "on request" on `/about` and `/corporate-training` | The site promises these are available. Make sure they actually are. |
| **Both phone numbers** | `src/lib/site.ts` | Ring both before launch and confirm each reaches the right centre. |
| **Operating hours (9 AM – 9 PM, all seven days)** | `src/lib/site.ts` | Asserted in `openingHours` structured data, which can surface directly in Google. Confirm this holds on Sundays and public holidays. |
| **Fees** | not currently shown anywhere | The site never quotes a price. If the academy wants fees published, they need supplying — do not let the site imply a price it has not stated. |

---

## 4. Configuration before deploy

| Item | Where |
|---|---|
| Enquiry form delivery — **the form does not send anywhere until this is set** | `.env` — set either `NEXT_PUBLIC_FORMSPREE_ID` or `RESEND_API_KEY` + `ENQUIRY_FROM_EMAIL`. See `.env.example`. |
| Canonical domain | `NEXT_PUBLIC_SITE_URL` — defaults to `https://www.jarveesacademy.com` |
| Google Search Console | Submit `https://www.jarveesacademy.com/sitemap.xml` after launch |
| Google Business Profile | Both centres should be claimed and verified, with the same name, address and phone as this site. Local search results depend on that matching exactly. |

---

## 5. Deliberately absent, and why

So that nobody adds these back without a decision:

- **No student testimonials with names, photographs or employers.** Only the two verbatim public reviews, attributed to their source. If the academy collects written, consented testimonials, they can be added — with real names only, and only with permission.
- **No "students trained" or "placement rate" figures.** No such number can currently be evidenced. If the academy has audited figures, they can be added; a guess cannot.
- **No hiring-partner logos.** Using a company's logo implies a relationship and needs their permission.
- **No placement guarantee, anywhere.** The site says "placement assistance" throughout. This is a legal position as much as a copy choice — it must not be softened into a promise.
- **No claim of SAP partnership.** The academy is an independent training provider. `/about` states this explicitly, and the footer carries the SAP trademark notice on every page.
