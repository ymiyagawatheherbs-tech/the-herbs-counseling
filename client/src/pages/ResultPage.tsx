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
    tagline: "繊細・感じやすい・巡りひかえめ",
    principle: "補う",
    description: "神経・感覚・皮膚が発達したタイプです。感覚が繊細に働きやすい一方、巡りや消化の力はひかえめになりやすく、乾燥・くすみ・冷えが出やすい傾向があります。髪は太くしっかりしていて、うねりが出やすく、湿気で広がりやすいのも特徴です。",
    care: "キーワードは「補う」。水分と油分をやさしく補い、温めて巡りを助けるケアが土台になります。洗浄力の強いものや刺激の強いケアは、乾燥を進めてしまうため控えめに。撥水毛で薬剤が入りにくいため、施術前の下準備が仕上がりを左右します。",
  },
  meso: {
    label: "中胚葉型",
    subtitle: "Mesomorph Type",
    color: "#3A6285",
    bg: "#EBF2F8",
    bd: "#C0D8EC",
    icon: "🌱",
    tagline: "強さ・頑張れる・巡りが鍵",
    principle: "めぐらせる",
    description: "筋・骨・循環が発達したタイプです。もともと丈夫で頑張りがきく一方、巡りが滞ると不調が出やすくなります。皮脂の分泌が多めで、テカリや毛穴の汚れが気になりやすく、頭皮が固くなりやすいのも特徴です。",
    care: "キーワードは「めぐらせる」。皮脂は取りすぎるとかえって増えるため、バランスを整えることが大切です。頭皮が固い方は、施術前後のヘッドマッサージで血行を促すと効果が高まります。健康毛で薬剤がのりにくいため、放置時間の管理が重要です。",
  },
  endo: {
    label: "内胚葉型",
    subtitle: "Endomorph Type",
    color: "#3A7A50",
    bg: "#EDF5EF",
    bd: "#BFDCC7",
    icon: "🌸",
    tagline: "やわらか・社交的・ゆらぎやすい",
    principle: "整える",
    description: "消化器・内分泌が発達したタイプです。吸収がよくエネルギー効率が高い一方、色白でメラニンが少なく、赤みや炎症が出やすい繊細な肌質。乾燥しやすく摩擦に弱い傾向があります。髪は細く、ボリュームが出にくく、ダメージを受けやすいのも特徴です。",
    care: "キーワードは「整える」。低刺激の保湿でバリアを守りながら、むくみをためこまないよう巡りを助けます。摩擦は赤みやシミの悪化要因になるため、スクラブや強いこすり洗いは避け、しっかり泡立てて手でやさしく洗ってください。薬剤に反応が出やすいため、パッチテストを必ず行いましょう。",
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
  },
};

// 症状カテゴリ別の注意アドバイス
const SYMPTOM_ADVICE: Record<string, string> = {
  "筋肉系": "肩こり・腰痛などの筋肉系の症状がある場合、頭皮への血行も低下しやすくなります。頭皮マッサージや温熱ケアで血流を促しましょう。",
  "呼吸器系": "呼吸器系の症状がある場合、アレルギー反応が頭皮に影響することがあります。低刺激・植物性成分のシャンプーをお勧めします。",
  "循環器系": "循環器系の症状がある場合、頭皮への栄養・酸素供給が滞りやすくなります。頭皮の血行促進ケアが重要です。",
  "消化器系": "消化器系の症状がある場合、腸内環境の乱れが頭皮の皮脂バランスや抜け毛に影響することがあります。食生活の見直しも合わせてご検討ください。",
  "泌尿器系": "むくみや泌尿器系の症状がある場合、体内の水分バランスが乱れやすく、頭皮の乾燥やべたつきに影響することがあります。",
  "婦人科系": "ホルモンバランスの変化は頭皮・髪に大きく影響します。生理周期や更年期に合わせたケアをご提案します。",
  "その他": "アレルギー・アトピーがある場合は、植物成分でも反応する可能性があります。パッチテストを行ってからご使用ください。",
};

// 生活習慣別の注意アドバイス
function buildLifestyleAdvice(habits: string[]): string[] {
  const advices: string[] = [];
  if (habits.includes("外食が多い") || habits.includes("甘いものや辛いものをよく食べる")) {
    advices.push("食生活が乱れると頭皮の皮脂バランスが崩れやすくなります。タンパク質・ビタミンB群・亜鉛を意識した食事を心がけましょう。");
  }
  if (habits.includes("アルコールをよく飲む") || habits.includes("タバコを吸う")) {
    advices.push("アルコール・喫煙は頭皮の血行を妨げ、抜け毛や髪のハリ低下の原因になります。頭皮クレンジングで毛穴の詰まりを解消しましょう。");
  }
  if (habits.includes("生活が不規則になりがち") || habits.includes("睡眠不足（6時間未満）")) {
    advices.push("睡眠不足・不規則な生活は成長ホルモンの分泌を妨げ、髪の成長サイクルに影響します。就寝前の頭皮ケアで血行を促進しましょう。");
  }
  if (habits.includes("日常的にストレスが多いと感じる")) {
    advices.push("ストレスは自律神経を通じて、頭皮の緊張・血行の低下・皮脂バランスの乱れにつながります。ゆっくり呼吸を整える時間が助けになります。");
  }
  if (habits.includes("水分摂取が少ない")) {
    advices.push("水分不足は頭皮の乾燥・うねりの原因になります。1日1.5L以上の水分摂取を意識してください。");
  }
  return advices;
}

// 髪・頭皮トラブル別の見立て（体質学の視点からの読み解き）
function buildHairTroubleAdvice(troubles: string[]): { trouble: string; advice: string }[] {
  const map: Record<string, string> = {
    "抜け毛が多い": "頭皮への血流と、めぐりの状態が関わりやすい部分です。首・肩のこわばりをほぐし、休息をとることが土台になります。",
    "薄毛・ボリュームダウン": "髪が細くボリュームが出にくいのは、生まれ持った髪質の傾向でもあります。頭皮環境を整えることで、ハリを支えられます。",
    "頭皮のかゆみ": "頭皮が敏感に傾いているサインです。洗浄力の強いものを避け、刺激をやわらげるケアに切り替えましょう。",
    "頭皮の乾燥": "水分と油分のバランスが乾燥に傾いています。補うケアを土台に、洗いすぎに注意しましょう。",
    "頭皮のべたつき": "皮脂の分泌が多めの傾向です。取りすぎるとかえって増えるため、バランスを整える視点が大切です。",
    "フケ（乾性）": "乾燥に傾いているサインです。補うケアと、洗浄のやさしさを見直しましょう。",
    "フケ（脂性）": "皮脂のバランスが崩れている状態です。頭皮環境を整えるケアが向いています。",
    "頭皮のにおい": "皮脂と代謝のバランスが関わります。頭皮環境を整えることで和らぎやすくなります。",
    "白髪が多い": "鉄やビタミンの不足、めぐりの低下と関わりやすい部分です。食と血行の両面から見直しましょう。",
    "髪のうねり・くせ毛": "外胚葉型に出やすい傾向です。頭皮と髪の水分バランスを整えることで、扱いやすさが変わります。",
    "枝毛・切れ毛": "キューティクルが繊細な髪質の傾向です。熱・摩擦のダメージを減らすことが大切です。",
    "ハリ・コシがない": "頭皮環境と髪の土台づくりから。めぐりを助けるケアを取り入れましょう。",
    "カラーの色落ちが早い": "髪が細くキューティクルが繊細なタイプに出やすい傾向です。日々のケアで色持ちが変わります。",
    "頭皮の炎症・赤み": "刺激に反応しやすい状態です。摩擦を避け、低刺激でやさしく。施術前のパッチテストもおすすめします。",
  };
  return troubles
    .filter(t => t !== "特になし" && map[t])
    .map(t => ({ trouble: t, advice: map[t] }));
}

export default function ResultPage() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const ecto = parseInt(params.get("ecto") || "0");
  const meso = parseInt(params.get("meso") || "0");
  const endo = parseInt(params.get("endo") || "0");
  const name = decodeURIComponent(params.get("name") || "");
  const type = (params.get("type") || "unknown") as keyof typeof TYPE_INFO;
  const channel = params.get("ch") || "web";

  // アンケート結果
  const symptoms = params.get("symptoms") ? params.get("symptoms")!.split(",").filter(Boolean) : [];
  const lifestyle = params.get("lifestyle") ? params.get("lifestyle")!.split(",").filter(Boolean) : [];
  const hairTroubles = params.get("hairTroubles") ? params.get("hairTroubles")!.split(",").filter(Boolean) : [];
  const hasMedication = params.get("hasMedication") === "true";
  const hasPollen = params.get("hasPollen") === "true";
  const pollenTypes = params.get("pollenTypes") ? params.get("pollenTypes")!.split(",").filter(Boolean) : [];
  const colorHistory = params.get("colorHistory") || "";
  const visitReason = params.get("visitReason") || "";
  const hairChildType = params.get("hairChildType") || "";
  const foodNotes = params.get("foodNotes") || "";

  const total = ecto + meso + endo || 1;
  const info = TYPE_INFO[type] || TYPE_INFO.unknown;

  const bars = [
    { label: "外胚葉型", score: ecto, color: "#C4604A", bg: "#FDF0EB" },
    { label: "中胚葉型", score: meso, color: "#3A6285", bg: "#EBF2F8" },
    { label: "内胚葉型", score: endo, color: "#3A7A50", bg: "#EDF5EF" },
  ];

  // 症状カテゴリを集計
  const symptomCategories = ["筋肉系", "呼吸器系", "循環器系", "消化器系", "泌尿器系", "婦人科系", "その他"];
  const activeCategories = symptomCategories.filter(cat => {
    const catSymptoms: Record<string, string[]> = {
      "筋肉系": ["肩こり", "首の痛み", "腰痛", "しびれ"],
      "呼吸器系": ["気管支炎", "鼻炎", "せき", "ぜんそく", "花粉症", "呼吸が浅い", "風邪をひきやすい"],
      "循環器系": ["貧血", "低血圧", "静脈瘤", "心臓病", "高血圧", "糖尿病", "中性脂肪"],
      "消化器系": ["胃痛", "胃酸過多", "潰瘍", "肝臓不調", "便秘", "下痢", "お腹の張り"],
      "泌尿器系": ["膀胱炎", "腎結石", "腎臓病", "むくみ"],
      "婦人科系": ["生理痛", "生理不順", "子宮内膜症", "子宮筋腫", "妊娠の可能性"],
      "その他": ["アレルギー", "アトピー", "頭痛", "冷え性", "関節炎", "リウマチ", "耳鳴り", "不眠", "坐骨神経痛"],
    };
    return symptoms.some(s => catSymptoms[cat]?.includes(s));
  });

  const lifestyleAdvices = buildLifestyleAdvice(lifestyle);
  const hairTroubleAdvices = buildHairTroubleAdvice(hairTroubles);

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
                  <span style={{ fontSize: "13px", color: bar.color }}>{bar.score}点</span>
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
          <p style={{ fontSize: "11px", color: "var(--herbs-muted)", marginTop: "12px", lineHeight: 1.7 }}>
            ※ スコアは体質傾向チェック＋身体の症状の関連度から算出しています
          </p>
        </div>

        {/* ケアアドバイス */}
        <div className="rounded-2xl p-5 mb-6 animate-fade-in-up" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--herbs-green)", marginBottom: "12px" }}>
            体質から見た、ケアの考え方
          </div>
          <p style={{ fontSize: "14px", color: "#333", lineHeight: 1.9, marginBottom: "16px" }}>
            {info.care}
          </p>
        </div>

        {/* 髪・頭皮トラブル別アドバイス */}
        {hairTroubleAdvices.length > 0 && (
          <div className="rounded-2xl p-5 mb-6 animate-fade-in-up" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--herbs-green)", marginBottom: "12px" }}>
              髪・頭皮のお悩み別ケアポイント
            </div>
            <div className="space-y-3">
              {hairTroubleAdvices.map(({ trouble, advice }) => (
                <div key={trouble} style={{ padding: "12px 14px", background: "var(--herbs-cream)", borderRadius: "10px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--herbs-green)", marginBottom: "4px" }}>
                    {trouble}
                  </div>
                  <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.8 }}>{advice}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 身体の症状に基づくアドバイス */}
        {activeCategories.length > 0 && (
          <div className="rounded-2xl p-5 mb-6 animate-fade-in-up" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--herbs-green)", marginBottom: "12px" }}>
              身体の症状から見たケアポイント
            </div>
            <div className="space-y-3">
              {activeCategories.map(cat => (
                <div key={cat} style={{ padding: "12px 14px", background: "#FBF9F6", borderRadius: "10px", borderLeft: `3px solid ${info.color}` }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: info.color, marginBottom: "4px" }}>{cat}</div>
                  <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.8 }}>{SYMPTOM_ADVICE[cat]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 生活習慣アドバイス */}
        {lifestyleAdvices.length > 0 && (
          <div className="rounded-2xl p-5 mb-6 animate-fade-in-up" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--herbs-green)", marginBottom: "12px" }}>
              生活習慣から見たケアポイント
            </div>
            <div className="space-y-3">
              {lifestyleAdvices.map((advice, i) => (
                <div key={i} style={{ padding: "12px 14px", background: "#FBF9F6", borderRadius: "10px", borderLeft: "3px solid var(--herbs-gold)" }}>
                  <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.8 }}>{advice}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 注意事項（服薬・花粉症・カラー歴） */}
        {(hasMedication || hasPollen || colorHistory) && (
          <div className="rounded-2xl p-5 mb-6 animate-fade-in-up" style={{ background: "#FFF8F0", border: "1px solid #F0D8B8" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#A0622A", marginBottom: "12px" }}>
              施術前にご確認いただきたい事項
            </div>
            <div className="space-y-3">
              {hasMedication && (
                <div style={{ padding: "10px 14px", background: "white", borderRadius: "8px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#A0622A", marginBottom: "4px" }}>お薬・サプリメントについて</div>
                  <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.8 }}>
                    現在お薬やサプリメントを服用中とのことです。特にステロイド・ホルモン剤・抗ガン剤は髪質に影響することがあります。施術前にスタッフへお申し出ください。
                  </p>
                </div>
              )}
              {hasPollen && pollenTypes.length > 0 && (
                <div style={{ padding: "10px 14px", background: "white", borderRadius: "8px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#A0622A", marginBottom: "4px" }}>花粉症・植物アレルギーについて</div>
                  <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.8 }}>
                    {pollenTypes.join("・")}の花粉症がございます。植物由来の成分を使ったケアの前には、パッチテストをおすすめします。
                  </p>
                </div>
              )}
              {colorHistory && (
                <div style={{ padding: "10px 14px", background: "white", borderRadius: "8px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#A0622A", marginBottom: "4px" }}>カラー・パーマ歴について</div>
                  <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.8 }}>
                    カラー・パーマの施術歴：{colorHistory}。アルカリカラー・パーマ前日は洗髪を避け、頭皮のバリア機能を高めることをお勧めします。
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 来店目的に合わせたメッセージ */}
        {visitReason && (
          <div className="rounded-2xl p-5 mb-6 animate-fade-in-up" style={{ background: info.bg, border: `1px solid ${info.bd}` }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: info.color, marginBottom: "8px" }}>
              本日のご来店目的：{visitReason}
            </div>
            <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.8 }}>
              {visitReason.includes("抜け毛") || visitReason.includes("薄毛") ?
                "抜け毛・薄毛は、頭皮のめぐりと栄養、そしてストレスが重なって表れやすいお悩みです。頭皮環境を整えることから始めましょう。" :
                visitReason.includes("うねり") || visitReason.includes("くせ毛") ?
                "くせ毛・うねりは外胚葉型に出やすい傾向です。頭皮と髪の水分バランスを整えることで、扱いやすさが変わってきます。" :
                visitReason.includes("カラー") ?
                "カラー後は頭皮のバリアが一時的に低下します。数日後からのやさしいケアで、健やかな状態に戻していきましょう。" :
                visitReason.includes("白髪") ?
                "白髪は、鉄・ビタミンの不足やめぐりの低下と関わりやすいお悩みです。食と血行の両面から見直していきましょう。" :
                "お客様のご要望に合わせた最適なケアプランをスタッフよりご提案いたします。"
              }
            </p>
          </div>
        )}

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
