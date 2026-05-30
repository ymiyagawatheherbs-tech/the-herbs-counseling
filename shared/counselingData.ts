/**
 * THE HERBS カウンセリングシート データ定義
 *
 * このファイルはGitHubで直接編集できます。
 * 症状・チェック項目・胚葉スコアの対応を管理します。
 *
 * ─────────────────────────────────────────────────────────────────
 * 胚葉タイプ凡例:
 *   ecto = 外胚葉型（赤）: 神経系・皮膚・感覚器官が発達、乾燥・敏感肌傾向
 *   meso = 中胚葉型（青）: 筋骨格系が発達、活動的・ベタつき傾向
 *   endo = 内胚葉型（緑）: 消化器系・内分泌系が発達、むくみ・皮脂多め傾向
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
    category: "筋肉系",
    items: [
      { label: "肩こり",   ectoBonus: 1, mesoBonus: 1, endoBonus: 0 },
      { label: "首の痛み", ectoBonus: 1, mesoBonus: 1, endoBonus: 0 },
      { label: "腰痛",     ectoBonus: 0, mesoBonus: 2, endoBonus: 1 },
      { label: "しびれ",   ectoBonus: 1, mesoBonus: 0, endoBonus: 1 },
    ],
  },
  {
    category: "呼吸器系",
    items: [
      { label: "気管支炎",   ectoBonus: 2, mesoBonus: 0, endoBonus: 1 },
      { label: "鼻炎",       ectoBonus: 2, mesoBonus: 0, endoBonus: 1 },
      { label: "せき",       ectoBonus: 1, mesoBonus: 0, endoBonus: 2 },
      { label: "ぜんそく",   ectoBonus: 2, mesoBonus: 0, endoBonus: 1 },
      { label: "花粉症",     ectoBonus: 2, mesoBonus: 0, endoBonus: 1 },
      { label: "呼吸が浅い", ectoBonus: 2, mesoBonus: 0, endoBonus: 0 },
      { label: "風邪をひきやすい", ectoBonus: 2, mesoBonus: 0, endoBonus: 1 },
    ],
  },
  {
    category: "循環器系",
    items: [
      { label: "貧血",       ectoBonus: 2, mesoBonus: 0, endoBonus: 1 },
      { label: "低血圧",     ectoBonus: 2, mesoBonus: 0, endoBonus: 0 },
      { label: "静脈瘤",     ectoBonus: 0, mesoBonus: 1, endoBonus: 2 },
      { label: "心臓病",     ectoBonus: 1, mesoBonus: 1, endoBonus: 1 },
      { label: "高血圧",     ectoBonus: 0, mesoBonus: 2, endoBonus: 1 },
      { label: "糖尿病",     ectoBonus: 0, mesoBonus: 1, endoBonus: 2 },
      { label: "中性脂肪",   ectoBonus: 0, mesoBonus: 1, endoBonus: 2 },
    ],
  },
  {
    category: "消化器系",
    items: [
      { label: "胃痛",       ectoBonus: 2, mesoBonus: 1, endoBonus: 0 },
      { label: "胃酸過多",   ectoBonus: 1, mesoBonus: 2, endoBonus: 0 },
      { label: "潰瘍",       ectoBonus: 1, mesoBonus: 2, endoBonus: 0 },
      { label: "肝臓不調",   ectoBonus: 0, mesoBonus: 1, endoBonus: 2 },
      { label: "便秘",       ectoBonus: 2, mesoBonus: 0, endoBonus: 1 },
      { label: "下痢",       ectoBonus: 2, mesoBonus: 1, endoBonus: 0 },
      { label: "お腹の張り", ectoBonus: 1, mesoBonus: 0, endoBonus: 2 },
    ],
  },
  {
    category: "泌尿器系",
    items: [
      { label: "膀胱炎",   ectoBonus: 2, mesoBonus: 0, endoBonus: 1 },
      { label: "腎結石",   ectoBonus: 1, mesoBonus: 1, endoBonus: 1 },
      { label: "腎臓病",   ectoBonus: 1, mesoBonus: 0, endoBonus: 2 },
      { label: "むくみ",   ectoBonus: 0, mesoBonus: 0, endoBonus: 2 },
    ],
  },
  {
    category: "婦人科系",
    items: [
      { label: "生理痛",       ectoBonus: 2, mesoBonus: 0, endoBonus: 1 },
      { label: "生理不順",     ectoBonus: 2, mesoBonus: 1, endoBonus: 0 },
      { label: "子宮内膜症",   ectoBonus: 1, mesoBonus: 0, endoBonus: 2 },
      { label: "子宮筋腫",     ectoBonus: 0, mesoBonus: 0, endoBonus: 2 },
      { label: "妊娠の可能性", ectoBonus: 0, mesoBonus: 0, endoBonus: 0 },
    ],
  },
  {
    category: "その他",
    items: [
      { label: "アレルギー",   ectoBonus: 2, mesoBonus: 0, endoBonus: 1 },
      { label: "アトピー",     ectoBonus: 2, mesoBonus: 0, endoBonus: 1 },
      { label: "頭痛",         ectoBonus: 2, mesoBonus: 1, endoBonus: 0 },
      { label: "冷え性",       ectoBonus: 2, mesoBonus: 0, endoBonus: 0 },
      { label: "関節炎",       ectoBonus: 1, mesoBonus: 2, endoBonus: 1 },
      { label: "リウマチ",     ectoBonus: 1, mesoBonus: 1, endoBonus: 1 },
      { label: "耳鳴り",       ectoBonus: 2, mesoBonus: 0, endoBonus: 0 },
      { label: "不眠",         ectoBonus: 2, mesoBonus: 0, endoBonus: 0 },
      { label: "坐骨神経痛",   ectoBonus: 1, mesoBonus: 1, endoBonus: 1 },
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
