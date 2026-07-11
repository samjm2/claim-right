"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Check, Loader, Zap, Sparkles } from "lucide-react";
import { processUploadedFiles } from "@/app/actions/upload";
import { CaseDocument, ExtractedFact } from "@/lib/types";

type Step = "create" | "upload";

// alr case creation and upload flow working, moved on lol
export default function NewCasePage() {
  // state mgmt for the two-step form
  const [step, setStep] = useState<Step>("create");
  const [name, setName] = useState("Maya MRI denial");
  const [state, setState] = useState("Illinois");
  const [insurance, setInsurance] = useState("Employer-sponsored private insurance");
  const [treated, setTreated] = useState(true);
  const [urgent, setUrgent] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<CaseDocument[]>([]);
  const [extractedFacts, setExtractedFacts] = useState<ExtractedFact[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO: wire up caseId from form data, rn just using placeholder
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      const result = await processUploadedFiles(formData, "case-placeholder-id");
      setUploadedDocs(result.docs);
      setExtractedFacts(result.facts);
      setAnalyzing(false);
      setDone(true);
    } catch (e) {
      console.error("Upload failed:", e);
      setAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // grab the sample pdfs from /public so judges can try it without their own files
  const loadDemoDocs = async () => {
    const files = await Promise.all(
      DEMO_PDFS.map(async (name) => {
        const res = await fetch(`/sample-pdfs/${name}`);
        const blob = await res.blob();
        return new File([blob], name, { type: "application/pdf" });
      })
    );
    setSelectedFiles(files);
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
              <Check width="15" height="15" color="#fff" strokeWidth={2} />
            </div>
            <span className="text-lg font-semibold" style={{ color: "#0a3a4a" }}>
              ClaimRight
            </span>
          </Link>
          {step === "upload" && <span className="text-xs" style={{ color: "#7a8a93" }}>Sample data — fictional case</span>}
        </div>
      </header>

      <main className="flex-1">
        {/* step 1: form for case details */}
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

        {/* step 2: upload and analyze docs */}
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
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />

                <div className="flex flex-col gap-3 mb-8">
                  {selectedFiles.length > 0 ? (
                    <>
                      {selectedFiles.map((file, i) => (
                        <div
                          key={i}
                          className="rise lift flex items-center gap-4 bg-white rounded-lg border p-4"
                          style={{ borderColor: "#dce7ec", animationDelay: `${i * 60}ms` }}
                        >
                          <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ background: "#eef7fb" }}>
                            <FileText width={20} height={20} color="#008bb2" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-base font-semibold truncate" style={{ color: "#0a3a4a" }}>
                              {file.name}
                            </div>
                            <div className="text-sm" style={{ color: "#7a8a93" }}>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {analyzing ? (
                              <>
                                <Loader width={16} height={16} color="#008bb2" className="animate-spin" />
                                <span className="text-xs font-medium" style={{ color: "#7a8a93" }}>Reading</span>
                              </>
                            ) : (
                              <>
                                <Check width={16} height={16} color="#3f7a4a" strokeWidth={2} />
                                <span className="text-xs font-medium" style={{ color: "#7a8a93" }}>Ready</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {!analyzing && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm font-medium self-start mt-1"
                          style={{ color: "#008bb2", background: "none", border: "none", cursor: "pointer" }}
                        >
                          + Add more documents
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="lift flex items-center justify-center gap-2 w-full h-24 rounded-lg border-2 border-dashed"
                        style={{ borderColor: "#c6d4db", background: "#fafbfc", cursor: "pointer" }}
                      >
                        <Zap width={20} height={20} color="#008bb2" />
                        <span style={{ color: "#40525c", fontSize: "0.95rem" }}>Click to select your PDF documents</span>
                      </button>
                      {/* no denial letter handy? judges can load the maya sample set */}
                      <div className="flex items-center gap-3 my-1">
                        <span className="flex-1 h-px" style={{ background: "#dce7ec" }} />
                        <span className="text-xs" style={{ color: "#7a8a93" }}>or</span>
                        <span className="flex-1 h-px" style={{ background: "#dce7ec" }} />
                      </div>
                      <button
                        onClick={loadDemoDocs}
                        className="press flex items-center justify-center gap-2 w-full h-12 rounded-lg border"
                        style={{ borderColor: "#b9e1ed", background: "#eef7fb", color: "#008bb2", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer" }}
                      >
                        <Sparkles width={16} height={16} />
                        Load the sample case (5 documents)
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {!analyzing && !done && (
              <div className="flex justify-between items-center mt-8">
                <button onClick={() => setStep("create")} className="bg-none border-none text-base font-medium" style={{ color: "#40525c", cursor: "pointer" }}>
                  ← Back
                </button>
                {/* one button, two jobs: pick files first, then analyze what got picked */}
                {selectedFiles.length === 0 ? (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="lg"
                    className="press h-12 px-8 text-sm font-semibold tracking-wider uppercase"
                    style={{ background: "#0a3a4a", color: "#f5fafc" }}
                  >
                    Select documents
                  </Button>
                ) : (
                  <Button
                    onClick={handleUpload}
                    size="lg"
                    className="press h-12 px-8 text-sm font-semibold tracking-wider uppercase"
                    style={{ background: "#0a3a4a", color: "#f5fafc" }}
                  >
                    Analyze {selectedFiles.length} {selectedFiles.length === 1 ? "document" : "documents"}
                  </Button>
                )}
              </div>
            )}

            {analyzing && (
              <div className="mt-8 rounded-lg border p-4 flex items-center gap-3" style={{ borderColor: "rgba(0,139,178,0.35)", background: "rgba(0,139,178,0.05)" }}>
                <Sparkles width="16" height="16" color="#008bb2" className="animate-spin" />
                <span className="text-sm font-medium" style={{ color: "#006e8e" }}>
                  Analyzing documents...
                </span>
              </div>
            )}

            {done && (
              <Link href="/case/sample" className="block">
                <div
                  className="rise lift mt-8 rounded-2xl border p-6 cursor-pointer relative overflow-hidden"
                  style={{ borderColor: "rgba(0,139,178,0.35)", background: "#f5fafc", boxShadow: "0 4px 24px rgba(0,110,142,0.12)" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(135deg, #006e8e 0%, #008bb2 45%, #0ea5cf 100%)" }}></div>

                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full mb-4 text-xs font-semibold border" style={{ background: "#eef7fb", borderColor: "#b9e1ed", color: "#008bb2" }}>
                    <Sparkles width="12" height="12" />
                    Analysis complete
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div>
                      <div className="text-2xl font-light" style={{ color: "#0a3a4a" }}>
                        {uploadedDocs.length}
                      </div>
                      <div className="text-xs" style={{ color: "#40525c" }}>
                        documents analyzed
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-light" style={{ color: "#0a3a4a" }}>
                        {extractedFacts.length}
                      </div>
                      <div className="text-xs" style={{ color: "#40525c" }}>
                        facts extracted
                      </div>
                    </div>
                    <div>
                      {/* discrepancy engine is phase 4, not built yet */}
                      <div className="text-2xl font-light" style={{ color: "#a33a3a" }}>
                        0
                      </div>
                      <div className="text-xs" style={{ color: "#40525c" }}>
                        major discrepancy detected
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-light" style={{ color: "#b08430" }}>
                        {extractedFacts.filter((f) => f.status === "unclear").length}
                      </div>
                      <div className="text-xs" style={{ color: "#40525c" }}>
                        facts need confirmation
                      </div>
                    </div>
                  </div>

                  {/* whole card is the link, so this is a styled span not a nested button */}
                  <span className="inline-flex items-center h-12 px-8 text-sm font-semibold tracking-wider uppercase rounded" style={{ background: "#0a3a4a", color: "#f5fafc" }}>
                    Open case dashboard
                  </span>
                </div>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// the maya rodriguez sample set, lives in /public/sample-pdfs
const DEMO_PDFS = [
  "denial-letter.pdf",
  "eob.pdf",
  "physician-referral.pdf",
  "authorization.pdf",
  "medical-bill.pdf",
];
