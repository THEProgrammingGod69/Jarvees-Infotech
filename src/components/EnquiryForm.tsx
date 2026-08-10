"use client";

import { useId, useRef, useState } from "react";

import { centres, site } from "@/lib/site";

/**
 * Enquiry form.
 *
 * Accessibility contract: every field has a real `<label>`; errors are
 * associated with `aria-describedby` and marked `aria-invalid`; the error
 * summary is focused on failed submit so a screen reader user is told what
 * happened rather than left guessing; the success state replaces the form and
 * is announced.
 *
 * Anti-spam is a honeypot field, hidden from sight and from assistive
 * technology, and never a CAPTCHA — a visitor trying to book a course should
 * not have to prove anything.
 */

type Variant = "general" | "course" | "corporate";

type Errors = Record<string, string>;

export type CourseOption = { value: string; label: string };

export default function EnquiryForm({
  variant = "general",
  courseName,
  courseOptions = [],
  className = "",
}: {
  variant?: Variant;
  /** Pre-selects and locks the course when the form is on a course page. */
  courseName?: string;
  /**
   * Passed in from the server rather than imported here. Importing the course
   * registry into this client component pulled every course's full curriculum
   * into the browser bundle just to populate a select.
   */
  courseOptions?: CourseOption[];
  className?: string;
}) {
  const uid = useId();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const fid = (name: string) => `${uid}-${name}`;
  const errId = (name: string) => `${uid}-${name}-error`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // Client-side validation first, so the common mistakes never need a round trip.
    const next: Errors = {};
    const name = String(data.name ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    const email = String(data.email ?? "").trim();
    const company = String(data.company ?? "").trim();

    if (name.length < 2) next.name = "Please enter your name.";
    if (phone.replace(/\D/g, "").length < 10) {
      next.phone = "Please enter a phone number we can reach you on, with the area or country code if needed.";
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      next.email = "That email address does not look right.";
    }
    if (variant === "corporate" && company.length < 2) {
      next.company = "Please enter your company name.";
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      setFormError(null);
      setState("idle");
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setErrors({});
    setFormError(null);
    setState("sending");

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          course: courseName ?? data.course,
          formType: variant === "corporate" ? "corporate" : variant,
        }),
      });
      const result = (await response.json()) as {
        ok: boolean;
        errors?: Errors;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        if (result.errors) setErrors(result.errors);
        setFormError(
          result.error ??
            "Something went wrong sending that. Please try again, or call us.",
        );
        setState("error");
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }

      setState("sent");
    } catch {
      setFormError(
        "We could not reach the server. Please check your connection, or call us instead.",
      );
      setState("error");
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  if (state === "sent") {
    return (
      <div
        className={`border border-signal/40 bg-graphite p-6 sm:p-8 ${className}`}
      >
        <p className="font-mono text-mono-label uppercase text-signal">
          Enquiry sent
        </p>
        <h3 className="mt-4 text-heading text-chalk">
          Thank you — we have your enquiry.
        </h3>
        <p className="mt-3 text-body-s text-steel">
          Someone from the academy will call you back on the number you gave us.
          We are open {site.hours}, so if you sent this late in the evening the
          call will come the next day.
        </p>
        <p className="mt-5 text-body-s text-steel">
          If you would rather not wait, call{" "}
          {centres.map((centre, i) => (
            <span key={centre.id}>
              {i > 0 && " or "}
              <a
                href={`tel:${centre.phoneHref}`}
                className="font-mono text-chalk underline decoration-steel-dim underline-offset-4 hover:decoration-signal"
              >
                {centre.phoneDisplay}
              </a>{" "}
              <span className="text-steel">({centre.shortName})</span>
            </span>
          ))}
          .
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full border border-hairline bg-ink px-3.5 py-3 text-body-s text-chalk placeholder:text-steel focus:border-steel-dim";
  const labelClass = "block font-mono text-mono-label uppercase text-steel";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={`border border-hairline bg-graphite p-6 sm:p-8 ${className}`}
    >
      <div
        ref={summaryRef}
        tabIndex={-1}
        role={formError || Object.keys(errors).length ? "alert" : undefined}
        className="focus:outline-none"
      >
        {(formError || Object.keys(errors).length > 0) && (
          <div className="mb-6 border border-signal/40 bg-signal/10 p-4">
            <p className="font-mono text-mono-label uppercase text-signal">
              {formError ? "Not sent" : "Check these fields"}
            </p>
            <p className="mt-2 text-body-s text-chalk">
              {formError ??
                "A couple of details are missing. They are marked below."}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={fid("name")} className={labelClass}>
            Your name <span className="text-signal">*</span>
          </label>
          <input
            id={fid("name")}
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? errId("name") : undefined}
            className={`mt-2 ${inputClass} ${errors.name ? "border-signal" : ""}`}
          />
          {errors.name && (
            <p id={errId("name")} className="mt-2 text-body-s text-signal">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fid("phone")} className={labelClass}>
            Phone <span className="text-signal">*</span>
          </label>
          <input
            id={fid("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? errId("phone") : undefined}
            className={`mt-2 ${inputClass} ${errors.phone ? "border-signal" : ""}`}
          />
          {errors.phone && (
            <p id={errId("phone")} className="mt-2 text-body-s text-signal">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fid("email")} className={labelClass}>
            Email
          </label>
          <input
            id={fid("email")}
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? errId("email") : undefined}
            className={`mt-2 ${inputClass} ${errors.email ? "border-signal" : ""}`}
          />
          {errors.email && (
            <p id={errId("email")} className="mt-2 text-body-s text-signal">
              {errors.email}
            </p>
          )}
        </div>

        {variant === "corporate" && (
          <>
            <div>
              <label htmlFor={fid("company")} className={labelClass}>
                Company <span className="text-signal">*</span>
              </label>
              <input
                id={fid("company")}
                name="company"
                type="text"
                autoComplete="organization"
                required
                aria-invalid={Boolean(errors.company)}
                aria-describedby={errors.company ? errId("company") : undefined}
                className={`mt-2 ${inputClass} ${errors.company ? "border-signal" : ""}`}
              />
              {errors.company && (
                <p id={errId("company")} className="mt-2 text-body-s text-signal">
                  {errors.company}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={fid("teamSize")} className={labelClass}>
                Team size
              </label>
              <select
                id={fid("teamSize")}
                name="teamSize"
                defaultValue=""
                className={`mt-2 ${inputClass}`}
              >
                <option value="">Select</option>
                <option value="1-5">1 – 5</option>
                <option value="6-15">6 – 15</option>
                <option value="16-40">16 – 40</option>
                <option value="40+">More than 40</option>
              </select>
            </div>
          </>
        )}

        {variant !== "course" && (
          <div className={variant === "corporate" ? "sm:col-span-2" : ""}>
            <label htmlFor={fid("course")} className={labelClass}>
              {variant === "corporate" ? "Target modules" : "Course of interest"}
            </label>
            <select
              id={fid("course")}
              name="course"
              defaultValue=""
              className={`mt-2 ${inputClass}`}
            >
              <option value="">
                {variant === "corporate"
                  ? "Select a starting point"
                  : "Not sure yet"}
              </option>
              {courseOptions.map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {variant === "course" && courseName && (
          <div className="sm:col-span-2">
            <p className={labelClass}>Course</p>
            <p className="mt-2 border border-hairline bg-ink px-3.5 py-3 text-body-s text-chalk">
              {courseName}
            </p>
            <input type="hidden" name="course" value={courseName} />
          </div>
        )}

        {variant !== "corporate" && (
          <fieldset className="sm:col-span-2">
            <legend className={labelClass}>Preferred mode</legend>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
              {["Classroom — Narhe", "Classroom — Tilak Road", "Online", "Either"].map(
                (option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2.5 text-body-s text-chalk"
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={option}
                      defaultChecked={option === "Either"}
                      className="h-4 w-4 accent-[var(--color-signal)]"
                    />
                    {option}
                  </label>
                ),
              )}
            </div>
          </fieldset>
        )}

        <div className="sm:col-span-2">
          <label htmlFor={fid("message")} className={labelClass}>
            {variant === "corporate"
              ? "What does the team need to be able to do?"
              : "Anything you want us to know"}
          </label>
          <textarea
            id={fid("message")}
            name="message"
            rows={4}
            placeholder={
              variant === "corporate"
                ? "Current skill level, timelines, on-site or remote, anything else useful."
                : "Your background, what you are aiming at, or when you can attend."
            }
            className={`mt-2 ${inputClass} resize-y`}
          />
        </div>
      </div>

      {/* Honeypot. Hidden from sight and from assistive technology. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={fid("website")}>Leave this field empty</label>
        <input
          id={fid("website")}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === "sending"}
          className="bg-signal px-5 py-3 font-mono text-mono-label uppercase text-ink transition-opacity duration-(--duration-fast) hover:opacity-85 disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Send enquiry"}
        </button>
        <p className="text-body-s text-steel">
          We will call you back. We do not pass your details to anyone else.
        </p>
      </div>
    </form>
  );
}
