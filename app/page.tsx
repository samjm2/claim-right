"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const colors = {
  bg: "#f5fafc",
  dark: "#0a3a4a",
  teal: "#008bb2",
  tealLight: "#006e8e",
  text: "#40525c",
  textLight: "#7a8a93",
  border: "#dce7ec",
  badgeBg: "#eef7fb",
  badgeBorder: "#b9e1ed",
  white: "#ffffff",
};

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: colors.bg }}>
      <header
        className="sticky top-0 z-50 h-16 flex items-center"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div className="w-full max-w-5xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <div
              className="w-7 h-7 rounded flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #006e8e 0%, #008bb2 45%, #0ea5cf 100%)",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M20 6 9 17l-5-5"></path>
              </svg>
            </div>
            <span className="text-lg font-semibold" style={{ color: colors.dark }}>
              ClaimRight
            </span>
          </div>
          <span className="text-xs" style={{ color: colors.textLight }}>
            Sample data — fictional case
          </span>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-8 py-32 text-center">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-8 text-sm font-medium border"
            style={{ background: colors.badgeBg, borderColor: colors.badgeBorder, color: colors.teal }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
            </svg>
            AI-assisted denial review
          </div>

          <h1
            className="text-5xl font-light mb-6 max-w-2xl mx-auto"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              color: colors.dark,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            A denied claim should not require an insurance expert to understand.
          </h1>

          <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: colors.text, lineHeight: 1.7 }}>
            Upload your claim documents and receive a cited case summary, evidence discrepancy report, and
            reviewable appeal draft.
          </p>

          <Link href="/new-case">
            <Button
              size="lg"
              className="mb-12 h-12 px-8 text-sm font-semibold tracking-wider uppercase"
              style={{ background: colors.dark, color: colors.bg }}
            >
              Analyze a denial
            </Button>
          </Link>

          <p className="text-xs max-w-lg mx-auto" style={{ color: colors.textLight, lineHeight: 1.6 }}>
            ClaimRight provides educational and organizational assistance only. It does not provide legal or
            medical advice or guarantee coverage.
          </p>
        </section>

        <section style={{ background: colors.white, borderTop: `1px solid ${colors.border}` }}>
          <div className="max-w-5xl mx-auto px-8 py-24 grid grid-cols-3 gap-12">
            {features.map((f, i) => (
              <div key={i}>
                <div className="w-10 h-10 rounded flex items-center justify-center mb-3" style={{ background: colors.badgeBg }}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.dark }}>
                  {f.title}
                </h3>
                <p style={{ color: colors.text, fontSize: "1rem", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

const features = [
  {
    title: "Extract facts",
    desc: "Every date, amount, and claim number is pulled from your documents — each with a page-level citation.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008bb2" strokeWidth="1.5">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
        <path d="M10 9H8"></path>
        <path d="M16 13H8"></path>
        <path d="M16 17H8"></path>
      </svg>
    ),
  },
  {
    title: "Compare evidence",
    desc: "A deterministic rule engine compares records across documents and flags potential inconsistencies.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008bb2" strokeWidth="1.5">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
        <path d="M12 9v4"></path>
        <path d="M12 17h.01"></path>
      </svg>
    ),
  },
  {
    title: "Draft the appeal",
    desc: "A neutral, cited appeal letter built only from verified facts — you review and edit every paragraph.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008bb2" strokeWidth="1.5">
        <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10"></path>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
        <path d="m3 15 2 2 4-4"></path>
      </svg>
    ),
  },
];
