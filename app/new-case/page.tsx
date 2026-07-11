"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Step = "create" | "upload";

// alr case creation and upload flow working, moved on lol
export default function NewCasePage() {
  const [step, setStep] = useState<Step>("create");
  const [name, setName] = useState("Maya MRI denial");
  const [state, setState] = useState("Illinois");
  const [insurance, setInsurance] = useState("Employer-sponsored private insurance");
  const [treated, setTreated] = useState(true);
  const [urgent, setUrgent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);

  const handleUpload = async () => {
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2500));
    setAnalyzing(false);
    setDone(true);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5fafc" }}>
      <header
        className="sticky top-0 z-50 h-16 flex items-center"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #dce7ec",
        }}
      >
        <div className="w-full max-w-5xl mx-auto px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
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
            <span className="text-lg font-semibold" style={{ color: "#0a3a4a" }}>
              ClaimRight
            </span>
          </Link>
          {step === "upload" && <span className="text-xs" style={{ color: "#7a8a93" }}>Sample data — fictional case</span>}
        </div>
      </header>

      <main className="flex-1">
        {step === "create" && (
          <div className="max-w-xl mx-auto px-8 py-20">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#7a8a93" }}>
              Step 1 of 2
            </p>
            <h1 className="text-4xl font-light mt-2 mb-2" style={{ color: "#0a3a4a" }}>
              Create your case
            </h1>
            <p className="text-base mb-10" style={{ color: "#40525c" }}>
              A few details help us organize your documents. This does not determine legal eligibility.
            </p>

            <div className="bg-white rounded-2xl border p-8 flex flex-col gap-6" style={{ borderColor: "#dce7ec" }}>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Case name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                  style={{
                    borderColor: "#c6d4db",
                    color: "#0a3a4a",
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">State</Label>
                  <Select value={state} onValueChange={(val) => setState(val || "")}>
                    <SelectTrigger className="h-11" style={{ borderColor: "#c6d4db", color: "#0a3a4a" }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Illinois">Illinois</SelectItem>
                      <SelectItem value="California">California</SelectItem>
                      <SelectItem value="New York">New York</SelectItem>
                      <SelectItem value="Texas">Texas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">Insurance type</Label>
                  <Select value={insurance} onValueChange={(val) => setInsurance(val || "")}>
                    <SelectTrigger className="h-11" style={{ borderColor: "#c6d4db", color: "#0a3a4a" }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Employer-sponsored private insurance">Employer-sponsored private insurance</SelectItem>
                      <SelectItem value="Marketplace / ACA plan">Marketplace / ACA plan</SelectItem>
                      <SelectItem value="Medicare">Medicare</SelectItem>
                      <SelectItem value="Medicaid">Medicaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Has the treatment already occurred?</Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTreated(true)}
                      className="flex-1 h-10 rounded text-sm font-medium border"
                      style={{
                        background: treated ? "#0a3a4a" : "#ffffff",
                        color: treated ? "#f5fafc" : "#0a3a4a",
                        borderColor: treated ? "#0a3a4a" : "#c6d4db",
                      }}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setTreated(false)}
                      className="flex-1 h-10 rounded text-sm font-medium border"
                      style={{
                        background: !treated ? "#0a3a4a" : "#ffffff",
                        color: !treated ? "#f5fafc" : "#0a3a4a",
                        borderColor: !treated ? "#0a3a4a" : "#c6d4db",
                      }}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">Is urgent care involved?</Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUrgent(true)}
                      className="flex-1 h-10 rounded text-sm font-medium border"
                      style={{
                        background: urgent ? "#0a3a4a" : "#ffffff",
                        color: urgent ? "#f5fafc" : "#0a3a4a",
                        borderColor: urgent ? "#0a3a4a" : "#c6d4db",
                      }}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setUrgent(false)}
                      className="flex-1 h-10 rounded text-sm font-medium border"
                      style={{
                        background: !urgent ? "#0a3a4a" : "#ffffff",
                        color: !urgent ? "#f5fafc" : "#0a3a4a",
                        borderColor: !urgent ? "#0a3a4a" : "#c6d4db",
                      }}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8">
              <Link href="/">
                <button className="bg-none border-none text-base font-medium" style={{ color: "#40525c", cursor: "pointer" }}>
                  ← Back
                </button>
              </Link>
              <Button
                onClick={() => setStep("upload")}
                size="lg"
                className="h-12 px-8 text-sm font-semibold tracking-wider uppercase"
                style={{ background: "#0a3a4a", color: "#f5fafc" }}
              >
                Continue to documents
              </Button>
            </div>
          </div>
        )}

        {step === "upload" && (
          <div className="max-w-2xl mx-auto px-8 py-20">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#7a8a93" }}>
              Step 2 of 2
            </p>
            <h1 className="text-4xl font-light mt-2 mb-2" style={{ color: "#0a3a4a" }}>
              Upload your claim documents
            </h1>
            <p className="text-base mb-10" style={{ color: "#40525c" }}>
              Add whichever documents you have. More documents mean stronger cross-checking.
            </p>

            {!done && (
              <div className="flex flex-col gap-3 mb-8">
                {docs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white rounded-lg border p-4" style={{ borderColor: "#dce7ec" }}>
                    <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ background: "#eef7fb" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008bb2" strokeWidth="1.5">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-semibold" style={{ color: "#0a3a4a" }}>
                        {doc.name}
                      </div>
                      {doc.status === "processing" && (
                        <div className="text-sm" style={{ color: "#7a8a93" }}>
                          Processing...
                        </div>
                      )}
                      {doc.status === "done" && (
                        <div className="text-sm" style={{ color: "#7a8a93" }}>
                          Ready
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {doc.status === "done" && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3f7a4a" strokeWidth="2">
                          <path d="M20 6 9 17l-5-5"></path>
                        </svg>
                      )}
                      {doc.status === "processing" && (
                        <span className="w-2 h-2 rounded-full" style={{ background: "#008bb2", animation: "pulse 1.2s ease-in-out infinite" }}></span>
                      )}
                      {doc.status && <span className="text-xs font-medium" style={{ color: "#7a8a93" }}>{doc.status === "done" ? "Verified" : "Reading"}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!analyzing && !done && (
              <div className="flex justify-between items-center mt-8">
                <button onClick={() => setStep("create")} className="bg-none border-none text-base font-medium" style={{ color: "#40525c", cursor: "pointer" }}>
                  ← Back
                </button>
                <Button
                  onClick={handleUpload}
                  size="lg"
                  className="h-12 px-8 text-sm font-semibold tracking-wider uppercase"
                  style={{ background: "#0a3a4a", color: "#f5fafc" }}
                >
                  Upload sample documents
                </Button>
              </div>
            )}

            {analyzing && (
              <div className="mt-8 rounded-lg border p-4 flex items-center gap-3" style={{ borderColor: "rgba(0,139,178,0.35)", background: "rgba(0,139,178,0.05)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#008bb2" strokeWidth="2">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                </svg>
                <span className="text-sm font-medium" style={{ color: "#006e8e" }}>
                  Analyzing documents...
                </span>
              </div>
            )}

            {done && (
              <Link href="/case/sample">
                <div
                  className="mt-8 rounded-2xl border p-6 cursor-pointer relative overflow-hidden"
                  style={{ borderColor: "rgba(0,139,178,0.35)", background: "#f5fafc", boxShadow: "0 4px 24px rgba(0,110,142,0.12)" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(135deg, #006e8e 0%, #008bb2 45%, #0ea5cf 100%)" }}></div>

                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full mb-4 text-xs font-semibold border" style={{ background: "#eef7fb", borderColor: "#b9e1ed", color: "#008bb2" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                    </svg>
                    Analysis complete
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div>
                      <div className="text-2xl font-light" style={{ color: "#0a3a4a" }}>
                        5
                      </div>
                      <div className="text-xs" style={{ color: "#40525c" }}>
                        documents analyzed
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-light" style={{ color: "#0a3a4a" }}>
                        28
                      </div>
                      <div className="text-xs" style={{ color: "#40525c" }}>
                        facts extracted
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-light" style={{ color: "#a33a3a" }}>
                        1
                      </div>
                      <div className="text-xs" style={{ color: "#40525c" }}>
                        major discrepancy detected
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-light" style={{ color: "#b08430" }}>
                        2
                      </div>
                      <div className="text-xs" style={{ color: "#40525c" }}>
                        facts need confirmation
                      </div>
                    </div>
                  </div>

                  <button className="h-12 px-8 text-sm font-semibold tracking-wider uppercase rounded" style={{ background: "#0a3a4a", color: "#f5fafc", border: "none", cursor: "pointer" }}>
                    Open case dashboard
                  </button>
                </div>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const docs = [
  { name: "Denial letter", status: "done" },
  { name: "Explanation of Benefits", status: "done" },
  { name: "Physician referral", status: "done" },
  { name: "Authorization confirmation", status: "done" },
  { name: "Medical bill", status: null },
];
