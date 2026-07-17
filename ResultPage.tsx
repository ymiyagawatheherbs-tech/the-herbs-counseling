import { useLocation } from "wouter";
import { MEDICATION_CATEGORIES, PREGNANCY_NOTE } from "@shared/counselingData";

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
    constitution: "神経と感覚が繊細に働きやすく、その分、巡りと消化の力はひかえめになりやすいタイプです。冷えを感じやすく、血圧は低め、朝が苦手という方が多くみられます。汗や皮脂の分泌は多くないため肌は汚れにくい一方、水分がとどまってむくみやたるみとして表れることがあります。空腹が続くと力が入りにくくなるのも特徴です。",
    temperament: "Sharp & Sensitive ― 感性で受けとめるスタイル。まわりの空気や刺激を細やかに感じ取る一方、その感覚を言葉にするのは得意でないことがあります。ストレスは内側に抱え込みやすく、寝つきにくさや食欲の落ちとして表れやすい傾向です。",
    skin: "乾燥とくすみが出やすく、透明感が落ちやすい肌質。皮脂が少ないぶん、かえって毛穴に汚れがたまりやすいことがあります。日焼けすると黒くなりやすく、シミが定着しやすいのも特徴です。",
    hair: "髪は太くしっかりしていて量も多く感じられ、うねりや縮毛が出やすいタイプ。湿気を含むと広がります。撥水毛で薬剤が入りにくいため、施術前の下準備が仕上がりを左右します。若白髪が増えやすい傾向もあります。",
    foods: ["温かいスープ・煮込み", "消化の良い根菜（山芋・じゃがいも）", "しょうが・ねぎ・ニンニク", "赤身肉・レバー・うなぎ（鉄）", "海藻・魚介", "緑黄色野菜・豆類", "りんご・バナナ", "はちみつ・梅干"],
    cautions: ["玄米や生野菜のとりすぎ（消化の負担に）", "空腹の時間を長くつくらない（少量を回数多く）", "冷たい飲み物・冷房での冷え", "強いピーリング・スクラブ", "アルコール高配合の化粧品"],
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
    constitution: "動くためにつくられた、しっかりした体をお持ちのタイプです。多少の無理がきくぶん、頑張りすぎが積み重なりやすい面があります。体を動かさない時期が続くと、血液やリンパの流れが滞り、肩や首のこわばり・頭痛として表れやすくなります。年齢とともに骨の密度や関節の柔らかさに変化を感じやすい傾向もあります。",
    temperament: "Strong & Logical ― 筋道と納得を大切にするスタイル。あいまいさを好まず、コツコツ積み上げる頑張り屋です。完璧主義で我慢強いぶん、ストレスをためこみやすく、それが体の緊張として表れやすい傾向があります。",
    skin: "皮脂の分泌が多めで、テカリや毛穴の汚れが気になりやすい肌質。炎症は起こしにくく日焼けもしにくい一方、深いシワや肌の硬さが出やすい傾向があります。洗いすぎるとかえって皮脂が増えるため、加減が大切です。",
    hair: "幼少期から直毛で、太さは普通の健康毛。健康毛ゆえに薬剤がのりにくく、放置時間が長くなりがちでダメージが蓄積しやすい点に注意が必要です。頭皮は皮脂が多めで固くなりやすく、ストレスが続くと抜け毛や切れ毛が増えることがあります。",
    foods: ["豆腐・魚（良質なタンパク質）", "緑黄色野菜", "発酵食品", "海藻・ごぼう（食物繊維）", "トマト・玉ねぎ・アスパラ", "ナッツ", "酢の物", "カルシウム・コラーゲン＋ビタミンC・D"],
    cautions: ["アルコール・甘いもの・塩分のとりすぎ", "頑張りすぎ ― 意識して休息を", "運動不足（巡りが滞ります）", "動物性脂肪の過多（皮脂・毛穴に）", "薬剤の放置時間が長くなること"],
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
    constitution: "消化器が発達して吸収がよく、少量でもエネルギーを取り込める効率のよいタイプです。そのぶん、とりすぎが続くと体重や代謝の管理がしにくくなりやすい面があります。水分がとどまってむくみやだぶつきとして表れやすく、気分の波を感じやすいのも特徴です。",
    temperament: "Soft & Social ― 人とのつながりと安心を大切にする、やわらかなスタイル。温和で場を明るくする社交的な面と、慎重で心配性な面をあわせ持ちます。ストレスは食欲や感情で発散しようとする傾向があり、気分の波が体調と連動しやすいタイプです。",
    skin: "色白でメラニンが少なく、日焼けすると赤くなりやすい繊細な肌質。頬の赤みや毛細血管の広がり、口まわりの吹き出物が出やすい傾向があります。乾燥しやすく、摩擦にとても弱いのが最大の特徴です。",
    hair: "1本1本が細く、ボリュームが出にくいやわらかな髪質。キューティクルが繊細でダメージを受けやすく、カラーの色落ちが早い傾向があります。頭皮は乾燥しやすくむくみやすい状態。薬剤で赤みやかゆみが出ることがあるため、パッチテストが欠かせません。",
    foods: ["野菜中心・繊維から先に", "海藻・こんにゃく", "低GIの食品", "玉ねぎ・青じそ・キャベツ", "豆腐・魚介・豚赤身", "オレンジ・りんご", "ナッツ・ごぼう", "ビタミンB・たんぱく質"],
    cautions: ["糖質・炭水化物のとりすぎ", "早食い・過食（ゆっくり食べる）", "夕食のカロリーオーバー", "動物性脂肪・果物は控えめに", "摩擦・スクラブ（赤みやシミの悪化要因）", "日焼け ― 炎症を起こしやすいため紫外線対策を"],
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
    principle: "ととのえる",
    description: "複数の体質タイプの特徴をあわせ持つ、バランスのとれた傾向です。3つの胚葉のうち、どれか一つに大きく偏らないタイプといえます。",
    care: "特定の偏りが強くないぶん、その時々の状態に合わせて整えることが大切です。季節や生活の変化で傾きが変わりやすいため、定期的に状態を見ていきましょう。",
    constitution: "3つの傾向がバランスよく現れています。強い偏りがない一方、季節や生活の変化によって、どちらかに傾くことがあります。",
    temperament: "状況に応じて、感性・理性・社交性を使い分けられる柔軟さをお持ちです。",
    skin: "その時々の状態によって、乾燥にも皮脂にも傾くことがあります。今のお肌の状態に合わせたケアを。",
    hair: "髪質も中間的な傾向です。季節や体調による変化を見ながら整えていきましょう。",
    foods: ["季節の野菜を中心に", "よく噛んでゆっくり", "腹八分目", "発酵食品", "海藻・豆類", "良質なタンパク質"],
    cautions: ["偏った食生活", "生活リズムの乱れ", "季節の変わり目の変化に注意"],
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

  // ── 結果データは sessionStorage から取得（URLに個人情報を載せない）──────
  const params = new URLSearchParams(window.location.search);
  const stored = (() => {
    try {
      const raw = sessionStorage.getItem("herbs_result");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  const ecto = stored?.ecto ?? parseInt(params.get("ecto") || "0");
  const meso = stored?.meso ?? parseInt(params.get("meso") || "0");
  const endo = stored?.endo ?? parseInt(params.get("endo") || "0");
  const name: string = stored?.name ?? "";
  const managementNo: string = stored?.managementNo ?? "";
  const type = (stored?.type || params.get("type") || "unknown") as keyof typeof TYPE_INFO;
  const channel: string = stored?.ch ?? params.get("ch") ?? "web";

  // アンケート結果（すべて端末内のデータ）
  const symptoms: string[] = stored?.symptoms ?? [];
  const lifestyle: string[] = stored?.lifestyle ?? [];
  const hairTroubles: string[] = stored?.hairTroubles ?? [];
  const medications: string[] = stored?.medications ?? [];
  const isPregnant: boolean = stored?.isPregnant ?? false;
  const hasPollen: boolean = stored?.hasPollen ?? false;
  const pollenTypes: string[] = stored?.pollenTypes ?? [];
  const foodNotes: string = stored?.foodNotes ?? "";
  const request: string = stored?.request ?? "";

  const total = ecto + meso + endo || 1;
  const info = TYPE_INFO[type] || TYPE_INFO.unknown;

  const bars = [
    { label: "外胚葉型", score: ecto, color: "#C4604A", bg: "#FDF0EB" },
    { label: "中胚葉型", score: meso, color: "#3A6285", bg: "#EBF2F8" },
    { label: "内胚葉型", score: endo, color: "#3A7A50", bg: "#EDF5EF" },
  ];

  // 該当したお薬の注意文（端末内でのみ表示）
  const medicationNotes = MEDICATION_CATEGORIES.filter(m => medications.includes(m.label));

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
          <div style={{ fontSize: "11px", color: "var(--herbs-muted)" }}>体質傾向</div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 完了メッセージ */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>✨</div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--herbs-green)", marginBottom: "4px" }}>
            {name ? `${name} 様の` : managementNo ? `${managementNo} の` : ""}体質傾向をお読みしました
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

        {/* 体質バランスバー */}
        <div className="rounded-2xl p-5 mb-6 animate-fade-in-up" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--herbs-green)", marginBottom: "16px" }}>
            体質バランス
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
            ※ 体質傾向チェックと、気になる傾向の関連度から算出しています
          </p>
        </div>

        {/* 体質・気質・肌質・髪質 */}
        <div className="rounded-2xl p-6 mb-4" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--herbs-green)", marginBottom: "6px" }}>
            {info.label}の傾向
          </div>
          <div style={{ fontSize: "12px", color: "var(--herbs-muted)", marginBottom: "18px" }}>
            体質・気質・肌質・髪質の4つの側面から
          </div>

          {([
            { key: "体質", body: info.constitution, mark: "からだ" },
            { key: "気質", body: info.temperament,  mark: "こころ" },
            { key: "肌質", body: info.skin,         mark: "はだ" },
            { key: "髪質", body: info.hair,         mark: "かみ" },
          ] as const).map(sec => (
            <div key={sec.key} style={{ marginBottom: "18px", paddingLeft: "14px", borderLeft: `3px solid ${info.color}` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "15px", fontWeight: 700, color: info.color }}>{sec.key}</span>
                <span style={{ fontSize: "10px", color: "var(--herbs-muted)", letterSpacing: "0.08em" }}>{sec.mark}</span>
              </div>
              <p style={{ fontSize: "13px", color: "#333", lineHeight: 1.9 }}>{sec.body}</p>
            </div>
          ))}
        </div>

        {/* ケアの考え方 */}
        <div className="rounded-2xl p-6 mb-4" style={{ background: info.bg, border: `1px solid ${info.bd}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--herbs-green)" }}>体質から見た、ケアの考え方</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff", background: info.color, borderRadius: "99px", padding: "2px 10px" }}>
              {info.principle}
            </span>
          </div>
          <p style={{ fontSize: "14px", color: "#333", lineHeight: 1.9 }}>
            {info.care}
          </p>
        </div>

        {/* お薬・妊娠に関する注意（端末内でのみ表示・サーバー未送信） */}
        {(medicationNotes.length > 0 || isPregnant) && (
          <div className="rounded-2xl p-6 mb-4" style={{ background: "#FFF8F0", border: "1px solid #E8C9A0" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#A66A2C", marginBottom: "10px" }}>
              ⚠ ハーブ・精油をお使いになる前に
            </div>
            <p style={{ fontSize: "12px", color: "var(--herbs-muted)", lineHeight: 1.8, marginBottom: "14px" }}>
              下記に該当されています。ハーブティー・サプリメント・精油をお使いになる前に、
              かかりつけの医師・薬剤師にご確認ください。
            </p>
            <div className="space-y-3">
              {isPregnant && (
                <div style={{ paddingLeft: "12px", borderLeft: "3px solid #E8C9A0" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#A66A2C", marginBottom: "3px" }}>妊娠中・授乳中</div>
                  <p style={{ fontSize: "12px", color: "#333", lineHeight: 1.8 }}>{PREGNANCY_NOTE}</p>
                </div>
              )}
              {medicationNotes.map(m => (
                <div key={m.label} style={{ paddingLeft: "12px", borderLeft: "3px solid #E8C9A0" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#A66A2C", marginBottom: "3px" }}>{m.label}</div>
                  <p style={{ fontSize: "12px", color: "#333", lineHeight: 1.8 }}>{m.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* おすすめの食材・気をつけたいこと */}
        <div className="rounded-2xl p-6 mb-4" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--herbs-green)", marginBottom: "14px" }}>
            食から整える
          </div>

          <div style={{ fontSize: "12px", fontWeight: 700, color: info.color, marginBottom: "8px", letterSpacing: "0.05em" }}>
            おすすめの食材・食べ方
          </div>
          <div className="flex flex-wrap gap-2" style={{ marginBottom: "18px" }}>
            {info.foods.map((f, i) => (
              <span key={i} style={{
                fontSize: "12px", color: "#333", background: info.bg,
                border: `1px solid ${info.bd}`, borderRadius: "99px", padding: "5px 12px",
              }}>{f}</span>
            ))}
          </div>

          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--herbs-gold)", marginBottom: "8px", letterSpacing: "0.05em" }}>
            気をつけたいこと
          </div>
          <div className="space-y-2">
            {info.cautions.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ color: "var(--herbs-gold)", fontSize: "10px", lineHeight: "1.9" }}>●</span>
                <span style={{ fontSize: "13px", color: "#333", lineHeight: 1.8 }}>{c}</span>
              </div>
            ))}
          </div>
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
            もう一度入力する
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
