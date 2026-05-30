import { useLocation } from "wouter";

const ILLUST_URLS: Record<string, string> = {
  ecto: "/manus-storage/herbs-ecto_e909f0ad.png",
  meso: "/manus-storage/herbs-meso_94923867.png",
  endo: "/manus-storage/herbs-endo_6ed69735.png",
  unknown: "/manus-storage/herbs-meso_94923867.png",
};

const TYPE_INFO = {
  ecto: {
    label: "外胚葉型",
    subtitle: "Ectomorph Type",
    color: "#C4604A",
    bg: "#FDF0EB",
    bd: "#EDCAB8",
    icon: "🌿",
    tagline: "繊細・敏感・軽やか",
    description: "あなたは外胚葉型の体質です。神経系・皮膚・感覚器官が発達した繊細な体質で、乾燥しやすく敏感な頭皮をお持ちです。",
    care: "頭皮の保湿ケアを最優先に、植物性の穏やかな成分でのケアをお勧めします。THE HERBSのボタニカルミストによるスチームケアが特に効果的です。",
    products: ["ハーブスチーマー（ボタニカルミスト）", "保湿ローション セラピエ", "スカルプエッセンス ルシボム"],
  },
  meso: {
    label: "中胚葉型",
    subtitle: "Mesomorph Type",
    color: "#3A6285",
    bg: "#EBF2F8",
    bd: "#C0D8EC",
    icon: "🌱",
    tagline: "バランス・活力・安定",
    description: "あなたは中胚葉型の体質です。筋骨格系が発達したバランスの良い体質で、頭皮も比較的健康な状態を保ちやすいです。",
    care: "定期的な頭皮クレンジングと、季節に合わせたバランスケアをお勧めします。頭皮の定期チェックで状態を把握することが大切です。",
    products: ["頭皮用ゴマージュ", "スカルプエッセンス ルシボム", "ハーブスチーマー（ボタニカルミスト）"],
  },
  endo: {
    label: "内胚葉型",
    subtitle: "Endomorph Type",
    color: "#9A4870",
    bg: "#FDF0F5",
    bd: "#E8C0D0",
    icon: "🌸",
    tagline: "豊か・潤い・温かみ",
    description: "あなたは内胚葉型の体質です。消化器系・内分泌系が発達した体質で、頭皮の皮脂が多くなりやすい傾向があります。",
    care: "頭皮の定期的なゴマージュ（スクラブ）と毛穴クレンジングをお勧めします。スカルプエッセンス ルシボムで毛穴づまりを解消しましょう。",
    products: ["頭皮用ゴマージュ", "スカルプエッセンス ルシボム", "シャンプーラヴェ"],
  },
  unknown: {
    label: "バランス型",
    subtitle: "Balanced Type",
    color: "#5A7A5A",
    bg: "#F0F5F0",
    bd: "#C8DCC8",
    icon: "🌿",
    tagline: "バランス・調和",
    description: "あなたはバランスの取れた体質です。複数の体質タイプの特徴を持っています。",
    care: "総合的なケアをお勧めします。頭皮の定期チェックで状態を把握しながら、季節に合わせたケアを行いましょう。",
    products: ["ハーブスチーマー（ボタニカルミスト）", "スカルプエッセンス ルシボム", "頭皮用ゴマージュ"],
  },
};

export default function ResultPage() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const ecto = parseInt(params.get("ecto") || "0");
  const meso = parseInt(params.get("meso") || "0");
  const endo = parseInt(params.get("endo") || "0");
  const name = decodeURIComponent(params.get("name") || "");
  const type = (params.get("type") || "unknown") as keyof typeof TYPE_INFO;
  const channel = params.get("ch") || "web";

  const total = ecto + meso + endo || 1;
  const info = TYPE_INFO[type] || TYPE_INFO.unknown;

  const bars = [
    { label: "外胚葉型", score: ecto, color: "#C4604A", bg: "#FDF0EB" },
    { label: "中胚葉型", score: meso, color: "#3A6285", bg: "#EBF2F8" },
    { label: "内胚葉型", score: endo, color: "#9A4870", bg: "#FDF0F5" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--herbs-page-bg)" }}>
      {/* ヘッダー */}
      <header style={{ background: "var(--herbs-white)", borderBottom: "1px solid var(--herbs-light)", padding: "16px 20px" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.25em", color: "var(--herbs-gold)", fontFamily: "'Cormorant Garamond', serif" }}>
              Botanical Beauty
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 300, color: "var(--herbs-green)", letterSpacing: "0.12em", fontFamily: "'Cormorant Garamond', serif" }}>
              THE HERBS
            </h1>
          </div>
          <div style={{ fontSize: "11px", color: "var(--herbs-muted)" }}>診断結果</div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 完了メッセージ */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>✨</div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--herbs-green)", marginBottom: "4px" }}>
            {name ? `${name} 様の` : ""}診断が完了しました
          </h2>
          <p style={{ fontSize: "13px", color: "var(--herbs-muted)" }}>
            カウンセリングシートをご記入いただきありがとうございます
          </p>
        </div>

        {/* 主要体質タイプ */}
        <div className="rounded-2xl mb-6 animate-fade-in-up overflow-hidden" style={{ background: info.bg, border: `2px solid ${info.bd}`, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          {/* イラスト */}
          <div style={{ position: "relative" }}>
            <img
              src={ILLUST_URLS[type] || ILLUST_URLS.ecto}
              alt={`${info.label}のイラスト`}
              style={{ width: "100%", maxHeight: "280px", objectFit: "cover", objectPosition: "center top", display: "block" }}
            />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: `linear-gradient(transparent, ${info.bg}ee)`, padding: "20px 20px 14px" }}>
              <div style={{ fontSize: "11px", color: info.color, letterSpacing: "0.2em", fontFamily: "'Cormorant Garamond', serif" }}>YOUR TYPE</div>
              <div style={{ fontSize: "28px", fontWeight: 600, color: info.color, letterSpacing: "0.05em" }}>{info.label}</div>
              <div style={{ fontSize: "13px", color: info.color, opacity: 0.9 }}>{info.tagline}</div>
            </div>
          </div>
          <div className="p-5">
            <div style={{ fontSize: "12px", color: info.color, letterSpacing: "0.1em", fontFamily: "'Cormorant Garamond', serif", marginBottom: "6px" }}>{info.subtitle}</div>
            <p style={{ fontSize: "14px", color: "#333", lineHeight: 1.9 }}>
              {info.description}
            </p>
          </div>
        </div>

        {/* 体質タイプ判定バー */}
        <div className="rounded-2xl p-5 mb-6 animate-fade-in-up" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--herbs-green)", marginBottom: "16px" }}>
            体質タイプ判定
          </div>
          <div className="space-y-4">
            {bars.map(bar => (
              <div key={bar.label}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: "13px", color: bar.color, fontWeight: 600 }}>{bar.label}</span>
                  <span style={{ fontSize: "13px", color: bar.color }}>{bar.score}項目</span>
                </div>
                <div style={{ height: 10, background: "#F0EDE8", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${(bar.score / total) * 100}%`,
                    background: bar.color,
                    borderRadius: 5,
                    transition: "width 0.8s cubic-bezier(0.23, 1, 0.32, 1)",
                    minWidth: bar.score > 0 ? "4px" : "0",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ケアアドバイス */}
        <div className="rounded-2xl p-5 mb-6 animate-fade-in-up" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--herbs-green)", marginBottom: "12px" }}>
            THE HERBS からのケアアドバイス
          </div>
          <p style={{ fontSize: "14px", color: "#333", lineHeight: 1.9, marginBottom: "16px" }}>
            {info.care}
          </p>
          <div style={{ borderTop: "1px solid var(--herbs-light)", paddingTop: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--herbs-gold)", letterSpacing: "0.05em", marginBottom: "10px" }}>
              おすすめ製品
            </div>
            <div className="space-y-2">
              {info.products.map((p, i) => (
                <div key={i} style={{
                  padding: "10px 14px",
                  background: "var(--herbs-cream)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "var(--herbs-green)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <span style={{ color: "var(--herbs-gold)", fontSize: "10px" }}>●</span>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* アクション */}
        <div className="space-y-3 animate-fade-in-up">
          <button
            onClick={() => window.print()}
            className="no-print"
            style={{
              width: "100%", padding: "14px",
              background: "var(--herbs-green)", color: "var(--herbs-white)",
              border: "none", borderRadius: "12px",
              fontSize: "14px", cursor: "pointer", letterSpacing: "0.05em",
            }}>
            印刷・PDF保存
          </button>
          <button
            onClick={() => navigate(`/counseling?ch=${channel}`)}
            style={{
              width: "100%", padding: "14px",
              background: "var(--herbs-white)", color: "var(--herbs-green)",
              border: "1.5px solid var(--herbs-light)", borderRadius: "12px",
              fontSize: "14px", cursor: "pointer",
            }}>
            もう一度診断する
          </button>
        </div>

        {/* フッター */}
        <div className="text-center mt-10">
          <div style={{ width: 32, height: 1, background: "var(--herbs-gold)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: "12px", color: "var(--herbs-muted)", lineHeight: 1.8 }}>
            THE HERBS パーソナルカウンセリング<br />
            植物美容メソッドに基づく体質ケアのご提案
          </p>
        </div>
      </main>
    </div>
  );
}
