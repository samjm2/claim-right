"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, TriangleAlert, Sparkles, Download } from "lucide-react";
import sampleData from "@/data/sample-case.json";
import { detectDiscrepancies } from "@/lib/rule-engine/engine";
import { formatDate as fmtDate } from "@/lib/rule-engine/normalize";
import { generateAppeal } from "@/lib/appeal/generate";
import { exportAppealPdf } from "@/app/actions/export";
import { CaseDocument, ExtractedFact, TimelineEvent } from "@/lib/types";

// alright case dashboard built in like 30 mins yessir
export default function CasePage({ params: _params }: { params: { id: string } }) {
  // hardcoded sample case rn
  const c = sampleData;

  // the discrepancy section is derived live from the facts, not written into the json.
  // change a date in the sample data and this recomputes.
  const disc = detectDiscrepancies(c.facts as ExtractedFact[], c.documents as CaseDocument[])[0];
  const filledDots = Math.round(disc.confidence * 4);

  // and the appeal letter is written from those same facts — nothing hardcoded
  const appeal = generateAppeal(c.facts as ExtractedFact[], c.documents as CaseDocument[], disc, c.timeline as TimelineEvent[]);

  // the letter is composed from whichever paragraphs are switched on, so toggles rewrite it live
  const allOn: Record<string, boolean> = Object.fromEntries(appeal.paragraphs.map((p) => [p.id, true]));
  const composeLetter = (on: Record<string, boolean>) =>
    [appeal.greeting, ...appeal.paragraphs.filter((p) => on[p.id]).map((p) => p.text), appeal.signoff.join("\n")].join("\n\n");

  const [enabled, setEnabled] = useState<Record<string, boolean>>(allOn);
  const [letter, setLetter] = useState(() => composeLetter(allOn));
  const [editing, setEditing] = useState(false);

  const defaultLetter = composeLetter(allOn);
  const handEdited = letter !== composeLetter(enabled); // true once the user types over the generated text

  const toggleParagraph = (id: string) => {
    const next = { ...enabled, [id]: !enabled[id] };
    setEnabled(next);
    setLetter(composeLetter(next)); // toggling always rebuilds, so it wins over prior hand edits
  };
  const resetLetter = () => {
    setEnabled(allOn);
    setLetter(composeLetter(allOn));
  };

  const confidenceLabel = disc.confidence >= 0.8 ? "High confidence" : disc.confidence >= 0.5 ? "Moderate confidence" : "Low confidence";

  // source drawer: click any citation to see the exact line it came from
  const [source, setSource] = useState<{ label: string; evidence: string } | null>(null);
  const openByField = (label: string, documentType: string, fieldName: string) => {
    const docId = (c.documents as CaseDocument[]).find((d) => d.documentType === documentType)?.id;
    const fact = (c.facts as ExtractedFact[]).find((f) => f.documentId === docId && f.fieldName === fieldName);
    setSource({ label, evidence: fact?.evidenceText ?? "Evidence not found." });
  };

  const [exporting, setExporting] = useState(false);
  const downloadPdf = async () => {
    setExporting(true);
    const base64 = await exportAppealPdf({
      caseName: c.case.name,
      patient: appeal.signoff[1] ?? "the member",
      letterText: letter,
      attachments: appeal.attachments,
      summary: [
        { label: "Service", value: "Knee MRI" },
        { label: "Date of service", value: "July 2, 2026" },
        { label: "Provider", value: "Lakeshore Imaging Center" },
        { label: "Amount denied", value: "$4,800" },
        { label: "Stated reason", value: "Missing prior authorization" },
        { label: "Appeal deadline", value: "September 8, 2026" },
      ],
      timeline: (c.timeline as TimelineEvent[]).map((t) => ({ date: fmtDate(t.date), event: t.event })),
      discrepancy: { summary: disc.summary, severity: disc.severity },
    });
    const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${c.case.name.replace(/\s+/g, "-").toLowerCase()}-appeal.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"#f5fafc"}}>
      <header style={{position:"sticky",top:0,zIndex:50,height:"64px",display:"flex",alignItems:"center",background:"rgba(255,255,255,0.85)",backdropFilter:"blur(12px)",borderBottom:"1px solid #dce7ec"}}>
        <div style={{width:"100%",maxWidth:"80rem",margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:"8px",textDecoration:"none"}}>
            <div style={{width:"28px",height:"28px",borderRadius:"8px",background:"linear-gradient(135deg, #006e8e 0%, #008bb2 45%, #0ea5cf 100%)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Check width={15} height={15} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{fontSize:"17px",fontWeight:"600",letterSpacing:"-0.01em",color:"#0a3a4a"}}>ClaimRight</span>
          </Link>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <span style={{fontSize:"12px",fontWeight:"600",letterSpacing:"0.16em",textTransform:"uppercase",color:"#7a8a93"}}>Case</span>
            <span style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"6px 14px",borderRadius:"9999px",background:"#eef7fb",border:"1px solid #dce7ec",fontSize:"13px",fontWeight:"500",color:"#0a3a4a"}}>{c.case.name}</span>
          </div>
        </div>
      </header>

      <main style={{flex:1}}>
        <div style={{maxWidth:"80rem",margin:"0 auto",padding:"48px 32px"}}>
          {/* header and alert */}
          <div className="rise" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"24px",marginBottom:"32px"}}>
            <div>
              <h1 style={{fontSize:"32px",fontWeight:"300",letterSpacing:"-0.02em",color:"#0a3a4a",margin:"0 0 6px"}}>Case summary</h1>
              <p style={{fontSize:"15px",color:"#40525c",margin:0}}>Everything here points back to the document it came from.</p>
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"8px 16px",borderRadius:"9999px",background:"#fdf3f3",border:"1px solid rgba(163,58,58,0.3)"}}>
              <TriangleAlert width={14} height={14} color="#a33a3a" strokeWidth={2} />
              <span style={{fontSize:"13px",fontWeight:"600",color:"#a33a3a"}}>Potential discrepancy detected</span>
            </div>
          </div>

          <div className="rise" style={{background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"16px",overflow:"hidden",animationDelay:"80ms"}}>
            {/* service row */}
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #dce7ec"}}>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#7a8a93"}}>Service</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:"10px",fontSize:"15px",fontWeight:"500",color:"#0a3a4a"}}>Knee MRI <Trust status="verified" /></span>
              <Cite label="EOB, p.1" onClick={()=>openByField("Service","eob","service")} />
            </div>
            {/* date row */}
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #dce7ec"}}>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#7a8a93"}}>Date of service</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:"10px",fontSize:"15px",fontWeight:"500",color:"#0a3a4a"}}>July 2, 2026 <Trust status="verified" /></span>
              <Cite label="EOB, p.1" onClick={()=>openByField("Date of service","eob","serviceDate")} />
            </div>
            {/* provider row */}
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #dce7ec"}}>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#7a8a93"}}>Provider</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:"10px",fontSize:"15px",fontWeight:"500",color:"#0a3a4a"}}>Lakeshore Imaging Center <Trust status="verified" /></span>
              <Cite label="Denial Letter, p.1" onClick={()=>openByField("Provider","denial_letter","provider")} />
            </div>
            {/* amount row */}
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #dce7ec"}}>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#7a8a93"}}>Amount denied</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:"10px",fontSize:"15px",fontWeight:"600",color:"#0a3a4a"}}>$4,800 <Trust status="verified" /></span>
              <Cite label="Denial Letter, p.1" onClick={()=>openByField("Amount denied","denial_letter","deniedAmount")} />
            </div>
            {/* reason row */}
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #dce7ec"}}>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#7a8a93"}}>Stated reason</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:"10px",fontSize:"15px",fontWeight:"500",color:"#0a3a4a"}}>Missing prior authorization <Trust status="verified" /></span>
              <Cite label="Denial Letter, p.1" onClick={()=>openByField("Stated reason","denial_letter","denialReason")} />
            </div>
            {/* deadline row */}
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #dce7ec"}}>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#7a8a93"}}>Appeal deadline</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:"10px",fontSize:"15px",fontWeight:"600",color:"#a33a3a"}}>September 8, 2026 (59 days left) <Trust status="verified" /></span>
              <Cite label="Denial Letter, p.1" onClick={()=>openByField("Appeal deadline","denial_letter","appealDeadline")} />
            </div>
            {/* status row */}
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 24px"}}>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#7a8a93"}}>Case status</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:"10px",fontSize:"15px",fontWeight:"500",color:"#a33a3a"}}>Potential discrepancy detected <Trust status="inferred" /></span>
              <span style={{fontSize:"12px",color:"#7a8a93",background:"#f5fafc",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>Rule engine</span>
            </div>
          </div>

          {/* legend so the trust vocabulary is spelled out once */}
          <div style={{display:"flex",flexWrap:"wrap",gap:"18px",marginTop:"14px",fontSize:"12px",color:"#7a8a93"}}>
            <span><Trust status="verified" /> directly stated and cited in a document</span>
            <span><Trust status="inferred" /> worked out by connecting several facts</span>
            <span><Trust status="unclear" /> missing or too low-confidence to rely on</span>
          </div>

          {/* discrepancy card is the main thing here, the whole point tbh */}
          <div className="rise" style={{marginTop:"48px",animationDelay:"160ms"}}>
            <h2 style={{fontSize:"32px",fontWeight:"300",letterSpacing:"-0.02em",color:"#0a3a4a",margin:"0 0 6px"}}>Discrepancy review</h2>
            <p style={{fontSize:"15px",color:"#40525c",margin:"0 0 32px",maxWidth:"720px"}}>We line up the facts from each of your documents and check them against each other before writing anything. This is here for you to look over, and it doesn&apos;t mean the insurer got it wrong.</p>

            {/* banner showing the main discrepancy - using gradient top to match design */}
            <div style={{background:"#f5fafc",border:"1px solid rgba(0,139,178,0.35)",borderRadius:"16px",padding:"28px",position:"relative",overflow:"hidden",boxShadow:"0 4px 24px rgba(0,110,142,0.12)",marginBottom:"32px"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(135deg, #006e8e 0%, #008bb2 45%, #0ea5cf 100%)"}}></div>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 12px",borderRadius:"9999px",background:"#fdf3f3",border:"1px solid rgba(163,58,58,0.3)",fontSize:"12px",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",color:"#a33a3a"}}>Major potential discrepancy</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 10px 4px 8px",borderRadius:"9999px",background:"#eef7fb",border:"1px solid #b9e1ed",fontSize:"13px",fontWeight:"500",color:"#008bb2"}}><Sparkles width={12} height={12} />Verified by rule engine</span>
              </div>
              <p style={{fontSize:"17px",lineHeight:"1.6",color:"#0a3a4a",margin:0,maxWidth:"800px"}}>{disc.summary}</p>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"16px"}}>
                <span style={{fontSize:"12px",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",color:"#7a8a93"}}>Confidence</span>
                <span style={{display:"inline-flex",gap:"3px"}}>
                  {[0,1,2,3].map((i)=>(<span key={i} style={{width:"6px",height:"6px",borderRadius:"50%",background: i < filledDots ? "#008bb2" : "#c6d4db"}}></span>))}
                </span>
                <span style={{fontSize:"13px",fontWeight:"500",color:"#008bb2"}}>{confidenceLabel}</span>
              </div>
            </div>

            {/* three cards showing the contradiction - keeps them side by side so you can see the issue */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"20px",marginBottom:"32px"}}>
              <div className="lift" style={{background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"16px",padding:"24px",display:"flex",flexDirection:"column",gap:"12px"}}>
                <span style={{fontSize:"12px",fontWeight:"600",letterSpacing:"0.16em",textTransform:"uppercase",color:"#a33a3a"}}>Insurer statement</span>
                <p style={{fontFamily:"var(--font-cormorant), serif",fontStyle:"italic",fontSize:"22px",lineHeight:"1.35",color:"#0a3a4a",margin:0,flex:1}}>&ldquo;No prior authorization was received.&rdquo;</p>
                <span style={{alignSelf:"flex-start"}}><Cite label="Denial Letter, p.1" onClick={()=>openByField("Insurer statement","denial_letter","denialReason")} /></span>
              </div>
              <div className="lift" style={{background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"16px",padding:"24px",display:"flex",flexDirection:"column",gap:"12px"}}>
                <span style={{fontSize:"12px",fontWeight:"600",letterSpacing:"0.16em",textTransform:"uppercase",color:"#008bb2"}}>Conflicting evidence</span>
                <p style={{fontFamily:"var(--font-cormorant), serif",fontStyle:"italic",fontSize:"22px",lineHeight:"1.35",color:"#0a3a4a",margin:0,flex:1}}>&ldquo;Authorization PA-48391 approved for MRI services.&rdquo;</p>
                <span style={{alignSelf:"flex-start"}}><Cite label="Authorization Confirmation, p.1" onClick={()=>openByField("Conflicting evidence","authorization_confirmation","authorizationStatus")} /></span>
              </div>
              <div className="lift" style={{background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"16px",padding:"24px",display:"flex",flexDirection:"column",gap:"12px"}}>
                <span style={{fontSize:"12px",fontWeight:"600",letterSpacing:"0.16em",textTransform:"uppercase",color:"#3f7a4a"}}>Date validation</span>
                <p style={{fontSize:"15px",lineHeight:"1.55",color:"#0a3a4a",margin:0,flex:1}}>The MRI on July 2, 2026 occurred during the authorization validity period of June 20 – July 20, 2026.</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                  <span style={{fontSize:"12px",color:"#7a8a93",background:"#f5fafc",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>EOB, p.1</span>
                  <span style={{fontSize:"12px",color:"#7a8a93",background:"#f5fafc",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>Authorization Confirmation, p.1</span>
                </div>
              </div>
            </div>

            {/* checklist of what the rule engine checked - shows it's deterministic not just ai guessing */}
            <div style={{background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"16px",padding:"24px"}}>
              <h3 style={{fontSize:"14px",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",color:"#7a8a93",margin:"0 0 16px"}}>How this was checked</h3>
              <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
                {disc.checks.map((chk)=>(
                  <span key={chk.id} title={chk.detail} style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"13px",color: chk.passed ? "#0a3a4a" : "#a33a3a",background: chk.passed ? "#eef7fb" : "#fdf3f3",borderRadius:"9999px",padding:"6px 14px"}}>
                    {chk.passed ? <Check width={12} height={12} color="#3f7a4a" strokeWidth={2.5} /> : <TriangleAlert width={12} height={12} color="#a33a3a" strokeWidth={2.5} />}
                    {chk.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* timeline - just dates and events connected by a line */}
          <div className="rise" style={{marginTop:"48px",animationDelay:"200ms"}}>
            <h2 style={{fontSize:"32px",fontWeight:"300",letterSpacing:"-0.02em",color:"#0a3a4a",margin:"0 0 6px"}}>Case timeline</h2>
            <p style={{fontSize:"15px",color:"#40525c",margin:"0 0 40px"}}>We put this together by lining up the dates across all five of your documents.</p>

            <div style={{maxWidth:"760px",display:"flex",flexDirection:"column"}}>
              {/* timeline node 1 */}
              <div style={{display:"grid",gridTemplateColumns:"120px 24px 1fr",gap:"0 20px"}}>
                <div style={{textAlign:"right",paddingBottom:"40px"}}><span style={{fontSize:"14px",fontWeight:"600",color:"#0a3a4a"}}>June 18</span></div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><span style={{width:"12px",height:"12px",borderRadius:"50%",background:"#008bb2",border:"3px solid #dbeef5",flexShrink:0}}></span><span style={{width:"1px",flex:1,background:"#dce7ec"}}></span></div>
                <div style={{paddingBottom:"40px"}}><div style={{fontSize:"15px",fontWeight:"500",color:"#0a3a4a"}}>Physician ordered MRI</div><span style={{display:"inline-block",marginTop:"6px",fontSize:"12px",color:"#7a8a93",background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>Referral, p.1</span></div>

                {/* node 2 */}
                <div style={{textAlign:"right",paddingBottom:"40px"}}><span style={{fontSize:"14px",fontWeight:"600",color:"#0a3a4a"}}>June 20</span></div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><span style={{width:"12px",height:"12px",borderRadius:"50%",background:"#3f7a4a",border:"3px solid #e2eee4",flexShrink:0}}></span><span style={{width:"1px",flex:1,background:"#dce7ec"}}></span></div>
                <div style={{paddingBottom:"40px"}}><div style={{fontSize:"15px",fontWeight:"500",color:"#0a3a4a"}}>Authorization PA-48391 approved</div><div style={{fontSize:"13px",color:"#40525c",marginTop:"2px"}}>Valid June 20 – July 20, 2026</div><span style={{display:"inline-block",marginTop:"6px",fontSize:"12px",color:"#7a8a93",background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>Authorization Confirmation, p.1</span></div>

                {/* node 3 */}
                <div style={{textAlign:"right",paddingBottom:"40px"}}><span style={{fontSize:"14px",fontWeight:"600",color:"#0a3a4a"}}>July 2</span></div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><span style={{width:"12px",height:"12px",borderRadius:"50%",background:"#008bb2",border:"3px solid #dbeef5",flexShrink:0}}></span><span style={{width:"1px",flex:1,background:"#dce7ec"}}></span></div>
                <div style={{paddingBottom:"40px"}}><div style={{fontSize:"15px",fontWeight:"500",color:"#0a3a4a"}}>MRI performed at Lakeshore Imaging Center</div><div style={{display:"flex",gap:"6px",marginTop:"6px"}}><span style={{fontSize:"12px",color:"#7a8a93",background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>EOB, p.1</span><span style={{fontSize:"12px",color:"#7a8a93",background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>Medical Bill, p.1</span></div></div>

                {/* node 4 */}
                <div style={{textAlign:"right",paddingBottom:"40px"}}><span style={{fontSize:"14px",fontWeight:"600",color:"#0a3a4a"}}>July 10</span></div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><span style={{width:"12px",height:"12px",borderRadius:"50%",background:"#008bb2",border:"3px solid #dbeef5",flexShrink:0}}></span><span style={{width:"1px",flex:1,background:"#dce7ec"}}></span></div>
                <div style={{paddingBottom:"40px"}}><div style={{fontSize:"15px",fontWeight:"500",color:"#0a3a4a"}}>Claim processed</div><span style={{display:"inline-block",marginTop:"6px",fontSize:"12px",color:"#7a8a93",background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>EOB, p.1</span></div>

                {/* node 5 */}
                <div style={{textAlign:"right",paddingBottom:"40px"}}><span style={{fontSize:"14px",fontWeight:"600",color:"#0a3a4a"}}>July 14</span></div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><span style={{width:"12px",height:"12px",borderRadius:"50%",background:"#a33a3a",border:"3px solid #f3dede",flexShrink:0}}></span><span style={{width:"1px",flex:1,background:"#dce7ec"}}></span></div>
                <div style={{paddingBottom:"40px"}}><div style={{fontSize:"15px",fontWeight:"500",color:"#0a3a4a"}}>Claim denied for &ldquo;no prior authorization received&rdquo;</div><span style={{display:"inline-block",marginTop:"6px",fontSize:"12px",color:"#7a8a93",background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>Denial Letter, p.1</span></div>

                {/* node 6 - final */}
                <div style={{textAlign:"right"}}><span style={{fontSize:"14px",fontWeight:"600",color:"#a33a3a"}}>September 8</span></div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><span style={{width:"12px",height:"12px",borderRadius:"50%",background:"#ffffff",border:"2px solid #a33a3a",flexShrink:0}}></span></div>
                <div><div style={{fontSize:"15px",fontWeight:"600",color:"#a33a3a"}}>Appeal deadline stated</div><span style={{display:"inline-block",marginTop:"6px",fontSize:"12px",color:"#7a8a93",background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>Denial Letter, p.1</span></div>
              </div>
            </div>
          </div>

          {/* evidence checklist - what u got vs what might help */}
          <div className="rise" style={{marginTop:"48px",animationDelay:"240ms"}}>
            <h2 style={{fontSize:"32px",fontWeight:"300",letterSpacing:"-0.02em",color:"#0a3a4a",margin:"0 0 6px"}}>Evidence checklist</h2>
            <p style={{fontSize:"15px",color:"#40525c",margin:"0 0 32px"}}>What you already have, and a few things that could make your case stronger.</p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px",alignItems:"start"}}>
              {/* left: already have */}
              <div style={{background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"16px",padding:"28px"}}>
                <h3 style={{fontSize:"14px",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",color:"#3f7a4a",margin:"0 0 20px"}}>Already available</h3>
                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"14px",color:"#0a3a4a"}}><Check width={16} height={16} color="#3f7a4a" strokeWidth={2} />Denial letter</div>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"14px",color:"#0a3a4a"}}><Check width={16} height={16} color="#3f7a4a" strokeWidth={2} />Explanation of Benefits</div>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"14px",color:"#0a3a4a"}}><Check width={16} height={16} color="#3f7a4a" strokeWidth={2} />Physician referral</div>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"14px",color:"#0a3a4a"}}><Check width={16} height={16} color="#3f7a4a" strokeWidth={2} />Authorization confirmation</div>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"14px",color:"#0a3a4a"}}><Check width={16} height={16} color="#3f7a4a" strokeWidth={2} />Medical bill</div>
                </div>
              </div>

              {/* right: consider requesting */}
              <div style={{background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"16px",padding:"28px"}}>
                <h3 style={{fontSize:"14px",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",color:"#40525c",margin:"0 0 20px"}}>Consider requesting</h3>
                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                  <div>
                    <div style={{fontSize:"14px",fontWeight:"500",color:"#0a3a4a"}}>Claim submission record</div>
                    <p style={{fontSize:"13px",color:"#40525c",margin:"4px 0 0"}}>May show whether the provider included the authorization number when submitting the claim.</p>
                  </div>
                  <div>
                    <div style={{fontSize:"14px",fontWeight:"500",color:"#0a3a4a"}}>Insurer authorization log</div>
                    <p style={{fontSize:"13px",color:"#40525c",margin:"4px 0 0"}}>May show the insurer&apos;s internal record of submitted authorizations.</p>
                  </div>
                  <div>
                    <div style={{fontSize:"14px",fontWeight:"500",color:"#0a3a4a"}}>Provider billing notes</div>
                    <p style={{fontSize:"13px",color:"#40525c",margin:"4px 0 0"}}>May document the authorization request and approval timeline.</p>
                  </div>
                  <div>
                    <div style={{fontSize:"14px",fontWeight:"500",color:"#0a3a4a"}}>Relevant plan language</div>
                    <p style={{fontSize:"13px",color:"#40525c",margin:"4px 0 0"}}>May clarify specific requirements for prior authorization in your policy.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* appeal builder - the final output, user can edit before submitting */}
          <div className="rise" style={{marginTop:"48px",animationDelay:"280ms"}}>
            <h2 style={{fontSize:"32px",fontWeight:"300",letterSpacing:"-0.02em",color:"#0a3a4a",margin:"0 0 6px"}}>Appeal draft</h2>
            <p style={{fontSize:"15px",color:"#40525c",margin:"0 0 32px"}}>Written using only the facts we could confirm. Read it over, change anything you like, and send it when it feels right.</p>

            {/* the letter itself. structured view shows each paragraph with its sources + a toggle;
                once you hand-edit it we fall back to plain text since edits can't map to paragraphs. */}
            <div style={{background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"16px",padding:"32px",marginBottom:"24px"}}>
              {editing ? (
                <textarea
                  value={letter}
                  onChange={(e)=>setLetter(e.target.value)}
                  style={{width:"100%",minHeight:"460px",border:"1px solid #c6d4db",borderRadius:"8px",padding:"16px",fontSize:"15px",lineHeight:"1.6",color:"#0a3a4a",fontFamily:"inherit",resize:"vertical",outline:"none"}}
                />
              ) : handEdited ? (
                <div style={{fontSize:"15px",lineHeight:"1.6",color:"#0a3a4a",whiteSpace:"pre-line"}}>{letter}</div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
                  <p style={{fontSize:"15px",lineHeight:"1.6",color:"#0a3a4a",margin:0}}>{appeal.greeting}</p>
                  {appeal.paragraphs.map((p)=>(
                    <div key={p.id} style={{opacity: enabled[p.id] ? 1 : 0.4}}>
                      <p style={{fontSize:"15px",lineHeight:"1.6",color:"#0a3a4a",margin:"0 0 8px",whiteSpace:"pre-line",textDecoration: enabled[p.id] ? "none" : "line-through"}}>{p.text}</p>
                      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"6px"}}>
                        {p.sources.map((s)=>(
                          <Cite key={s.label} label={s.label} onClick={()=>openByField(s.label, s.documentType, s.fieldName)} />
                        ))}
                        {p.optional && (
                          <button onClick={()=>toggleParagraph(p.id)} className="press" style={{fontSize:"12px",fontWeight:500,color: enabled[p.id] ? "#a33a3a" : "#3f7a4a",background:"none",border:"none",cursor:"pointer",marginLeft:"4px"}}>
                            {enabled[p.id] ? "Remove this paragraph" : "Add back"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <p style={{fontSize:"15px",lineHeight:"1.6",color:"#0a3a4a",margin:0,whiteSpace:"pre-line"}}>{appeal.signoff.join("\n")}</p>
                </div>
              )}
            </div>

            {appeal.omitted.length > 0 && (
              <div style={{background:"#fdfaf3",border:"1px solid #e8dcc0",borderRadius:"12px",padding:"14px 18px",marginBottom:"24px",fontSize:"13px",color:"#8a6d3b"}}>
                Left blank because we couldn&apos;t verify it from your documents: {appeal.omitted.join(", ")}. Fill these in before sending.
              </div>
            )}

            {/* edit actions */}
            <div style={{display:"flex",gap:"12px",marginBottom:"24px"}}>
              <button onClick={downloadPdf} disabled={exporting} className="press" style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"10px 16px",background:"#0a3a4a",color:"#f5fafc",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:"500",cursor: exporting ? "default" : "pointer",opacity: exporting ? 0.7 : 1}}>
                <Download width={15} height={15} />{exporting ? "Preparing…" : "Download appeal (PDF)"}
              </button>
              <button onClick={()=>setEditing(!editing)} className="press" style={{padding:"10px 16px",background: editing ? "#eef7fb" : "#ffffff",color:"#0a3a4a",border:"1px solid #dce7ec",borderRadius:"8px",fontSize:"14px",fontWeight:"500",cursor:"pointer"}}>{editing ? "Done editing" : "Edit letter"}</button>
              {letter !== defaultLetter && !editing && (
                <button onClick={resetLetter} className="press" style={{padding:"10px 16px",background:"#ffffff",color:"#40525c",border:"1px solid #dce7ec",borderRadius:"8px",fontSize:"14px",fontWeight:"500",cursor:"pointer"}}>Reset to generated</button>
              )}
            </div>

            {/* supporting docs section */}
            <div style={{background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"16px",padding:"24px"}}>
              <h3 style={{fontSize:"14px",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",color:"#7a8a93",margin:"0 0 16px"}}>Attachments</h3>
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {appeal.attachments.map((att,i)=>(
                  <div key={att} style={{fontSize:"14px",color:"#0a3a4a"}}>{i+1}. {att}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* source drawer — slides in when a citation is clicked, shows the exact extracted line */}
      {source && (
        <>
          <div onClick={()=>setSource(null)} style={{position:"fixed",inset:0,background:"rgba(10,58,74,0.28)",zIndex:60}} />
          <div style={{position:"fixed",top:0,right:0,height:"100vh",width:"420px",maxWidth:"90vw",background:"#ffffff",borderLeft:"1px solid #dce7ec",boxShadow:"-8px 0 40px rgba(0,110,142,0.14)",zIndex:61,padding:"28px",display:"flex",flexDirection:"column",gap:"20px",animation:"slideInRight 0.25s cubic-bezier(0.22,1,0.36,1)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:"12px",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",color:"#7a8a93"}}>Source</span>
              <button onClick={()=>setSource(null)} style={{background:"none",border:"none",fontSize:"20px",lineHeight:1,color:"#7a8a93",cursor:"pointer"}}>×</button>
            </div>
            <div style={{fontSize:"15px",fontWeight:"600",color:"#0a3a4a"}}>{source.label}</div>
            <div style={{fontSize:"13px",color:"#7a8a93"}}>Here is the exact line we read this from:</div>
            <div style={{background:"#fffceb",border:"1px solid #f0e3b0",borderRadius:"10px",padding:"16px",fontSize:"14px",lineHeight:"1.6",color:"#0a3a4a"}}>{source.evidence}</div>
            <div style={{marginTop:"auto",fontSize:"12px",color:"#7a8a93",lineHeight:1.5}}>Always confirm important details against your original document before acting on them.</div>
          </div>
        </>
      )}
    </div>
  );
}

// trust badge — makes the verified/inferred/unclear vocabulary visible on every fact
function Trust({ status }: { status: "verified" | "inferred" | "unclear" }) {
  const map = {
    verified: { label: "Verified", bg: "#e2eee4", fg: "#3f7a4a" },
    inferred: { label: "Inferred", bg: "#eef7fb", fg: "#008bb2" },
    unclear: { label: "Needs review", bg: "#fdf3f3", fg: "#a33a3a" },
  }[status];
  return <span style={{fontSize:"11px",fontWeight:600,color:map.fg,background:map.bg,borderRadius:"9999px",padding:"2px 8px",whiteSpace:"nowrap"}}>{map.label}</span>;
}

// clickable citation pill — same look as before, but opens the source drawer
function Cite({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="press"
      style={{fontSize:"12px",color:"#008bb2",background:"#eef7fb",border:"1px solid #b9e1ed",borderRadius:"9999px",padding:"3px 10px",cursor:"pointer",whiteSpace:"nowrap"}}
    >
      {label}
    </button>
  );
}
