import { useState } from "react";
import { useLocation } from "wouter";

const ILLUST_URLS: Record<string, string> = {
  ecto: "/manus-storage/type_ecto_54491da2.png",
  meso: "/manus-storage/type_meso_43e96528.png",
  endo: "/manus-storage/type_endo_06502e5b.png",
};

const TYPES = [
  {
    id: "ecto",
    label: "外胚葉型",
    subtitle: "Ectomorph Type",
    color: "#C4604A",
    bg: "#FDF0EB",
    bd: "#EDCAB8",
    tagline: "繊細・敏感・クリエイティブ",
    description: "外胚葉型は、神経系・皮膚・感覚器官が発達した繊細な体質です。細身で、肌がくすみやすい傾向です。",
    traits: [
      "細身・太りにくい体型",
      "乾燥肌・日焼けしやすい傾向",
      "髪が太く、ボリュームが出やすい",
      "頭皮のニオイが気になりやすい",
      "ストレスが消化機能に影響しやすい",
      "冷え性の傾向がある",
    ],
    hairFeatures: [
      "しっかりした髪・癖毛傾向",
      "頭皮のニオイ・かゆみ",
      "思春期に癖毛になる人が多い",
      "肌がくすみやすい",
    ],
    carePoint: "消化に良い食生活を心がけ、頭皮を清潔に保つためクレンジングケアが効果的です。",
  },
  {
    id: "meso",
    label: "中胚葉型",
    subtitle: "Mesomorph Type",
    color: "#3A6285",
    bg: "#EBF2F8",
    bd: "#C0D8EC",
    tagline: "バランス・活力・安定",
    description: "中胚葉型は、筋骨格系が発達した体質です。皮脂分泌が盛んになりやすい傾向があり、頭皮のべたつきや毛穴づまりが気になることがあります。",
    traits: [
      "筋肉質・引き締まった体型",
      "インナードライ肌の傾向",
      "髪にハリコシがある",
      "水分油分のバランスを崩しやすい",
      "体力・持久力がある",
    ],
    hairFeatures: [
      "普通〜太め",
      "季節により乾燥とベタつきの変化がある",
      "カラー・パーマが当たりにくい",
      "毛穴に汚れが溜まりやすい",
      "頭皮湿疹ができやすい",
    ],
    carePoint: "頭皮の保湿に心がけ、ゴシゴシ洗いすぎに注意する。季節に合わせたケアが効果的です。",
  },
  {
    id: "endo",
    label: "内胚葉型",
    subtitle: "Endomorph Type",
    color: "#9A4870",
    bg: "#FDF0F5",
    bd: "#E8C0D0",
    tagline: "豊か・潤い・温かみ",
    description: "内胚葉型は、消化器系・内分泌系が発達した体質です。髪が細く、茶系の髪色。頭皮や肌の赤みが出やすい。",
    traits: [
      "丸みのある体型・ふっくらしやすい",
      "乾燥肌、赤みの出やすい肌",
      "髪が細く、ボリュームが出にくい",
      "抜け毛にかなり敏感",
      "新陳代謝の良い体質",
      "むくみやすい",
    ],
    hairFeatures: [
      "細毛・ネコ毛",
      "頭皮の乾燥",
      "ボリュームダウンを感じやすい",
      "頭皮の赤みが出やすい",
    ],
    carePoint: "頭皮の定期的な保湿ケアと、頭皮マッサージが効果的です。",
  },
];

export default function TypesPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const channel = params.get("ch") || "web";

  const active = TYPES[activeIdx];

  return (
    <div className="min-h-screen" style={{ background: "var(--herbs-page-bg)" }}>
      {/* ヘッダー */}
      <header style={{ background: "var(--herbs-white)", borderBottom: "1px solid var(--herbs-light)", padding: "14px 20px" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.25em", color: "var(--herbs-gold)", fontFamily: "'Cormorant Garamond', serif", textTransform: "uppercase" }}>
              Botanical Beauty
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 300, color: "var(--herbs-green)", letterSpacing: "0.12em", fontFamily: "'Cormorant Garamond', serif" }}>
              THE HERBS
            </h1>
          </div>
          <button
            onClick={() => navigate("/login")}
            style={{ fontSize: "11px", color: "var(--herbs-muted)", background: "none", border: "1px solid var(--herbs-light)", borderRadius: "6px", padding: "5px 10px", cursor: "pointer" }}>
            スタッフ・管理者
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* タイトル */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h2 style={{ fontSize: "22px", fontWeight: 500, color: "var(--herbs-green)", letterSpacing: "0.1em", marginBottom: "8px" }}>
            あなたの体質タイプを知る
          </h2>
          <div style={{ width: 40, height: 1, background: "var(--herbs-gold)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: "14px", color: "var(--herbs-muted)", lineHeight: 1.8 }}>
            植物美容メソッドに基づく、3つの体質タイプをご紹介します。<br />
            あなたの体質を知ることが、最適なケアを見つけるための第一歩です。
          </p>
        </div>

        {/* タブ切り替え */}
        <div className="flex gap-2 mb-6" style={{ background: "var(--herbs-cream2)", borderRadius: "12px", padding: "4px" }}>
          {TYPES.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveIdx(i)}
              style={{
                flex: 1,
                padding: "10px 4px",
                borderRadius: "9px",
                border: "none",
                background: activeIdx === i ? "var(--herbs-white)" : "transparent",
                color: activeIdx === i ? t.color : "var(--herbs-muted)",
                fontSize: "13px",
                fontWeight: activeIdx === i ? 500 : 400,
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: activeIdx === i ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                fontFamily: "'Noto Sans JP', sans-serif",
                letterSpacing: "0.02em",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* メインカード */}
        <div
          className="rounded-2xl mb-6 animate-fade-in-up overflow-hidden"
          style={{
            background: active.bg,
            border: `1.5px solid ${active.bd}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          {/* イラスト */}
          <div style={{ position: "relative", background: "#FAFAF8", display: "flex", justifyContent: "center", alignItems: "flex-end", minHeight: "360px", overflow: "hidden" }}>
            <img
              src={ILLUST_URLS[active.id]}
              alt={`${active.label}のイラスト`}
              style={{
                height: "400px",
                width: "auto",
                maxWidth: "100%",
                objectFit: "contain",
                objectPosition: "center bottom",
                display: "block",
              }}
            />
            {/* タイプラベルオーバーレイ */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: `linear-gradient(transparent, #FAFAF8ee)`,
              padding: "24px 20px 16px",
            }}>
              <div style={{ fontSize: "11px", color: active.color, letterSpacing: "0.15em", fontFamily: "'Cormorant Garamond', serif", marginBottom: "2px" }}>
                {active.subtitle}
              </div>
              <h3 style={{ fontSize: "26px", fontWeight: 400, color: active.color, letterSpacing: "0.08em", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.2 }}>
                {active.label}
              </h3>
              <div style={{ fontSize: "12px", color: active.color, opacity: 0.8, marginTop: "2px" }}>
                {active.tagline}
              </div>
            </div>
          </div>

          {/* カードコンテンツ */}
          <div className="p-5">
            {/* 説明文 */}
            <p style={{ fontSize: "14px", color: "#333", lineHeight: 1.9, marginBottom: "20px", fontWeight: 400 }}>
              {active.description}
            </p>

            {/* 特徴リスト */}
            <div className="mb-5">
              <div style={{ fontSize: "13px", fontWeight: 700, color: active.color, letterSpacing: "0.05em", marginBottom: "10px" }}>
                体質の特徴
              </div>
              <div className="grid grid-cols-2 gap-2">
                {active.traits.map((trait, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    fontSize: "13px",
                    color: "#333",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}>
                    <span style={{ color: active.color, fontSize: "10px" }}>●</span>
                    {trait}
                  </div>
                ))}
              </div>
            </div>

            {/* 髪・頭皮の特徴 */}
            <div className="mb-5">
              <div style={{ fontSize: "13px", fontWeight: 700, color: active.color, letterSpacing: "0.05em", marginBottom: "10px" }}>
                髪・頭皮の特徴
              </div>
              <div className="flex flex-wrap gap-2">
                {active.hairFeatures.map((f, i) => (
                  <span key={i} style={{
                    background: "rgba(255,255,255,0.8)",
                    border: `1px solid ${active.bd}`,
                    borderRadius: "20px",
                    padding: "5px 12px",
                    fontSize: "13px",
                    color: active.color,
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* ケアポイント */}
            <div style={{
              background: "rgba(255,255,255,0.6)",
              borderRadius: "10px",
              padding: "12px 14px",
              borderLeft: `3px solid ${active.color}`,
            }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: active.color, marginBottom: "6px" }}>
                THE HERBS ケアポイント
              </div>
              <p style={{ fontSize: "14px", color: "#333", lineHeight: 1.8 }}>
                {active.carePoint}
              </p>
            </div>
          </div>
        </div>

        {/* ページネーション */}
        <div className="flex justify-center gap-2 mb-8">
          {TYPES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{
                width: activeIdx === i ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: activeIdx === i ? "var(--herbs-green)" : "var(--herbs-light)",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        {/* CTAボタン */}
        <div className="text-center">
          <button
            onClick={() => navigate(`/counseling?ch=${channel}`)}
            style={{
              background: "var(--herbs-green)",
              color: "var(--herbs-white)",
              border: "none",
              borderRadius: "12px",
              padding: "16px 40px",
              fontSize: "14px",
              letterSpacing: "0.1em",
              cursor: "pointer",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: 500,
              boxShadow: "0 4px 16px rgba(45,74,53,0.25)",
              transition: "all 0.2s",
              width: "100%",
              maxWidth: "320px",
            }}
          >
            カウンセリングを始める →
          </button>
          <p style={{ fontSize: "11px", color: "var(--herbs-muted)", marginTop: "10px" }}>
            約5〜10分で完了します
          </p>
        </div>
      </main>
    </div>
  );
}
