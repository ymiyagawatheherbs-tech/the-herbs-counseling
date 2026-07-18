import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/contexts/SessionContext";
import {
  ECTO_ITEMS,
  MESO_ITEMS,
  ENDO_ITEMS,
  SYMPTOM_CATEGORIES,
  HAIR_CHILD_TYPES,
  HAIR_TROUBLES,
  LIFESTYLE_HABITS,
  VISIT_REASONS,
  POLLEN_TYPES,
  MEDICATION_CATEGORIES,
  calcSymptomBonus,
} from "@shared/counselingData";

// ── 型定義 ────────────────────────────────────────────────────────────────────
interface FormData {
  // Section 1
  // Section 1（※ 氏名・生年月日はサーバーに送信されません。印刷用）
  clientName: string;
  clientKana: string;
  clientDob: string;
  managementNo: string;
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
  medications: string[];      // お薬の分類（端末内のみ）
  isPregnant: boolean;        // 妊娠・授乳中（端末内のみ）
  hasPollen: boolean;
  pollenTypes: string[];
  lifestyleHabits: string[];
  foodNotes: string;          // 自由記述（端末内のみ）
  // Section 5
  visitReason: string;
  visitReasonOther: string;
  request: string;            // 自由記述（端末内のみ）
  consent: boolean;
}

const initialForm: FormData = {
  clientName: "", clientKana: "", clientDob: "", managementNo: "",
  ectoChecked: [], mesoChecked: [], endoChecked: [],
  symptoms: [],
  hairChildType: "", hairTroubles: [], colorHistory: "",
  medications: [], isPregnant: false,
  hasPollen: false, pollenTypes: [],
  lifestyleHabits: [], foodNotes: "",
  visitReason: "", visitReasonOther: "", request: "", consent: false,
};

// 生年月日から年代を求める（統計用・個人は特定しない粒度）
function toAgeGroup(dob: string): string {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  if (age < 10 || age > 120) return "";
  if (age >= 70) return "70代以上";
  return `${Math.floor(age / 10) * 10}代`;
}

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
  const channel = (params.get("ch") || "web") as "store" | "sns" | "line" | "web" | "public" | "other";
  // 一般公開（LPなど）からの流入。サロンのカルテ用途と表示を分ける
  const isPublic = channel === "public";

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

  // スコア計算（体質チェック + 症状ボーナス）
  const baseEcto = form.ectoChecked.length;
  const baseMeso = form.mesoChecked.length;
  const baseEndo = form.endoChecked.length;
  const { ectoBonus, mesoBonus, endoBonus } = calcSymptomBonus(form.symptoms);
  const ectoScore = baseEcto + ectoBonus;
  const mesoScore = baseMeso + mesoBonus;
  const endoScore = baseEndo + endoBonus;
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
      // ── サーバーへ送るのは統計に必要な範囲のみ ──────────────────────
      // 氏名・生年月日・自由記述・お薬の情報は送信しません。
      await submitMutation.mutateAsync({
        managementNo: form.managementNo || undefined,
        ageGroup: toAgeGroup(form.clientDob) || undefined,
        ectoScore, mesoScore, endoScore, primaryType,
        ectoChecked: form.ectoChecked,
        mesoChecked: form.mesoChecked,
        endoChecked: form.endoChecked,
        symptoms: form.symptoms,
        hairChildType: form.hairChildType || undefined,
        hairTroubles: form.hairTroubles,
        colorHistory: form.colorHistory || undefined,
        hasPollen: form.hasPollen,
        pollenTypes: form.pollenTypes,
        lifestyleHabits: form.lifestyleHabits,
        visitReason: form.visitReason || undefined,
        accessChannel: channel,
        partnerSalonId: session?.partnerSalonId ?? undefined,
      });

      // ── 結果ページへの受け渡しは sessionStorage（URLには個人情報を載せない）──
      const resultData = {
        ecto: ectoScore, meso: mesoScore, endo: endoScore, type: primaryType, ch: channel,
        name: form.clientName,          // 端末内のみ・印刷用
        dob: form.clientDob,            // 端末内のみ・印刷用
        managementNo: form.managementNo,
        symptoms: form.symptoms,
        lifestyle: form.lifestyleHabits,
        hairTroubles: form.hairTroubles,
        hairChildType: form.hairChildType,
        medications: form.medications,  // 端末内のみ・注意表示用
        isPregnant: form.isPregnant,
        hasPollen: form.hasPollen,
        pollenTypes: form.pollenTypes,
        colorHistory: form.colorHistory,
        foodNotes: form.foodNotes,      // 端末内のみ
        request: form.request,          // 端末内のみ
      };
      sessionStorage.setItem("herbs_result", JSON.stringify(resultData));
      navigate("/result");
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
    "現在気になること・ご要望",
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
            <SectionHeader
              title={isPublic ? "はじめに" : "お客様情報"}
              subtitle={isPublic ? "結果の表示に使用します" : "カルテ用にご記入ください"}
            />
            <div className="rounded-xl p-4 mb-4" style={{ background: "var(--herbs-cream)", border: "1px solid var(--herbs-light)" }}>
              <p style={{ fontSize: "12px", color: "var(--herbs-green)", lineHeight: 1.8 }}>
                {isPublic
                  ? "お名前・生年月日は、この端末の中だけで結果の表示に使われます。サーバーには送信されませんので、ニックネームでも構いません。"
                  : "お名前・生年月日はこの端末の中だけで使用し、サーバーには送信されません。結果ページの印刷・PDF保存で、サロンのカルテとしてご活用ください。"}
              </p>
            </div>
            <div className="space-y-4">
              <FormField label={isPublic ? "お名前・ニックネーム" : "お名前 *"} required={!isPublic}>
                <input type="text" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                  placeholder={isPublic ? "ニックネームでも構いません" : "山田 花子"} style={inputStyle} />
              </FormField>
              {!isPublic && (
              <FormField label="ふりがな">
                <input type="text" value={form.clientKana} onChange={e => setForm(f => ({ ...f, clientKana: e.target.value }))}
                  placeholder="やまだ はなこ" style={inputStyle} />
              </FormField>
              )}
              <FormField label="生年月日">
                <input type="date" value={form.clientDob} onChange={e => setForm(f => ({ ...f, clientDob: e.target.value }))}
                  style={inputStyle} />
                {form.clientDob && toAgeGroup(form.clientDob) && (
                  <p style={{ fontSize: "11px", color: "var(--herbs-muted)", marginTop: "6px" }}>
                    統計には「{toAgeGroup(form.clientDob)}」としてのみ記録されます
                  </p>
                )}
              </FormField>
              {!isPublic && (
              <FormField label="管理番号（サロン用・任意）">
                <input type="text" value={form.managementNo} onChange={e => setForm(f => ({ ...f, managementNo: e.target.value }))}
                  placeholder="例：A-001（サロンのカルテ番号など）" style={inputStyle} />
              </FormField>
              )}
            </div>
          </div>
        )}

        {/* ── Section 2: 体質傾向チェック ── */}
        {section === 2 && (
          <div className="animate-fade-in-up">
            <SectionHeader
              title="体質傾向チェック"
              subtitle="当てはまる項目をすべてお選びください。チェックの多いグループがお客様の体質傾向です。"
            />
            <TypeCheckGroup
              title="グループA" color="#C4604A" bg="#FDF0EB" bd="#EDCAB8"
              items={ECTO_ITEMS} checked={form.ectoChecked}
              onToggle={v => toggleCheck("ectoChecked", v)}
              score={baseEcto}
            />
            <TypeCheckGroup
              title="グループB" color="#3A6285" bg="#EBF2F8" bd="#C0D8EC"
              items={MESO_ITEMS} checked={form.mesoChecked}
              onToggle={v => toggleCheck("mesoChecked", v)}
              score={baseMeso}
            />
            <TypeCheckGroup
              title="グループC" color="#9A4870" bg="#FDF0F5" bd="#E8C0D0"
              items={ENDO_ITEMS} checked={form.endoChecked}
              onToggle={v => toggleCheck("endoChecked", v)}
              score={baseEndo}
            />
          </div>
        )}

        {/* ── Section 3: 身体の症状 ── */}
        {section === 3 && (
          <div className="animate-fade-in-up space-y-4">
            <SectionHeader
              title="身体の症状"
              subtitle="現在お感じの症状をすべてお選びください。体質傾向の判定に活用します。"
            />
            {SYMPTOM_CATEGORIES.map(cat => (
              <div key={cat.category} className="rounded-2xl p-5" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--herbs-gold)", marginBottom: "10px", letterSpacing: "0.05em" }}>
                  {cat.category}
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map(item => (
                    <CheckChip
                      key={item.label}
                      label={item.label}
                      checked={form.symptoms.includes(item.label)}
                      onChange={() => toggleCheck("symptoms", item.label)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Section 4: 髪・生活習慣 ── */}
        {section === 4 && (
          <div className="animate-fade-in-up space-y-5">
            <SectionHeader title="髪・生活習慣" subtitle="髪と生活習慣についてお聞かせください" />

            {/* 子供の頃の髪質 */}
            {/* 注: 大人になるにつれてどう変化してきたか、くせ毛の改善度合いの目安になります */}
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
            {/* 注: 頭皮や髪の改善までの期間の目安になります */}
            <Card title="カラー・パーマの施術頻度や期間">
              <input type="text" value={form.colorHistory}
                onChange={e => setForm(f => ({ ...f, colorHistory: e.target.value }))}
                placeholder="例：3ヶ月に1回カラー、1年前にパーマ" style={inputStyle} />
            </Card>

            {/* 服薬 */}
            {/* 注: 薬によっては髪質が変化することがあります（特にステロイド・ホルモン剤・抗ガン剤等） */}
            <Card title="お薬・サプリメントについて">
              <p style={{ fontSize: "12px", color: "var(--herbs-muted)", marginBottom: "12px", lineHeight: 1.8 }}>
                ハーブ・精油には、お薬の働きに影響するものがあります。安全にお使いいただくため、
                当てはまるものがあればお選びください。<br />
                <span style={{ color: "var(--herbs-green)" }}>※ この内容はサーバーに送信されません。ご案内の表示にのみ使用します。</span>
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {MEDICATION_CATEGORIES.map(m => (
                  <CheckChip
                    key={m.label}
                    label={m.label}
                    checked={form.medications.includes(m.label)}
                    onChange={() => toggleCheck("medications", m.label)}
                  />
                ))}
              </div>
              <div style={{ borderTop: "1px solid var(--herbs-light)", paddingTop: "12px" }}>
                <CheckChip
                  label="妊娠中・授乳中"
                  checked={form.isPregnant}
                  onChange={() => setForm(f => ({ ...f, isPregnant: !f.isPregnant }))}
                />
              </div>
            </Card>

            {/* 花粉症 */}
            {/* 注: 植物に対するアレルギー反応の可能性を確認します */}
            <Card title="花粉症はありますか？">
              <div className="flex gap-3 mb-3">
                {[{ v: false, l: "なし" }, { v: true, l: "あり" }].map(opt => (
                  <button key={String(opt.v)} type="button"
                    onClick={() => setForm(f => ({ ...f, hasPollen: opt.v }))}
                    style={{
                      padding: "8px 20px", borderRadius: "20px",
                      border: `1.5px solid ${form.hasPollen === opt.v ? "var(--herbs-green)" : "var(--herbs-light)"}`,
                      background: form.hasPollen === opt.v ? "var(--herbs-green)" : "var(--herbs-white)",
                      color: form.hasPollen === opt.v ? "white" : "var(--herbs-muted)",
                      fontSize: "13px", cursor: "pointer",
                    }}>
                    {opt.l}
                  </button>
                ))}
              </div>
              {form.hasPollen && (
                <div className="flex flex-wrap gap-2">
                  {POLLEN_TYPES.map(p => (
                    <CheckChip key={p} label={p} checked={form.pollenTypes.includes(p)}
                      onChange={() => toggleCheck("pollenTypes", p)} />
                  ))}
                </div>
              )}
            </Card>

            {/* 生活習慣 */}
            {/* 注: 水分・油分のバランスが悪くなる要因、根元の立ち上がりに影響、くせが出やすくなります */}
            <Card title="生活習慣（当てはまるものをすべて）">
              <p style={{ fontSize: "12px", color: "var(--herbs-muted)", marginBottom: "10px", lineHeight: 1.7 }}>
                生活習慣は頭皮・髪の水分・油分バランスに影響します。
              </p>
              <div className="flex flex-wrap gap-2">
                {LIFESTYLE_HABITS.map(h => (
                  <CheckChip key={h} label={h} checked={form.lifestyleHabits.includes(h)}
                    onChange={() => toggleCheck("lifestyleHabits", h)} />
                ))}
              </div>
            </Card>

            {/* 食事メモ */}
            {/* 注: その方の髪や体を作る栄養素の源を知るために活用します */}
            <Card title="普段の食生活について">
              <p style={{ fontSize: "12px", color: "var(--herbs-muted)", marginBottom: "10px", lineHeight: 1.7 }}>
                食事は髪・頭皮を作る栄養素の源です。気になることがあればご記入ください。
              </p>
              <textarea value={form.foodNotes}
                onChange={e => setForm(f => ({ ...f, foodNotes: e.target.value }))}
                placeholder="例：野菜不足が気になる、タンパク質が少ない、甘いものが多い、など"
                rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </Card>
          </div>
        )}

        {/* ── Section 5: 病歴・ご要望 ── */}
        {section === 5 && (
          <div className="animate-fade-in-up space-y-5">
            <SectionHeader title="現在気になること・ご要望" subtitle="最後にご要望をお聞かせください" />

            {/* 現在気になること */}
            <Card title="現在、気になること">
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
              {form.visitReason === "その他" && (
                <textarea value={form.visitReasonOther ?? ""}
                  onChange={e => setForm(f => ({ ...f, visitReasonOther: e.target.value }))}
                  placeholder="具体的に教えてください（例：最近髪のまとまりが悪くなった、など）" rows={3}
                  style={{ ...inputStyle, resize: "vertical", marginTop: "12px" }} />
              )}
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
                if (section === 1 && !isPublic && !form.clientName.trim()) {
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
        {label} {required && <span style={{ color: "var(--herbs-terra)", fontSize: "12px" }}>必須</span>}
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
