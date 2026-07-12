"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import sampleData from "@/data/sample-case.json";
import { detectDiscrepancies } from "@/lib/rule-engine/engine";
import { CaseDocument, ExtractedFact } from "@/lib/types";

// the money shot: after analysis, we don't drop you on a calm dashboard — we stage the
// contradiction. two documents disagreeing, drawn out beat by beat, checks ticking in.
export default function RevealPage() {
  const c = sampleData;
  const disc = detectDiscrepancies(c.facts as ExtractedFact[], c.documents as CaseDocument[])[0];

  const fact = (fieldName: string) => (c.facts as ExtractedFact[]).find((f) => f.fieldName === fieldName)?.value;
  const authNumber = fact("authorizationNumber");
  const approvedService = fact("approvedService");
  const amount = "$4,800";

  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setStep(1), 700),
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 2600),
      setTimeout(() => setStep(4), 3300),
      setTimeout(() => setStep(5), 3300 + disc.checks.length * 420 + 500),
    ];
    return () => t.forEach(clearTimeout);
  }, [disc.checks.length]);

  const ease = "all 0.6s cubic-bezier(0.22,1,0.36,1)";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "radial-gradient(1200px 600px at 50% -10%, #0e4457 0%, #082230 55%, #06171f 100%)", color: "#eaf4f7" }}>
      <div style={{ position: "absolute", top: 24, right: 28 }}>
        <Link href="/case/sample" style={{ fontSize: 13, color: "#7fa8b5", textDecoration: "none" }}>Skip →</Link>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", maxWidth: 960, margin: "0 auto", width: "100%" }}>

        {/* beat 1: the line */}
        <div style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? "translateY(0)" : "translateY(14px)", transition: ease, textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#5fbfd6", marginBottom: 14 }}>
            {step < 1 ? "Reading your documents" : "Cross-checking complete"}
          </div>
          <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontStyle: "italic", fontSize: 52, lineHeight: 1.05, margin: 0, color: "#f4fbfd" }}>
            We found something.
          </h1>
        </div>

        {/* beat 2: the two documents disagreeing */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 20, alignItems: "stretch", width: "100%", marginBottom: 36 }}>
          {/* denial */}
          <div style={{ opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? "translateX(0)" : "translateX(-40px)", transition: ease, background: "rgba(163,58,58,0.10)", border: "1px solid rgba(224,122,122,0.35)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#e78a8a" }}>The insurer says</span>
            <p style={{ fontFamily: "var(--font-cormorant), serif", fontStyle: "italic", fontSize: 24, lineHeight: 1.3, margin: 0, color: "#fbeaea", flex: 1 }}>&ldquo;No prior authorization was received.&rdquo;</p>
            <span style={{ fontSize: 12, color: "#c98f8f" }}>Denial Letter, p.1 · why they denied {amount}</span>
          </div>

          {/* contradiction marker */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? "scale(1)" : "scale(0.6)", transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 1, height: 26, background: "linear-gradient(#5fbfd6, transparent)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0a2530", background: "#f0c04a", borderRadius: 9999, padding: "6px 12px", whiteSpace: "nowrap" }}>vs</span>
              <div style={{ width: 1, height: 26, background: "linear-gradient(transparent, #5fbfd6)" }} />
            </div>
          </div>

          {/* authorization */}
          <div style={{ opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? "translateX(0)" : "translateX(40px)", transition: ease, background: "rgba(63,122,74,0.12)", border: "1px solid rgba(120,200,140,0.35)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8fd6a0" }}>Your own paperwork says</span>
            <p style={{ fontFamily: "var(--font-cormorant), serif", fontStyle: "italic", fontSize: 24, lineHeight: 1.3, margin: 0, color: "#e9f7ec", flex: 1 }}>&ldquo;Authorization {authNumber} — approved for {approvedService}.&rdquo;</p>
            <span style={{ fontSize: 12, color: "#94c3a1" }}>Authorization Confirmation, p.1 · covers the same MRI &amp; date</span>
          </div>
        </div>

        {/* beat 4: the deterministic checks ticking in */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 34 }}>
          {disc.checks.map((chk, i) => (
            <span key={chk.id} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "#dbeef2", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9999, padding: "7px 14px", opacity: step >= 4 ? 1 : 0, transform: step >= 4 ? "translateY(0)" : "translateY(8px)", transition: ease, transitionDelay: `${i * 0.42}s` }}>
              <Check width={14} height={14} color="#7be0a0" strokeWidth={2.5} />
              {chk.label}
            </span>
          ))}
        </div>

        {/* beat 5: plain-language verdict + the way forward */}
        <div style={{ opacity: step >= 5 ? 1 : 0, transform: step >= 5 ? "translateY(0)" : "translateY(14px)", transition: ease, textAlign: "center", maxWidth: 640, pointerEvents: step >= 5 ? "auto" : "none" }}>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cfe4ea", margin: "0 0 24px" }}>
            The reason they gave for denying {amount} is contradicted by an approved authorization you already hold, covering the same service, provider, and date.
          </p>
          <Link href="/case/sample">
            <button className="press" style={{ height: 52, padding: "0 34px", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#06171f", background: "#f0c04a", border: "none", borderRadius: 12, cursor: "pointer" }}>
              See the full case
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
