import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/contexts/SessionContext";

// ── 体質チェック項目データ ────────────────────────────────────────────────────
const ECTO_ITEMS = [
  "体重が増えにくい",
  "肌が乾燥しやすい・敏感肌",
  "子供の頃から髪が多い",
  "末端冷え性",
  "昔から体力がない方だと思う",
  "周囲のことが常に気になる",
  "食欲にムラがある",
  "華奢だと言われたことがある",
  "年々髪のうねりが強くなる",
  "睡眠が浅い・眠りにくい",
];
const MESO_ITEMS = [
  "筋肉がつきやすい体質だと思う",
  "体を動かすことが好き",
  "Tゾーン・Uゾーンはベタつくが他は乾燥",
  "パーマがすぐに取れる",
  "活動的な方だと思う",
  "ストレスを感じるとイライラしてしまう",
  "食欲はいつもある方",
  "骨格・体格がしっかりしている方だと思う",
  "頭皮がベタつきやすい",
  "よく眠れる体質だと思う",
  "我慢強い方だと思う",
  "しっかりしているねと言われたことがある",
];
const ENDO_ITEMS = [
  "太りやすい・体重が増えやすい",
  "冬は粉が吹いたように乾燥する",
  "髪が細く、毛先がくるんとするネコ毛",
  "体が温かい・暑がり",
  "穏やか・のんびりしている方だと思う",
  "いつも笑顔だねと言われたことがある",
  "食べることが好き",
  "日焼けすると真っ赤になる",
  "友人は多い方だと思う",
  "よく眠れる・眠りが深い",
];

const SYMPTOMS = [
  "肩こり", "腰痛", "頭痛", "冷え性", "むくみ", "疲れやすい",
  "胃腸の不調", "便秘", "下痢", "生理不順", "更年期症状",
  "アレルギー", "花粉症", "アトピー", "喘息", "不眠",
  "ストレス・不安", "うつ傾向", "血圧の異常", "特になし",
];

const HAIR_CHILD_TYPES = [
  { value: "straight", label: "直毛" },
  { value: "wave", label: "軽いくせ毛" },
  { value: "curly", label: "強いくせ毛・天然パーマ" },
  { value: "thin", label: "細毛・軟毛" },
  { value: "thick", label: "太毛・剛毛" },
];

const HAIR_TROUBLES = [
  "抜け毛が多い", "薄毛・ボリュームダウン", "頭皮のかゆみ",
  "頭皮の乾燥", "頭皮のべたつき", "フケ（乾性）", "フケ（脂性）",
  "頭皮のにおい", "白髪が多い", "髪のうねり・くせ毛",
  "枝毛・切れ毛", "ハリ・コシがない", "カラーの色落ちが早い",
  "頭皮の炎症・赤み", "特になし",
];

const LIFESTYLE_HABITS = [
  "喫煙している", "飲酒が多い（週3回以上）", "睡眠不足（6時間未満）",
  "運動不足", "外食・コンビニ食が多い", "ダイエット中",
  "デスクワーク（長時間座位）", "立ち仕事が多い", "夜型生活",
  "ストレスが多い", "水分摂取が少ない",
];

const VISIT_REASONS = [
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

// ── 型定義 ────────────────────────────────────────────────────────────────────
interface FormData {
  // Section 1
  clientName: string;
  clientKana: string;
  clientDob: string;
  clientJob: string;
  clientAddress: string;
  clientTel: string;
  clientMobile: string;
  // Section 2
  ectoChecked: string[];
  mesoChecked: string[];
  endoChecked: string[];
  // Section 3
  symptoms: string[];
  // Section 4
  hairChildType: string;
  hairTroubles: string[];
  colorHistory: string;
  hasMedication: boolean;
  medicationDetail: string;
  hasPollen: boolean;
  pollenTypes: string[];
  lifestyleHabits: string[];
  foodNotes: string;
  // Section 5
  hasIllness: boolean;
  illnessDetail: string;
  visitReason: string;
  request: string;
  consent: boolean;
}

const initialForm: FormData = {
  clientName: "", clientKana: "", clientDob: "", clientJob: "",
  clientAddress: "", clientTel: "", clientMobile: "",
  ectoChecked: [], mesoChecked: [], endoChecked: [],
  symptoms: [],
  hairChildType: "", hairTroubles: [], colorHistory: "",
  hasMedication: false, medicationDetail: "",
  hasPollen: false, pollenTypes: [],
  lifestyleHabits: [], foodNotes: "",
  hasIllness: false, illnessDetail: "",
  visitReason: "", request: "", consent: false,
};

// ── チェックボックスチップコンポーネント ─────────────────────────────────────
function CheckChip({ label, checked, onChange, color = "var(--herbs-green)" }: {
  label: string; checked: boolean; onChange: () => void; color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        padding: "8px 14px",
        borderRadius: "20px",
        border: `1.5px solid ${checked ? color : "var(--herbs-light)"}`,
        background: checked ? color : "var(--herbs-white)",
        color: checked ? "white" : "var(--herbs-muted)",
        fontSize: "13px",
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: "'Noto Sans JP', sans-serif",
      }}
    >
      {checked ? "✓ " : ""}{label}
    </button>
  );
}

// ── メインコンポーネント ──────────────────────────────────────────────────────
export default function CounselingPage() {
  const [section, setSection] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [, navigate] = useLocation();
  const { session } = useSession();
  const submitMutation = trpc.counseling.submit.useMutation();
  const params = new URLSearchParams(window.location.search);
  const channel = (params.get("ch") || "web") as "store" | "sns" | "line" | "web" | "other";

  const totalSections = 5;
  const progress = (section / totalSections) * 100;

  // チェックリスト操作
  const toggleCheck = (field: keyof FormData, value: string) => {
    const arr = form[field] as string[];
    setForm(f => ({
      ...f,
      [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
    }));
  };

  // スコア計算
  const ectoScore = form.ectoChecked.length;
  const mesoScore = form.mesoChecked.length;
  const endoScore = form.endoChecked.length;
  const maxScore = Math.max(ectoScore, mesoScore, endoScore);
  const primaryType = maxScore === 0 ? "unknown"
    : ectoScore === maxScore ? "ecto"
    : mesoScore === maxScore ? "meso"
    : "endo";

  // 送信処理
  const handleSubmit = async () => {
    if (!form.consent) return;
    setSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        ...form,
        ectoScore, mesoScore, endoScore, primaryType,
        accessChannel: channel,
        partnerSalonId: session?.partnerSalonId ?? undefined,
      });
      navigate(`/result?ecto=${ectoScore}&meso=${mesoScore}&endo=${endoScore}&name=${encodeURIComponent(form.clientName)}&type=${primaryType}&ch=${channel}`);
    } catch (err) {
      console.error(err);
      alert("送信中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  const sectionTitles = [
    "お客様情報",
    "体質傾向チェック",
    "身体の症状",
    "髪・生活習慣",
    "病歴・ご要望",
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--herbs-page-bg)" }}>
      {/* ヘッダー */}
      <header style={{ background: "var(--herbs-white)", borderBottom: "1px solid var(--herbs-light)", padding: "12px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => section > 1 ? setSection(s => s - 1) : navigate("/")}
              style={{ background: "none", border: "none", color: "var(--herbs-muted)", cursor: "pointer", fontSize: "13px" }}>
              ← 戻る
            </button>
            <span style={{ fontSize: "12px", color: "var(--herbs-muted)" }}>
              {section} / {totalSections}　{sectionTitles[section - 1]}
            </span>
            <div style={{ width: 40 }} />
          </div>
          {/* プログレスバー */}
          <div style={{ height: 3, background: "var(--herbs-light)", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "var(--herbs-green)", borderRadius: 2, transition: "width 0.3s" }} />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* ── Section 1: お客様情報 ── */}
        {section === 1 && (
          <div className="animate-fade-in-up">
            <SectionHeader title="お客様情報" subtitle="基本情報をご入力ください" />
            <div className="space-y-4">
              <FormField label="お名前 *" required>
                <input type="text" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                  placeholder="山田 花子" style={inputStyle} />
              </FormField>
              <FormField label="ふりがな">
                <input type="text" value={form.clientKana} onChange={e => setForm(f => ({ ...f, clientKana: e.target.value }))}
                  placeholder="やまだ はなこ" style={inputStyle} />
              </FormField>
              <FormField label="生年月日">
                <input type="date" value={form.clientDob} onChange={e => setForm(f => ({ ...f, clientDob: e.target.value }))}
                  style={inputStyle} />
              </FormField>
              <FormField label="ご職業">
                <input type="text" value={form.clientJob} onChange={e => setForm(f => ({ ...f, clientJob: e.target.value }))}
                  placeholder="会社員・主婦・学生など" style={inputStyle} />
              </FormField>
              <FormField label="ご住所">
                <input type="text" value={form.clientAddress} onChange={e => setForm(f => ({ ...f, clientAddress: e.target.value }))}
                  placeholder="都道府県・市区町村" style={inputStyle} />
              </FormField>
              <FormField label="電話番号（自宅）">
                <input type="tel" value={form.clientTel} onChange={e => setForm(f => ({ ...f, clientTel: e.target.value }))}
                  placeholder="000-0000-0000" style={inputStyle} />
              </FormField>
              <FormField label="電話番号（携帯）">
                <input type="tel" value={form.clientMobile} onChange={e => setForm(f => ({ ...f, clientMobile: e.target.value }))}
                  placeholder="000-0000-0000" style={inputStyle} />
              </FormField>
            </div>
          </div>
        )}

        {/* ── Section 2: 体質傾向チェック ── */}
        {section === 2 && (
          <div className="animate-fade-in-up">
            <SectionHeader title="体質傾向チェック" subtitle="当てはまる項目をすべてお選びください" />
            <TypeCheckGroup
              title="グループA" color="#C4604A" bg="#FDF0EB" bd="#EDCAB8"
              items={ECTO_ITEMS} checked={form.ectoChecked}
              onToggle={v => toggleCheck("ectoChecked", v)}
              score={ectoScore}
            />
            <TypeCheckGroup
              title="グループB" color="#3A6285" bg="#EBF2F8" bd="#C0D8EC"
              items={MESO_ITEMS} checked={form.mesoChecked}
              onToggle={v => toggleCheck("mesoChecked", v)}
              score={mesoScore}
            />
            <TypeCheckGroup
              title="グループC" color="#9A4870" bg="#FDF0F5" bd="#E8C0D0"
              items={ENDO_ITEMS} checked={form.endoChecked}
              onToggle={v => toggleCheck("endoChecked", v)}
              score={endoScore}
            />
          </div>
        )}

        {/* ── Section 3: 身体の症状 ── */}
        {section === 3 && (
          <div className="animate-fade-in-up">
            <SectionHeader title="身体の症状" subtitle="現在お感じの症状をすべてお選びください" />
            <div className="rounded-2xl p-5" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(s => (
                  <CheckChip key={s} label={s} checked={form.symptoms.includes(s)}
                    onChange={() => toggleCheck("symptoms", s)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Section 4: 髪・生活習慣 ── */}
        {section === 4 && (
          <div className="animate-fade-in-up space-y-5">
            <SectionHeader title="髪・生活習慣" subtitle="髪と生活習慣についてお聞かせください" />

            {/* 子供の頃の髪質 */}
            <Card title="子供の頃の髪質">
              <div className="flex flex-wrap gap-2">
                {HAIR_CHILD_TYPES.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => setForm(f => ({ ...f, hairChildType: t.value }))}
                    style={{
                      padding: "8px 14px", borderRadius: "20px",
                      border: `1.5px solid ${form.hairChildType === t.value ? "var(--herbs-green)" : "var(--herbs-light)"}`,
                      background: form.hairChildType === t.value ? "var(--herbs-green)" : "var(--herbs-white)",
                      color: form.hairChildType === t.value ? "white" : "var(--herbs-muted)",
                      fontSize: "13px", cursor: "pointer", transition: "all 0.15s",
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* 髪・頭皮のトラブル */}
            <Card title="現在の髪・頭皮のトラブル（複数選択可）">
              <div className="flex flex-wrap gap-2">
                {HAIR_TROUBLES.map(t => (
                  <CheckChip key={t} label={t} checked={form.hairTroubles.includes(t)}
                    onChange={() => toggleCheck("hairTroubles", t)} />
                ))}
              </div>
            </Card>

            {/* カラー・パーマ歴 */}
            <Card title="カラー・パーマの履歴">
              <input type="text" value={form.colorHistory}
                onChange={e => setForm(f => ({ ...f, colorHistory: e.target.value }))}
                placeholder="例：3ヶ月前にカラー、1年前にパーマ" style={inputStyle} />
            </Card>

            {/* 服薬 */}
            <Card title="現在服用中のお薬はありますか？">
              <div className="flex gap-3 mb-3">
                {[{ v: false, l: "なし" }, { v: true, l: "あり" }].map(opt => (
                  <button key={String(opt.v)} type="button"
                    onClick={() => setForm(f => ({ ...f, hasMedication: opt.v }))}
                    style={{
                      padding: "8px 20px", borderRadius: "20px",
                      border: `1.5px solid ${form.hasMedication === opt.v ? "var(--herbs-green)" : "var(--herbs-light)"}`,
                      background: form.hasMedication === opt.v ? "var(--herbs-green)" : "var(--herbs-white)",
                      color: form.hasMedication === opt.v ? "white" : "var(--herbs-muted)",
                      fontSize: "13px", cursor: "pointer",
                    }}>
                    {opt.l}
                  </button>
                ))}
              </div>
              {form.hasMedication && (
                <input type="text" value={form.medicationDetail}
                  onChange={e => setForm(f => ({ ...f, medicationDetail: e.target.value }))}
                  placeholder="お薬の種類・目的をご記入ください" style={inputStyle} />
              )}
            </Card>

            {/* 生活習慣 */}
            <Card title="生活習慣（当てはまるものをすべて）">
              <div className="flex flex-wrap gap-2">
                {LIFESTYLE_HABITS.map(h => (
                  <CheckChip key={h} label={h} checked={form.lifestyleHabits.includes(h)}
                    onChange={() => toggleCheck("lifestyleHabits", h)} />
                ))}
              </div>
            </Card>

            {/* 食事メモ */}
            <Card title="食事・栄養について気になること">
              <textarea value={form.foodNotes}
                onChange={e => setForm(f => ({ ...f, foodNotes: e.target.value }))}
                placeholder="例：野菜不足が気になる、タンパク質が少ない、など"
                rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </Card>
          </div>
        )}

        {/* ── Section 5: 病歴・ご要望 ── */}
        {section === 5 && (
          <div className="animate-fade-in-up space-y-5">
            <SectionHeader title="病歴・ご要望" subtitle="最後にご要望をお聞かせください" />

            {/* 病歴 */}
            <Card title="現在または過去の病歴・手術歴はありますか？">
              <div className="flex gap-3 mb-3">
                {[{ v: false, l: "なし" }, { v: true, l: "あり" }].map(opt => (
                  <button key={String(opt.v)} type="button"
                    onClick={() => setForm(f => ({ ...f, hasIllness: opt.v }))}
                    style={{
                      padding: "8px 20px", borderRadius: "20px",
                      border: `1.5px solid ${form.hasIllness === opt.v ? "var(--herbs-green)" : "var(--herbs-light)"}`,
                      background: form.hasIllness === opt.v ? "var(--herbs-green)" : "var(--herbs-white)",
                      color: form.hasIllness === opt.v ? "white" : "var(--herbs-muted)",
                      fontSize: "13px", cursor: "pointer",
                    }}>
                    {opt.l}
                  </button>
                ))}
              </div>
              {form.hasIllness && (
                <textarea value={form.illnessDetail}
                  onChange={e => setForm(f => ({ ...f, illnessDetail: e.target.value }))}
                  placeholder="病名・時期などをご記入ください" rows={3}
                  style={{ ...inputStyle, resize: "vertical" }} />
              )}
            </Card>

            {/* 来店動機 */}
            <Card title="本日のご来店・ご利用のきっかけ">
              <div className="flex flex-wrap gap-2">
                {VISIT_REASONS.map(r => (
                  <button key={r} type="button"
                    onClick={() => setForm(f => ({ ...f, visitReason: r }))}
                    style={{
                      padding: "8px 14px", borderRadius: "20px",
                      border: `1.5px solid ${form.visitReason === r ? "var(--herbs-green)" : "var(--herbs-light)"}`,
                      background: form.visitReason === r ? "var(--herbs-green)" : "var(--herbs-white)",
                      color: form.visitReason === r ? "white" : "var(--herbs-muted)",
                      fontSize: "13px", cursor: "pointer", transition: "all 0.15s",
                    }}>
                    {r}
                  </button>
                ))}
              </div>
            </Card>

            {/* ご要望 */}
            <Card title="その他、ご要望・ご質問">
              <textarea value={form.request}
                onChange={e => setForm(f => ({ ...f, request: e.target.value }))}
                placeholder="ご自由にお書きください" rows={4}
                style={{ ...inputStyle, resize: "vertical" }} />
            </Card>

            {/* 同意 */}
            <div className="rounded-2xl p-5" style={{ background: "var(--herbs-cream)", border: "1px solid var(--herbs-light)" }}>
              <p style={{ fontSize: "13px", color: "var(--herbs-muted)", lineHeight: 1.8, marginBottom: "12px" }}>
                ご記入いただいた情報は、THE HERBSのカウンセリング・製品提案・サービス改善のみに使用し、第三者への提供は行いません。
              </p>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" checked={form.consent}
                  onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: "var(--herbs-green)" }} />
                <span style={{ fontSize: "13px", color: "var(--herbs-green)", fontWeight: 500 }}>
                  個人情報の取り扱いに同意します
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ナビゲーションボタン */}
        <div className="mt-8 flex gap-3">
          {section > 1 && (
            <button onClick={() => setSection(s => s - 1)}
              style={{
                flex: 1, padding: "14px", border: "1.5px solid var(--herbs-light)",
                borderRadius: "12px", background: "var(--herbs-white)",
                color: "var(--herbs-muted)", fontSize: "14px", cursor: "pointer",
              }}>
              ← 前へ
            </button>
          )}
          {section < totalSections ? (
            <button
              onClick={() => {
                if (section === 1 && !form.clientName.trim()) {
                  alert("お名前をご入力ください");
                  return;
                }
                setSection(s => s + 1);
                window.scrollTo(0, 0);
              }}
              style={{
                flex: 2, padding: "14px", background: "var(--herbs-green)",
                color: "var(--herbs-white)", border: "none", borderRadius: "12px",
                fontSize: "14px", cursor: "pointer", letterSpacing: "0.05em",
              }}>
              次へ →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!form.consent || submitting}
              style={{
                flex: 2, padding: "14px",
                background: form.consent && !submitting ? "var(--herbs-green)" : "var(--herbs-light)",
                color: form.consent && !submitting ? "var(--herbs-white)" : "var(--herbs-muted)",
                border: "none", borderRadius: "12px",
                fontSize: "14px", cursor: form.consent && !submitting ? "pointer" : "not-allowed",
                letterSpacing: "0.05em",
              }}>
              {submitting ? "送信中..." : "診断結果を見る →"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

// ── サブコンポーネント ─────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--herbs-green)", letterSpacing: "0.05em", marginBottom: "4px" }}>
        {title}
      </h2>
      <p style={{ fontSize: "13px", color: "var(--herbs-muted)" }}>{subtitle}</p>
      <div style={{ width: 32, height: 1, background: "var(--herbs-gold)", marginTop: "10px" }} />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--herbs-green)", marginBottom: "12px" }}>{title}</div>
      {children}
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
      <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--herbs-green)", marginBottom: "8px" }}>
        {label} {required &&           <span style={{ color: "var(--herbs-terra)", fontSize: "12px" }}>必須</span>}
      </label>
      {children}
    </div>
  );
}

function TypeCheckGroup({ title, color, bg, bd, items, checked, onToggle, score }: {
  title: string; color: string; bg: string; bd: string;
  items: string[]; checked: string[]; onToggle: (v: string) => void; score: number;
}) {
  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: bg, border: `1.5px solid ${bd}` }}>
      <div className="flex items-center justify-between mb-3">
        <div style={{ fontSize: "14px", fontWeight: 700, color }}>{title}</div>
        <div style={{ fontSize: "13px", color, background: "rgba(255,255,255,0.7)", padding: "3px 10px", borderRadius: "12px" }}>
          {score} / {items.length}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <CheckChip key={item} label={item} checked={checked.includes(item)}
            onChange={() => onToggle(item)} color={color} />
        ))}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid var(--herbs-light)",
  borderRadius: "10px",
  background: "var(--herbs-cream)",
  color: "var(--herbs-green)",
  fontSize: "14px",
  outline: "none",
  fontFamily: "'Noto Sans JP', sans-serif",
};
