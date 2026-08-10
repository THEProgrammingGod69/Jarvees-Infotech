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

The site ships **no photographs**. This is deliberate: stock images of unrelated
people in an unrelated office are worse than none, and no third-party
photographs were scraped or reused.

Every image is declared as a **slot** in `src/content/images.ts`, with its
dimensions fixed up front. Until a slot has a file it renders **finished
abstract artwork** at exactly the right size — a layered composition in the
site's own visual language: drifting light, a drafting grid, a schematic
figure, fine scan lines.

That is a deliberate choice over a "photo pending" notice. A page carrying
grey boxes labelled *to be supplied* reads as unfinished; the same page
carrying compositions that belong to the design reads as designed. The site is
complete and launchable today, and supplying a photograph later **cannot shift
the page**, because the box is already the right shape.

Nothing on screen tells a visitor an image is missing. The outstanding
photographs are tracked here and in a `data-image-slot` attribute on the
element, so a developer can find every one of them with:

```bash
grep -rn "data-image-slot" .next/server/app   # after a build
```

### Supplying one

```
1. Put the file in public/     e.g. public/centres/narhe-entrance.jpg
2. Open src/content/images.ts and set src on the matching slot:
      src: "/centres/narhe-entrance.jpg",
3. Check the file's aspect ratio matches the width/height already on the slot.
```

That is the whole job — no other file changes.

### The four slots

| Slot | Appears on | What to photograph | Shape |
|---|---|---|---|
| `narhe-entrance` | `/centres` | **The street entrance at Narhe**, as a first-time visitor sees it walking up. This is the single highest-value image on the site — it is what someone uses to find the door. | 16:10 landscape, ≥1600px wide |
| `tilak-road-entrance` | `/centres` | The frontage at Mangal Murti Complex, Hirabaug Chowk | 16:10 landscape, ≥1600px wide |
| `session-in-progress` | `/about` | A real session — learners at their own machines, not an empty room and not a posed group shot. **Written consent needed from anyone identifiable.** | 16:9 landscape, ≥1600px wide |
| `corporate-session` | `/corporate-training` | An on-site corporate session. **Clear this with the client** before publishing anything showing their premises or staff. | 16:9 landscape, ≥1600px wide |

Alt text for all four is already written in `src/content/images.ts`, so it can
never be left as a filename. Adjust it if the photograph shows something
different from what was described.

### Do not add

Stock photography of generic offices or models; screenshots of SAP software
(SAP's interface is SAP's copyright); or the logo of any company presented as a
hiring or training partner.

### Social sharing cards

Nothing needed. Every page generates its own Open Graph and Twitter card at
build. Course cards carry the course name, its module code and — for SAP
modules — the modules it genuinely integrates with, read from the same
landscape data that draws the map on the home page.

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
