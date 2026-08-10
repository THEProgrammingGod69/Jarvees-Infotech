import { site } from "./site";

export type FaqItem = { q: string; a: string };

/**
 * Frequently asked questions.
 *
 * These are the questions a prospective learner actually asks on the phone,
 * and the answers hold the same line the rest of the site does: no placement
 * guarantee, no SAP partnership, no invented figures. Two of them exist
 * specifically to say the unprofitable thing plainly, because a visitor
 * comparing institutes is looking for exactly that.
 */
export const homeFaqs: FaqItem[] = [
  {
    q: "Do you guarantee a job at the end?",
    a: "No, and you should be wary of any institute that does. What we provide is placement assistance: help structuring your resume around what you actually built, interview preparation for the questions your specific module attracts, career guidance, and introductions where we can make them. Whether you are hired depends on you, on the market, and on the employer.",
  },
  {
    q: "Is Jarvees Academy an SAP authorised training partner?",
    a: "No. We are an independent training provider and hold no partner or certification-partner status with SAP SE. The certificate you receive on completing a course here is issued by Jarvees Academy. SAP's own global certification is a separate examination, set by SAP and paid for separately, which you may choose to attempt.",
  },
  {
    q: "I am from a non-IT background. Can I still learn SAP?",
    a: "Frequently, yes — and the functional modules are unusually good ground for it, because domain knowledge counts for more than programming does. A commerce or accounting background is a genuine advantage in FICO. Where we would steer you away is ABAP, which is a development course and is much harder without prior programming exposure. Tell us your background when you enquire and you will get a straight answer.",
  },
  {
    q: "What does the live project involve?",
    a: "A scoped piece of realistic work in a working system, completed by you towards the end of the course — configuring the books for a company, running a full procure-to-pay cycle, building an automation framework from an empty repository. It is deliberately larger than a classroom exercise and smaller than a real implementation. It is not employment, not work for a client, and it must not go on your resume as a job.",
  },
  {
    q: "What are the fees and how long is a course?",
    a: "Duration and batch timings depend on the module and on whether you take it online or in the classroom, so both are confirmed when you enquire rather than quoted approximately here. Call either centre and you will get the actual dates and price for the next batch, in writing, so you can compare it with anywhere else you are looking.",
  },
  {
    q: "Is the online course the same as the classroom one?",
    a: "The teaching, the system access and the live project are the same. Sessions are live and taught rather than recorded videos you work through alone. The real difference is not the content but the discipline: attending online requires more of it, and that is worth knowing before you choose.",
  },
  {
    q: "Which centre should I choose?",
    a: `Whichever you can reach reliably after work — attendance is the single biggest predictor of finishing. Narhe suits the Dhayari, Katraj, Warje and Navale Bridge side and has easier parking. Tilak Road suits central Pune and is straightforward on public transport from most of the city. Both run the full catalogue and both are open ${site.hours.toLowerCase()}.`,
  },
  {
    q: "What does your ISO 9001:2015 certification actually mean?",
    a: "It is a quality management system certification: it certifies that the organisation has documented processes, follows them, handles complaints through a defined route, and submits to periodic external audit. It is not an accreditation of curriculum content and not an endorsement by any software vendor. It matters most to corporate buyers, whose procurement process usually asks for exactly this.",
  },
];

export function faqSchema(items: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
