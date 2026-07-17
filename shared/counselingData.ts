/**
 * THE HERBS カウンセリングシート データ定義
 *
 * このファイルはGitHubで直接編集できます。
 * 症状・チェック項目・胚葉スコアの対応を管理します。
 *
 * ─────────────────────────────────────────────────────────────────
 * 胚葉タイプ凡例（体質学 基礎Ⅰ〜Ⅲ 準拠）:
 *   ecto = 外胚葉型 #C4604A: 神経・感覚・皮膚が発達。乾燥・くすみ・冷え・巡りひかえめ。
 *                            髪は太く黒く、うねり／縮毛。撥水毛。
 *   meso = 中胚葉型 #3A6285: 筋・骨・循環が発達。皮脂分泌が多め、毛穴・テカリ傾向。
 *                            頭皮が固くなりやすい。健康毛で薬剤がのりにくい。
 *   endo = 内胚葉型 #3A7A50: 消化器・内分泌が発達。色白でメラニンが少なく、
 *                            炎症・赤みが出やすい。乾燥しやすく摩擦に弱い。髪は細くボリューム出にくい。
 *
 * ※ 皮脂が多いのは「中胚葉型」、乾燥・敏感は「内胚葉型／外胚葉型」。
 *   摩擦・スクラブは内胚葉型に不向き（赤み・肝斑の悪化要因）。
 *
 * ※ 本アプリはパーソナルカウンセリング（美容・養生の提案）のためのものであり、
 *   医療の診断・治療を目的としません。設問は病名ではなく「出やすい傾向」で記述します。
 * ─────────────────────────────────────────────────────────────────
 */

// ── 体質チェック項目（Section 2） ─────────────────────────────────────────────
// 元データ: カウンセリングシート表面「体質傾向を見極めるためのチェック項目」
// 色分け: 外胚葉=赤、中胚葉=青、内胚葉=緑

export const ECTO_ITEMS = [
  "胃の調子を崩しやすい",
  "膀胱炎になったことがある",
  "季節の変わり目に体調を崩しやすい",
  "フェイスラインにニキビが出やすい",
  "血圧はいつも低め",
  "冷たい飲み物を好む",
  "朝起きが苦手",
  "日焼けするとすぐに黒くなってしまう",
];

export const MESO_ITEMS = [
  "筋肉質だと思う",
  "我慢強いと思う",
  "痩せると頬がこける",
  "何事も手を抜くのが苦手",
  "学生時代、ニキビに悩まされた",
  "理屈の通らない話は嫌い",
];

export const ENDO_ITEMS = [
  "新しい環境でもすぐに馴染める",
  "口の横にニキビができやすい",
  "風邪をひくと喉が痛くなりやすい",
  "色が白いと言われる",
  "日焼けすると赤くなる",
  "子供の時からそばかすがある",
];

// ── 身体の症状（Section 3） ────────────────────────────────────────────────────
// 元データ: カウンセリングシート表面「身体の状態について以下の当てはまる症状に○をつけてください」
// 色分け: 赤=外胚葉型関連、青=中胚葉型関連、緑=内胚葉型関連、黒=共通
//
// 各症状に胚葉スコアへの加算ポイントを設定:
//   ectoBonus / mesoBonus / endoBonus: 0〜2 (0=無関係, 1=関連あり, 2=強く関連)
// ─────────────────────────────────────────────────────────────────

export interface SymptomItem {
  label: string;
  ectoBonus: number;
  mesoBonus: number;
  endoBonus: number;
}

export interface SymptomCategory {
  category: string;
  items: SymptomItem[];
}

export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    category: "めぐり・冷え",
    items: [
      { label: "手足が冷えやすい",             ectoBonus: 2, mesoBonus: 0, endoBonus: 0 },
      { label: "血圧は低めで朝が苦手",         ectoBonus: 2, mesoBonus: 0, endoBonus: 0 },
      { label: "立ちくらみ・めまいがある",     ectoBonus: 2, mesoBonus: 0, endoBonus: 0 },
      { label: "血圧は高め",                   ectoBonus: 0, mesoBonus: 2, endoBonus: 1 },
      { label: "脚が重い・だるい",             ectoBonus: 1, mesoBonus: 1, endoBonus: 2 },
      { label: "甘いものを好む・喉が渇きやすい", ectoBonus: 0, mesoBonus: 1, endoBonus: 2 },
      { label: "体重・代謝が気になる",         ectoBonus: 0, mesoBonus: 1, endoBonus: 2 },
    ],
  },
  {
    category: "呼吸・鼻",
    items: [
      { label: "呼吸が浅いと感じる",       ectoBonus: 2, mesoBonus: 0, endoBonus: 0 },
      { label: "鼻がむずむずしやすい",     ectoBonus: 2, mesoBonus: 0, endoBonus: 1 },
      { label: "喉から不調が始まりやすい", ectoBonus: 0, mesoBonus: 0, endoBonus: 2 },
      { label: "季節の変わり目に弱い",     ectoBonus: 2, mesoBonus: 0, endoBonus: 1 },
    ],
  },
  {
    category: "消化・おなか",
    items: [
      { label: "胃に負担を感じやすい",         ectoBonus: 2, mesoBonus: 1, endoBonus: 0 },
      { label: "胃のむかつき・胃酸が気になる", ectoBonus: 1, mesoBonus: 2, endoBonus: 0 },
      { label: "便秘ぎみ",                     ectoBonus: 2, mesoBonus: 1, endoBonus: 1 },
      { label: "お腹がゆるくなりやすい",       ectoBonus: 2, mesoBonus: 1, endoBonus: 0 },
      { label: "お腹が張りやすい",             ectoBonus: 1, mesoBonus: 0, endoBonus: 2 },
      { label: "お酒・脂ものが負担に感じる",   ectoBonus: 0, mesoBonus: 2, endoBonus: 1 },
      { label: "空腹でイライラしやすい",       ectoBonus: 2, mesoBonus: 0, endoBonus: 0 },
    ],
  },
  {
    category: "水分・むくみ",
    items: [
      { label: "顔・体がむくみやすい",   ectoBonus: 1, mesoBonus: 1, endoBonus: 2 },
      { label: "水分がたまりやすい",     ectoBonus: 1, mesoBonus: 0, endoBonus: 2 },
      { label: "汗をあまりかかない",     ectoBonus: 2, mesoBonus: 0, endoBonus: 0 },
      { label: "汗をかきやすい",         ectoBonus: 0, mesoBonus: 2, endoBonus: 0 },
    ],
  },
  {
    category: "肩・首・関節",
    items: [
      { label: "肩がこりやすい",         ectoBonus: 1, mesoBonus: 2, endoBonus: 0 },
      { label: "首がつらい",             ectoBonus: 1, mesoBonus: 2, endoBonus: 0 },
      { label: "腰が重い",               ectoBonus: 0, mesoBonus: 2, endoBonus: 1 },
      { label: "関節がこわばりやすい",   ectoBonus: 1, mesoBonus: 2, endoBonus: 1 },
      { label: "体が固いと感じる",       ectoBonus: 0, mesoBonus: 2, endoBonus: 1 },
    ],
  },
  {
    category: "睡眠・気分",
    items: [
      { label: "寝つきにくい・眠りが浅い",   ectoBonus: 2, mesoBonus: 1, endoBonus: 0 },
      { label: "緊張からの頭痛が出やすい",   ectoBonus: 1, mesoBonus: 2, endoBonus: 0 },
      { label: "耳鳴りがすることがある",     ectoBonus: 2, mesoBonus: 0, endoBonus: 0 },
      { label: "頑張りすぎてしまう",         ectoBonus: 0, mesoBonus: 2, endoBonus: 0 },
      { label: "気分の波を感じやすい",       ectoBonus: 1, mesoBonus: 0, endoBonus: 2 },
      { label: "ストレスを抱え込みやすい",   ectoBonus: 2, mesoBonus: 1, endoBonus: 0 },
    ],
  },
  {
    category: "お肌の傾向",
    items: [
      { label: "乾燥・くすみが気になる",     ectoBonus: 2, mesoBonus: 0, endoBonus: 1 },
      { label: "皮脂・毛穴・テカリが気になる", ectoBonus: 0, mesoBonus: 2, endoBonus: 0 },
      { label: "赤み・敏感さが気になる",     ectoBonus: 0, mesoBonus: 0, endoBonus: 2 },
      { label: "日焼けすると黒くなる",       ectoBonus: 2, mesoBonus: 0, endoBonus: 0 },
      { label: "日焼けすると赤くなる",       ectoBonus: 0, mesoBonus: 0, endoBonus: 2 },
      { label: "シミ・肝斑が気になる",       ectoBonus: 1, mesoBonus: 1, endoBonus: 1 },
      { label: "深いシワが気になる",         ectoBonus: 0, mesoBonus: 2, endoBonus: 0 },
      { label: "たるみ・だぶつきが気になる", ectoBonus: 1, mesoBonus: 0, endoBonus: 2 },
    ],
  },
  {
    category: "女性のリズム",
    items: [
      { label: "生理痛がつらい",           ectoBonus: 2, mesoBonus: 1, endoBonus: 0 },
      { label: "周期が乱れやすい",         ectoBonus: 2, mesoBonus: 1, endoBonus: 0 },
      { label: "生理前に不調が出やすい",   ectoBonus: 1, mesoBonus: 1, endoBonus: 1 },
      { label: "更年期の変化を感じる",     ectoBonus: 1, mesoBonus: 1, endoBonus: 1 },
      { label: "妊娠の可能性がある",       ectoBonus: 0, mesoBonus: 0, endoBonus: 0 },
    ],
  },
];

// 全症状のフラットリスト（スコア計算用）
export const ALL_SYMPTOMS: SymptomItem[] = SYMPTOM_CATEGORIES.flatMap(c => c.items);

/**
 * 選択された症状から胚葉ボーナススコアを計算する
 */
export function calcSymptomBonus(selectedSymptoms: string[]): {
  ectoBonus: number;
  mesoBonus: number;
  endoBonus: number;
} {
  let ectoBonus = 0;
  let mesoBonus = 0;
  let endoBonus = 0;
  for (const label of selectedSymptoms) {
    const item = ALL_SYMPTOMS.find(s => s.label === label);
    if (item) {
      ectoBonus += item.ectoBonus;
      mesoBonus += item.mesoBonus;
      endoBonus += item.endoBonus;
    }
  }
  return { ectoBonus, mesoBonus, endoBonus };
}

// ── 生活習慣（Section 4） ──────────────────────────────────────────────────────
// 元データ: カウンセリングシート裏面「外食が多い」「甘いものや辛いものをよく食べる」など
// 注記: 水分・油分のバランスが悪くなる要因、根元の立ち上がりに影響、くせが出やすくなる

export const LIFESTYLE_HABITS = [
  "外食が多い",
  "甘いものや辛いものをよく食べる",
  "アルコールをよく飲む",
  "タバコを吸う",
  "生活が不規則になりがち",
  "日常的にストレスが多いと感じる",
  "睡眠不足（6時間未満）",
  "運動不足",
  "水分摂取が少ない",
  "デスクワーク（長時間座位）",
];

// ── 来店動機（Section 5） ─────────────────────────────────────────────────────

export const VISIT_REASONS = [
  "抜け毛・薄毛が気になる",
  "頭皮の状態を改善したい",
  "髪のうねり・くせ毛を改善したい",
  "頭皮ケアの習慣をつけたい",
  "白髪が気になる",
  "カラー後の頭皮ケア",
  "ヘアケア製品を見直したい",
  "体質に合ったケアを知りたい",
  "その他",
];

// ── 花粉症の種類（Section 4） ─────────────────────────────────────────────────

export const POLLEN_TYPES = [
  "スギ", "ヒノキ", "イネ", "ブタクサ", "キク", "その他",
];

// ── 子供の頃の髪質（Section 4） ───────────────────────────────────────────────
// 注記: 大人になるにつれてどう変化してきたか、くせ毛がどの程度改善できるか

export const HAIR_CHILD_TYPES = [
  { value: "straight", label: "直毛" },
  { value: "wave",     label: "軽いくせ毛" },
  { value: "curly",    label: "強いくせ毛・天然パーマ" },
  { value: "thin",     label: "細毛・軟毛" },
  { value: "thick",    label: "太毛・剛毛" },
];

// ── 髪・頭皮トラブル（Section 4） ─────────────────────────────────────────────

export const HAIR_TROUBLES = [
  "抜け毛が多い",
  "薄毛・ボリュームダウン",
  "頭皮のかゆみ",
  "頭皮の乾燥",
  "頭皮のべたつき",
  "フケ（乾性）",
  "フケ（脂性）",
  "頭皮のにおい",
  "白髪が多い",
  "髪のうねり・くせ毛",
  "枝毛・切れ毛",
  "ハリ・コシがない",
  "カラーの色落ちが早い",
  "頭皮の炎症・赤み",
  "特になし",
];
