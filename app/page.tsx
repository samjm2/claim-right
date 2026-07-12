"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, FileSearch, GitCompare, PenLine, Sparkles } from "lucide-react";

// yessir landing page is doneeee
export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5fafc" }}>
      <header
        className="sticky top-0 z-50 h-16 flex items-center"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #dce7ec" }}
      >
        <div className="w-full max-w-5xl mx-auto px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #006e8e 0%, #008bb2 45%, #0ea5cf 100%)" }}
            >
              <Check width={15} height={15} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold" style={{ color: "#0a3a4a" }}>ClaimRight</span>
          </Link>
          <span className="text-xs" style={{ color: "#7a8a93" }}>This is a sample case with made-up details</span>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-8 py-28 text-center">
          <div
            className="rise inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-8 text-sm font-medium border"
            style={{ background: "#eef7fb", borderColor: "#b9e1ed", color: "#008bb2", animationDelay: "0ms" }}
          >
            <Sparkles width={12} height={12} />
            You don&apos;t have to figure this out alone
          </div>

          <h1
            className="rise text-5xl font-light mb-6 max-w-2xl mx-auto"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontStyle: "italic",
              color: "#0a3a4a",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              animationDelay: "80ms",
            }}
          >
            A denied claim shouldn&apos;t require an insurance expert to understand.
          </h1>

          <p className="rise text-lg max-w-xl mx-auto mb-10" style={{ color: "#40525c", lineHeight: 1.7, animationDelay: "160ms" }}>
            Insurance denials are written to be confusing. Send us the letters you got and we&apos;ll walk you through
            what actually happened, in plain words, with every detail pointing back to the exact page it came from.
          </p>

          <div className="rise" style={{ animationDelay: "240ms" }}>
            <Link href="/new-case">
              <Button
                size="lg"
                className="press mb-12 h-12 px-8 text-sm font-semibold tracking-wider uppercase"
                style={{ background: "#0a3a4a", color: "#f5fafc" }}
              >
                Look at my denial
              </Button>
            </Link>
          </div>

          <p className="fade text-xs max-w-lg mx-auto" style={{ color: "#7a8a93", lineHeight: 1.6, animationDelay: "400ms" }}>
            ClaimRight helps you understand and organize your paperwork. It isn&apos;t legal or medical advice, and it
            can&apos;t guarantee your claim gets covered.
          </p>
        </section>

        <section style={{ background: "#ffffff", borderTop: "1px solid #dce7ec" }}>
          <div className="max-w-5xl mx-auto px-8 py-24">
            <div className="grid grid-cols-3 gap-12">
              {features.map((f, i) => (
                <div key={f.title} className="rise lift rounded-2xl p-2 -m-2" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-10 h-10 rounded flex items-center justify-center mb-3" style={{ background: "#eef7fb" }}>
                    <f.icon width={20} height={20} color="#008bb2" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: "#0a3a4a" }}>{f.title}</h3>
                  <p style={{ color: "#40525c", fontSize: "1rem", lineHeight: 1.5 }}>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const features = [
  {
    icon: FileSearch,
    title: "We read every page for you",
    body: "We pull the dates, dollar amounts, and claim numbers out of the fine print and show you exactly where each one came from, so there's nothing left to go hunting for.",
  },
  {
    icon: GitCompare,
    title: "We find where it doesn't add up",
    body: "We check your documents against each other, and when the denial says one thing while your own paperwork says another, we put them side by side so you can see it.",
  },
  {
    icon: PenLine,
    title: "We write the first draft",
    body: "We put together a clear appeal letter using only what your documents actually prove. It's yours to read over, change, and send whenever you feel ready.",
  },
];
