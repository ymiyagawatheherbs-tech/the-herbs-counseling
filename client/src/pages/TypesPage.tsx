import { useState } from "react";
import { useLocation } from "wouter";

const ILLUST_URLS: Record<string, string> = {
  ecto: "/manus-storage/herbs-ecto_e909f0ad.png",
  meso: "/manus-storage/herbs-meso_94923867.png",
  endo: "/manus-storage/herbs-endo_6ed69735.png",
};

const TYPES = [
  {
    id: "ecto",
    label: "外胚葉型",
    subtitle: "Ectomorph Type",
    color: "#C4604A",
    bg: "#FDF0EB",
    bd: "#EDCAB8",
    tagline: "繊細・敏感・軽やか",
    description: "外胚葉型の方は、神経系・皮膚・感覚器官が発達した繊細な体質です。細身で乾燥しやすく、敏感肌の傾向があります。",
    traits: [
      "細身・痩せやすい体型",
      "乾燥肌・敏感肌の傾向",
      "髪が細く、ボリュームが出にくい",
      "頭皮が乾燥しやすい",
      "ストレスを受けやすい",
      "冷え性の傾向がある",
    ],
    hairFeatures: [
      "細毛・軟毛",
      "頭皮の乾燥・かゆみ",
      "抜け毛が気になる",
      "静電気が起きやすい",
    ],
    carePoint: "頭皮の保湿ケアと、植物性の穏やかな成分でのケアが効果的です。",
  },
  {
    id: "meso",
    label: "中胚葉型",
    subtitle: "Mesomorph Type",
    color: "#3A6285",
    bg: "#EBF2F8",
    bd: "#C0D8EC",
    tagline: "バランス・活力・安定",
    description: "中胚葉型の方は、筋骨格系が発達したバランスの良い体質です。適度な皮脂分泌があり、頭皮も比較的健康な状態を保ちやすいです。",
    traits: [
      "筋肉質・引き締まった体型",
      "混合肌の傾向",
      "髪にある程度のコシがある",
      "頭皮の皮脂バランスが取りやすい",
      "体力・持久力がある",
      "体温調節がしやすい",
    ],
    hairFeatures: [
      "普通〜太め",
      "季節による頭皮の変化がある",
      "カラー・パーマのダメージが残りやすい",
      "根元の油分が気になることがある",
    ],
    carePoint: "定期的な頭皮クレンジングと、季節に合わせたバランスケアが効果的です。",
  },
  {
    id: "endo",
    label: "内胚葉型",
    subtitle: "Endomorph Type",
    color: "#9A4870",
    bg: "#FDF0F5",
    bd: "#E8C0D0",
    tagline: "豊か・潤い・温かみ",
    description: "内胚葉型の方は、消化器系・内分泌系が発達した体質です。皮脂分泌が多い傾向があり、頭皮のべたつきや毛穴づまりが気になることがあります。",
    traits: [
      "丸みのある体型・太りやすい",
      "脂性肌・混合肌の傾向",
      "髪が太く、ボリュームが出やすい",
      "頭皮の皮脂が多い傾向",
      "代謝が穏やか",
      "むくみやすい",
    ],
    hairFeatures: [
      "太毛・剛毛",
      "頭皮のべたつき・毛穴づまり",
      "フケが出やすい",
      "頭皮のにおいが気になる",
    ],
    carePoint: "頭皮の定期的なゴマージュ（スクラブ）と、毛穴クレンジングが効果的です。",
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
          <h2 style={{ fontSize: "22px", fontWeight: 300, color: "var(--herbs-green)", letterSpacing: "0.1em", marginBottom: "8px" }}>
            あなたの体質タイプを知る
          </h2>
          <div style={{ width: 40, height: 1, background: "var(--herbs-gold)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: "13px", color: "var(--herbs-muted)", lineHeight: 1.8 }}>
            植物美容メソッドに基づく3つの体質タイプをご紹介します。<br />
            あなたの体質を知ることが、最適なケアへの第一歩です。
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
                fontFamily: "'Noto Serif JP', serif",
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
          <div style={{ position: "relative", background: "rgba(255,255,255,0.5)" }}>
            <img
              src={ILLUST_URLS[active.id]}
              alt={`${active.label}のイラスト`}
              style={{
                width: "100%",
                maxHeight: "320px",
                objectFit: "cover",
                objectPosition: "center top",
                display: "block",
              }}
            />
            {/* タイプラベルオーバーレイ */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: `linear-gradient(transparent, ${active.bg}dd)`,
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
            <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.9, marginBottom: "20px" }}>
              {active.description}
            </p>

            {/* 特徴リスト */}
            <div className="mb-5">
              <div style={{ fontSize: "11px", fontWeight: 600, color: active.color, letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase" }}>
                体質の特徴
              </div>
              <div className="grid grid-cols-2 gap-2">
                {active.traits.map((trait, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    fontSize: "12px",
                    color: "#555",
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
              <div style={{ fontSize: "11px", fontWeight: 600, color: active.color, letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase" }}>
                髪・頭皮の特徴
              </div>
              <div className="flex flex-wrap gap-2">
                {active.hairFeatures.map((f, i) => (
                  <span key={i} style={{
                    background: "rgba(255,255,255,0.8)",
                    border: `1px solid ${active.bd}`,
                    borderRadius: "20px",
                    padding: "5px 12px",
                    fontSize: "12px",
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
              <div style={{ fontSize: "11px", fontWeight: 600, color: active.color, marginBottom: "4px" }}>
                THE HERBS ケアポイント
              </div>
              <p style={{ fontSize: "12px", color: "#555", lineHeight: 1.7 }}>
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
              fontFamily: "'Noto Serif JP', serif",
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
