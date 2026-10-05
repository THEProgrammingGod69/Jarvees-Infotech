"use client";

import { useState } from "react";
import { dept, institute } from "@/lib/site";

const TOPICS = [
  { id: "admissions", label: "Admissions", to: institute.admissions.email },
  { id: "academics", label: "Academics", to: dept.email },
  { id: "industry", label: "Industry & research", to: dept.email },
  { id: "events", label: "Events & hackathons", to: dept.email },
] as const;

/**
 * Composes an email in the visitor's own mail app. There is deliberately no
 * server-side form: a message that silently went nowhere would be worse than
 * none, and this way every message lands in an inbox someone reads.
 */
export default function Transmission() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]["id"]>("academics");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const current = TOPICS.find((t) => t.id === topic)!;

  const href = `mailto:${current.to}?subject=${encodeURIComponent(`[${current.label}] Enquiry${name ? ` from ${name}` : ""}`)}&body=${encodeURIComponent(
    `${message}\n\n— ${name || "Sent from the CSE (AI) website"}`,
  )}`;

  const field =
    "w-full rounded-xl border border-line bg-void/60 px-4 py-3 text-body text-frost placeholder:text-haze/70 transition-colors focus:border-cyan focus:outline-none";

  return (
    <form
      className="holo border-orbit p-7 sm:p-9"
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = href;
      }}
    >
      <p className="label text-cyan">Compose a transmission</p>
      <fieldset className="mt-6">
        <legend className="label text-haze">Topic</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <label
              key={t.id}
              className={`label cursor-pointer rounded-full border px-3.5 py-2 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cyan ${
                topic === t.id ? "border-cyan bg-cyan text-void" : "border-line text-haze hover:text-frost"
              }`}
            >
              <input type="radio" name="topic" value={t.id} checked={topic === t.id} onChange={() => setTopic(t.id)} className="sr-only" />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-6 grid gap-4">
        <label className="block">
          <span className="label text-haze">Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`${field} mt-2`} placeholder="Name" />
        </label>
        <label className="block">
          <span className="label text-haze">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
            className={`${field} mt-2 resize-y`}
            placeholder="What would you like to know?"
          />
        </label>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-small text-haze">
          Opens your email app, addressed to <span className="text-frost">{current.to}</span>.
        </p>
        <button
          type="submit"
          data-magnetic
          className="inline-flex min-h-12 items-center gap-3 rounded-full bg-cyan px-6 text-small font-semibold text-void transition-[transform,box-shadow] duration-500 hover:shadow-[0_0_40px_-4px_var(--color-cyan)]"
        >
          Transmit <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
