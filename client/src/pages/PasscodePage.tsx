import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/contexts/SessionContext";

export default function PasscodePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { setSession } = useSession();
  const verifyMutation = trpc.passcode.verify.useMutation();

  // URLパラメータからアクセス経路を取得
  const params = new URLSearchParams(window.location.search);
  const channel = params.get("ch") || "web";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await verifyMutation.mutateAsync({ code: code.trim() });
      setSession({
        type: result.type,
        partnerSalonId: result.partnerSalonId,
        salonName: result.salonName,
        label: result.label,
      });
      // ロール別にリダイレクト
      if (result.type === "admin") {
        navigate("/admin");
      } else if (result.type === "partner") {
        navigate("/partner");
      } else {
        // 一般パスコードの場合はトップ（体質タイプ紹介）へ
        navigate(`/?ch=${channel}`);
      }
    } catch {
      setError("パスコードが正しくありません。もう一度お確かめください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--herbs-page-bg)" }}>
      {/* ロゴ・ブランド */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="mb-3" style={{ color: "var(--herbs-green)", letterSpacing: "0.25em", fontSize: "11px", fontFamily: "'Cormorant Garamond', serif", textTransform: "uppercase" }}>
          Botanical Beauty
        </div>
        <h1 className="herbs-font-serif" style={{ fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 300, color: "var(--herbs-green)", letterSpacing: "0.15em", lineHeight: 1.2 }}>
          THE HERBS
        </h1>
        <div style={{ width: 48, height: 1, background: "var(--herbs-gold)", margin: "12px auto" }} />
        <p style={{ fontSize: "13px", color: "var(--herbs-muted)", letterSpacing: "0.1em" }}>
          パーソナルカウンセリング
        </p>
      </div>

      {/* パスコード入力カード */}
      <div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <div className="rounded-2xl p-8 shadow-lg" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 500, color: "var(--herbs-green)", textAlign: "center", marginBottom: "6px", letterSpacing: "0.05em" }}>
            パスコードを入力してください
          </h2>
          <p style={{ fontSize: "13px", color: "var(--herbs-muted)", textAlign: "center", marginBottom: "24px" }}>
            スタッフよりお伝えしたパスコードをご入力ください
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="パスコード"
              autoComplete="off"
              autoCapitalize="none"
              style={{
                padding: "14px 16px",
                fontSize: "18px",
                letterSpacing: "0.2em",
                border: `1.5px solid ${error ? "#C47A5A" : "var(--herbs-light)"}`,
                borderRadius: "10px",
                background: "var(--herbs-cream)",
                color: "var(--herbs-green)",
                outline: "none",
                marginBottom: "8px",
                width: "100%",
                textAlign: "center",
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            />
            {error && (
              <p style={{ fontSize: "13px", color: "var(--herbs-terra)", textAlign: "center", marginBottom: "12px" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !code.trim()}
              style={{
                width: "100%",
                padding: "14px",
                background: loading || !code.trim() ? "var(--herbs-light)" : "var(--herbs-green)",
                color: loading || !code.trim() ? "var(--herbs-muted)" : "var(--herbs-white)",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                letterSpacing: "0.1em",
                cursor: loading || !code.trim() ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                marginTop: "8px",
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              {loading ? "確認中..." : "入力する"}
            </button>
          </form>
        </div>

        <p style={{ fontSize: "12px", color: "var(--herbs-muted)", textAlign: "center", marginTop: "20px", lineHeight: 1.8 }}>
          スタッフ・パートナーサロン専用のページです
        </p>
        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <button onClick={() => navigate("/")} style={{ fontSize: "13px", color: "var(--herbs-green)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            アンケートトップへ戻る
          </button>
        </div>
      </div>
    </div>
  );
}
