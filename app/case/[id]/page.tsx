"use client";
import Link from "next/link";
import sampleData from "@/data/sample-case.json";

// alright case dashboard built in like 30 mins yessir
export default function CasePage({ params: _params }: { params: { id: string } }) {
  // hardcoded sample case rn
  const c = sampleData;

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"#f5fafc"}}>
      <header style={{position:"sticky",top:0,zIndex:50,height:"64px",display:"flex",alignItems:"center",background:"rgba(255,255,255,0.85)",backdropFilter:"blur(12px)",borderBottom:"1px solid #dce7ec"}}>
        <div style={{width:"100%",maxWidth:"80rem",margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:"8px",textDecoration:"none"}}>
            <div style={{width:"28px",height:"28px",borderRadius:"8px",background:"linear-gradient(135deg, #006e8e 0%, #008bb2 45%, #0ea5cf 100%)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 6 9 17l-5-5"></path></svg>
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
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"24px",marginBottom:"32px"}}>
            <div>
              <h1 style={{fontSize:"32px",fontWeight:"300",letterSpacing:"-0.02em",color:"#0a3a4a",margin:"0 0 6px"}}>Case summary</h1>
              <p style={{fontSize:"15px",color:"#40525c",margin:0}}>Every field is linked to its source document.</p>
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"8px 16px",borderRadius:"9999px",background:"#fdf3f3",border:"1px solid rgba(163,58,58,0.3)"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a33a3a" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#a33a3a"}}>Potential discrepancy detected</span>
            </div>
          </div>

          <div style={{background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"16px",overflow:"hidden"}}>
            {/* service row */}
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #dce7ec"}}>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#7a8a93"}}>Service</span>
              <span style={{fontSize:"15px",fontWeight:"500",color:"#0a3a4a"}}>Knee MRI</span>
              <span style={{fontSize:"12px",color:"#7a8a93",background:"#f5fafc",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>Denial Letter, p.1</span>
            </div>
            {/* date row */}
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #dce7ec"}}>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#7a8a93"}}>Date of service</span>
              <span style={{fontSize:"15px",fontWeight:"500",color:"#0a3a4a"}}>July 2, 2026</span>
              <span style={{fontSize:"12px",color:"#7a8a93",background:"#f5fafc",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>EOB, p.1</span>
            </div>
            {/* provider row */}
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #dce7ec"}}>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#7a8a93"}}>Provider</span>
              <span style={{fontSize:"15px",fontWeight:"500",color:"#0a3a4a"}}>Lakeshore Imaging Center</span>
              <span style={{fontSize:"12px",color:"#7a8a93",background:"#f5fafc",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>Denial Letter, p.1</span>
            </div>
            {/* amount row */}
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #dce7ec"}}>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#7a8a93"}}>Amount denied</span>
              <span style={{fontSize:"15px",fontWeight:"600",color:"#0a3a4a"}}>$4,800</span>
              <span style={{fontSize:"12px",color:"#7a8a93",background:"#f5fafc",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>Denial Letter, p.1</span>
            </div>
            {/* reason row */}
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #dce7ec"}}>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#7a8a93"}}>Stated reason</span>
              <span style={{fontSize:"15px",fontWeight:"500",color:"#0a3a4a"}}>Missing prior authorization</span>
              <span style={{fontSize:"12px",color:"#7a8a93",background:"#f5fafc",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>Denial Letter, p.1</span>
            </div>
            {/* deadline row */}
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #dce7ec"}}>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#7a8a93"}}>Appeal deadline</span>
              <span style={{fontSize:"15px",fontWeight:"600",color:"#a33a3a"}}>September 8, 2026 — 59 days remaining</span>
              <span style={{fontSize:"12px",color:"#7a8a93",background:"#f5fafc",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>Denial Letter, p.1</span>
            </div>
            {/* status row */}
            <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:"16px",alignItems:"center",padding:"18px 24px"}}>
              <span style={{fontSize:"13px",fontWeight:"600",color:"#7a8a93"}}>Case status</span>
              <span style={{fontSize:"15px",fontWeight:"500",color:"#a33a3a"}}>Potential discrepancy detected</span>
              <span style={{fontSize:"12px",color:"#7a8a93",background:"#f5fafc",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px"}}>Rule engine</span>
            </div>
          </div>

          {/* discrepancy card is the main thing here, the whole point tbh */}
          <div style={{marginTop:"48px"}}>
            <h2 style={{fontSize:"32px",fontWeight:"300",letterSpacing:"-0.02em",color:"#0a3a4a",margin:"0 0 6px"}}>Discrepancy review</h2>
            <p style={{fontSize:"15px",color:"#40525c",margin:"0 0 32px",maxWidth:"720px"}}>Our rule engine compares extracted facts across documents before any explanation is generated. This finding is presented for your review — it does not mean the insurer is wrong.</p>

            {/* banner showing the main discrepancy - using gradient top to match design */}
            <div style={{background:"#f5fafc",border:"1px solid rgba(0,139,178,0.35)",borderRadius:"16px",padding:"28px",position:"relative",overflow:"hidden",boxShadow:"0 4px 24px rgba(0,110,142,0.12)",marginBottom:"32px"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(135deg, #006e8e 0%, #008bb2 45%, #0ea5cf 100%)"}}></div>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 12px",borderRadius:"9999px",background:"#fdf3f3",border:"1px solid rgba(163,58,58,0.3)",fontSize:"12px",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",color:"#a33a3a"}}>Major potential discrepancy</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 10px 4px 8px",borderRadius:"9999px",background:"#eef7fb",border:"1px solid #b9e1ed",fontSize:"13px",fontWeight:"500",color:"#008bb2"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path></svg>Verified by rule engine</span>
              </div>
              <p style={{fontSize:"17px",lineHeight:"1.6",color:"#0a3a4a",margin:0,maxWidth:"800px"}}>The denial states that no prior authorization was received. However, the uploaded authorization confirmation appears to approve the same MRI, provider, and service date.</p>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"16px"}}>
                <span style={{fontSize:"12px",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",color:"#7a8a93"}}>Confidence</span>
                <span style={{display:"inline-flex",gap:"3px"}}>
                  <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#008bb2"}}></span>
                  <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#008bb2"}}></span>
                  <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#008bb2"}}></span>
                  <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#c6d4db"}}></span>
                </span>
              </div>
            </div>

            {/* three cards showing the contradiction - keeps them side by side so you can see the issue */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"20px",marginBottom:"32px"}}>
              <div style={{background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"16px",padding:"24px",display:"flex",flexDirection:"column",gap:"12px"}}>
                <span style={{fontSize:"12px",fontWeight:"600",letterSpacing:"0.16em",textTransform:"uppercase",color:"#a33a3a"}}>Insurer statement</span>
                <p style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:"22px",lineHeight:"1.35",color:"#0a3a4a",margin:0,flex:1}}>"No prior authorization was received."</p>
                <span style={{fontSize:"12px",color:"#7a8a93",background:"#f5fafc",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px",alignSelf:"flex-start"}}>Denial Letter, p.1</span>
              </div>
              <div style={{background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"16px",padding:"24px",display:"flex",flexDirection:"column",gap:"12px"}}>
                <span style={{fontSize:"12px",fontWeight:"600",letterSpacing:"0.16em",textTransform:"uppercase",color:"#008bb2"}}>Conflicting evidence</span>
                <p style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:"22px",lineHeight:"1.35",color:"#0a3a4a",margin:0,flex:1}}>"Authorization PA-48391 approved for MRI services."</p>
                <span style={{fontSize:"12px",color:"#7a8a93",background:"#f5fafc",border:"1px solid #dce7ec",borderRadius:"9999px",padding:"3px 10px",alignSelf:"flex-start"}}>Authorization Confirmation, p.1</span>
              </div>
              <div style={{background:"#ffffff",border:"1px solid #dce7ec",borderRadius:"16px",padding:"24px",display:"flex",flexDirection:"column",gap:"12px"}}>
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
                <span style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"13px",color:"#0a3a4a",background:"#eef7fb",borderRadius:"9999px",padding:"6px 14px"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3f7a4a" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg>Patient matches</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"13px",color:"#0a3a4a",background:"#eef7fb",borderRadius:"9999px",padding:"6px 14px"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3f7a4a" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg>Provider matches</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"13px",color:"#0a3a4a",background:"#eef7fb",borderRadius:"9999px",padding:"6px 14px"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3f7a4a" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg>Service matches</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"13px",color:"#0a3a4a",background:"#eef7fb",borderRadius:"9999px",padding:"6px 14px"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3f7a4a" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg>Service date within validity period</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"13px",color:"#0a3a4a",background:"#eef7fb",borderRadius:"9999px",padding:"6px 14px"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3f7a4a" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg>Authorization status approved</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
