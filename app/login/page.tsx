"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Mail } from "lucide-react";

// demo login only — no real auth (spec says skip auth unless trivial). just gets you into a case.
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("maya@example.com");
  const [password, setPassword] = useState("");

  const signIn = () => router.push("/new-case");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5fafc" }}>
      <header
        className="sticky top-0 z-50 h-16 flex items-center"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #dce7ec" }}
      >
        <div className="w-full max-w-5xl mx-auto px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "linear-gradient(135deg, #006e8e 0%, #008bb2 45%, #0ea5cf 100%)" }}>
              <Check width={15} height={15} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold" style={{ color: "#0a3a4a" }}>ClaimRight</span>
          </Link>
          <span className="text-xs" style={{ color: "#7a8a93" }}>This is a sample login, nothing is stored</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-8 py-20">
        <div className="rise w-full max-w-sm">
          <h1
            className="text-4xl font-light mb-2 text-center"
            style={{ fontFamily: "var(--font-cormorant), serif", fontStyle: "italic", color: "#0a3a4a", letterSpacing: "-0.02em" }}
          >
            Welcome back
          </h1>
          <p className="text-center text-sm mb-8" style={{ color: "#40525c" }}>
            Sign in to pick up where you left off with your case.
          </p>

          <div className="bg-white rounded-2xl border p-8 flex flex-col gap-5" style={{ borderColor: "#dce7ec" }}>
            <div>
              <Label className="text-sm font-semibold mb-2 block">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full"
                style={{ borderColor: "#c6d4db", color: "#0a3a4a" }}
              />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2 block">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Any password works for the demo"
                className="h-11 w-full"
                style={{ borderColor: "#c6d4db", color: "#0a3a4a" }}
              />
            </div>

            <Button
              onClick={signIn}
              size="lg"
              className="press h-12 text-sm font-semibold tracking-wider uppercase"
              style={{ background: "#0a3a4a", color: "#f5fafc" }}
            >
              Sign in
            </Button>

            <div className="flex items-center gap-3">
              <span className="flex-1 h-px" style={{ background: "#dce7ec" }} />
              <span className="text-xs" style={{ color: "#7a8a93" }}>or</span>
              <span className="flex-1 h-px" style={{ background: "#dce7ec" }} />
            </div>

            <button
              onClick={signIn}
              className="press flex items-center justify-center gap-2 h-11 rounded-lg border"
              style={{ borderColor: "#c6d4db", background: "#ffffff", color: "#0a3a4a", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer" }}
            >
              <Mail width={16} height={16} color="#008bb2" />
              Continue with email link
            </button>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: "#40525c" }}>
            New here?{" "}
            <Link href="/new-case" style={{ color: "#008bb2", fontWeight: 500 }}>
              Start a case
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
