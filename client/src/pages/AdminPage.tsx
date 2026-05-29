import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/contexts/SessionContext";

const TYPE_LABELS = { ecto: "外胚葉型", meso: "中胚葉型", endo: "内胚葉型", unknown: "不明" };
const TYPE_COLORS = { ecto: "#C4604A", meso: "#3A6285", endo: "#9A4870", unknown: "#888" };
const CHANNEL_LABELS: Record<string, string> = { store: "店頭", sns: "SNS", line: "LINE", web: "Web", other: "その他" };

export default function AdminPage() {
  const [tab, setTab] = useState<"sessions" | "stats" | "passcodes" | "salons">("sessions");
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();
  const { session, clearSession } = useSession();

  // 管理者チェック
  if (!session || session.type !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--herbs-page-bg)" }}>
        <div className="text-center">
          <p style={{ color: "var(--herbs-muted)", marginBottom: "16px" }}>管理者権限が必要です</p>
          <button onClick={() => navigate("/")} style={{ padding: "10px 24px", background: "var(--herbs-green)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            トップへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--herbs-page-bg)" }}>
      {/* ヘッダー */}
      <header style={{ background: "var(--herbs-green)", padding: "12px 16px" }}>
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "var(--herbs-gold)", fontFamily: "'Cormorant Garamond', serif" }}>THE HERBS</div>
            <h1 style={{ fontSize: "16px", fontWeight: 400, color: "white", letterSpacing: "0.08em" }}>管理画面</h1>
          </div>
          <button onClick={() => { clearSession(); navigate("/"); }}
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", background: "none", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "6px", padding: "6px 12px", cursor: "pointer" }}>
            ログアウト
          </button>
        </div>
      </header>

      {/* タブ */}
      <div style={{ background: "var(--herbs-white)", borderBottom: "1px solid var(--herbs-light)" }}>
        <div className="max-w-5xl mx-auto flex overflow-x-auto">
          {[
            { key: "sessions", label: "カウンセリングデータ" },
            { key: "stats", label: "集計・グラフ" },
            { key: "passcodes", label: "パスコード管理" },
            { key: "salons", label: "パートナーサロン" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              style={{
                padding: "14px 20px", border: "none", background: "none",
                borderBottom: tab === t.key ? "2px solid var(--herbs-green)" : "2px solid transparent",
                color: tab === t.key ? "var(--herbs-green)" : "var(--herbs-muted)",
                fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap", fontWeight: tab === t.key ? 500 : 400,
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === "sessions" && <SessionsTab search={search} setSearch={setSearch} />}
        {tab === "stats" && <StatsTab />}
        {tab === "passcodes" && <PasscodesTab />}
        {tab === "salons" && <SalonsTab />}
      </main>
    </div>
  );
}

// ── カウンセリングデータ一覧 ──────────────────────────────────────────────────
function SessionsTab({ search, setSearch }: { search: string; setSearch: (s: string) => void }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: sessions, isLoading } = trpc.counseling.listAll.useQuery({ limit: 200 });

  const filtered = sessions?.filter(s =>
    s.clientName.includes(search) ||
    TYPE_LABELS[s.primaryType as keyof typeof TYPE_LABELS]?.includes(search) ||
    CHANNEL_LABELS[s.accessChannel]?.includes(search)
  ) ?? [];

  const selected = selectedId ? sessions?.find(s => s.id === selectedId) : null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="名前・体質タイプ・経路で検索..."
          style={{ flex: 1, padding: "10px 14px", border: "1.5px solid var(--herbs-light)", borderRadius: "8px", background: "var(--herbs-white)", fontSize: "13px", outline: "none" }} />
        <span style={{ fontSize: "12px", color: "var(--herbs-muted)" }}>{filtered.length}件</span>
      </div>

      {isLoading ? (
        <div className="text-center py-12" style={{ color: "var(--herbs-muted)" }}>読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: "var(--herbs-muted)" }}>データがありません</div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--herbs-light)", overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", background: "var(--herbs-white)" }}>
            <thead>
              <tr style={{ background: "var(--herbs-cream)", borderBottom: "1px solid var(--herbs-light)" }}>
                {["お名前", "体質タイプ", "外胚葉", "中胚葉", "内胚葉", "経路", "日時"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", fontSize: "11px", color: "var(--herbs-muted)", fontWeight: 600, textAlign: "left", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id}
                  onClick={() => setSelectedId(selectedId === s.id ? null : s.id)}
                  style={{
                    borderBottom: "1px solid var(--herbs-light)",
                    background: selectedId === s.id ? "var(--herbs-cream)" : i % 2 === 0 ? "var(--herbs-white)" : "#FDFAF8",
                    cursor: "pointer",
                  }}>
                  <td style={{ padding: "10px 12px", fontSize: "13px", color: "var(--herbs-green)", fontWeight: 500 }}>{s.clientName}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: "12px", color: TYPE_COLORS[s.primaryType as keyof typeof TYPE_COLORS] || "#888", fontWeight: 500 }}>
                      {TYPE_LABELS[s.primaryType as keyof typeof TYPE_LABELS] || "不明"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: "12px", color: "#C4604A" }}>{s.ectoScore}</td>
                  <td style={{ padding: "10px 12px", fontSize: "12px", color: "#3A6285" }}>{s.mesoScore}</td>
                  <td style={{ padding: "10px 12px", fontSize: "12px", color: "#9A4870" }}>{s.endoScore}</td>
                  <td style={{ padding: "10px 12px", fontSize: "12px", color: "var(--herbs-muted)" }}>
                    {CHANNEL_LABELS[s.accessChannel] || s.accessChannel}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: "11px", color: "var(--herbs-muted)" }}>
                    {new Date(s.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 詳細パネル */}
      {selected && (
        <div className="mt-4 rounded-2xl p-5" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: "15px", fontWeight: 500, color: "var(--herbs-green)" }}>{selected.clientName} 様の詳細</h3>
            <button onClick={() => setSelectedId(null)} style={{ background: "none", border: "none", color: "var(--herbs-muted)", cursor: "pointer", fontSize: "18px" }}>×</button>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Detail label="ふりがな" value={selected.clientKana} />
            <Detail label="生年月日" value={selected.clientDob} />
            <Detail label="ご職業" value={selected.clientJob} />
            <Detail label="電話（携帯）" value={selected.clientMobile} />
            <Detail label="来店動機" value={selected.visitReason} />
            <Detail label="アクセス経路" value={CHANNEL_LABELS[selected.accessChannel]} />
          </div>
          {selected.request && (
            <div className="mt-3 p-3 rounded-lg" style={{ background: "var(--herbs-cream)", fontSize: "12px", color: "var(--herbs-muted)" }}>
              <strong>ご要望：</strong>{selected.request}
            </div>
          )}
          {Array.isArray(selected.hairTroubles) && (selected.hairTroubles as string[]).length > 0 && (
            <div className="mt-3">
              <div style={{ fontSize: "11px", color: "var(--herbs-muted)", marginBottom: "6px" }}>髪・頭皮のトラブル</div>
              <div className="flex flex-wrap gap-1">
                {(selected.hairTroubles as string[]).map((t: string) => (
                  <span key={t} style={{ fontSize: "11px", padding: "3px 8px", background: "var(--herbs-cream)", borderRadius: "12px", color: "var(--herbs-green)" }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ fontSize: "11px", color: "var(--herbs-muted)", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "13px", color: "var(--herbs-green)" }}>{value}</div>
    </div>
  );
}

// ── 集計グラフ ────────────────────────────────────────────────────────────────
function StatsTab() {
  const { data: typeStats } = trpc.counseling.typeStats.useQuery({});
  const { data: channelStats } = trpc.counseling.channelStats.useQuery({});

  const total = typeStats?.total || 0;
  const typeBars = [
    { label: "外胚葉型", key: "ecto", color: "#C4604A", count: typeStats?.ecto || 0 },
    { label: "中胚葉型", key: "meso", color: "#3A6285", count: typeStats?.meso || 0 },
    { label: "内胚葉型", key: "endo", color: "#9A4870", count: typeStats?.endo || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* 体質タイプ別 */}
      <div className="rounded-2xl p-6" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 500, color: "var(--herbs-green)", marginBottom: "4px" }}>体質タイプ別 分布</h3>
        <p style={{ fontSize: "12px", color: "var(--herbs-muted)", marginBottom: "20px" }}>総件数: {total}件</p>
        {total === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--herbs-muted)", textAlign: "center", padding: "20px 0" }}>データがありません</p>
        ) : (
          <div className="space-y-4">
            {typeBars.map(bar => (
              <div key={bar.key}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: "13px", color: bar.color, fontWeight: 500 }}>{bar.label}</span>
                  <span style={{ fontSize: "12px", color: bar.color }}>
                    {bar.count}件 ({total > 0 ? Math.round((bar.count / total) * 100) : 0}%)
                  </span>
                </div>
                <div style={{ height: 14, background: "#F0EDE8", borderRadius: 7, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${total > 0 ? (bar.count / total) * 100 : 0}%`,
                    background: bar.color,
                    borderRadius: 7,
                    transition: "width 0.8s",
                    minWidth: bar.count > 0 ? "4px" : "0",
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* アクセス経路別 */}
      <div className="rounded-2xl p-6" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 500, color: "var(--herbs-green)", marginBottom: "20px" }}>アクセス経路別</h3>
        {!channelStats || channelStats.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--herbs-muted)", textAlign: "center", padding: "20px 0" }}>データがありません</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {channelStats.map(c => (
              <div key={c.accessChannel} className="rounded-xl p-4 text-center" style={{ background: "var(--herbs-cream)", border: "1px solid var(--herbs-light)" }}>
                <div style={{ fontSize: "24px", fontWeight: 300, color: "var(--herbs-green)", fontFamily: "'Cormorant Garamond', serif" }}>{Number(c.count)}</div>
                <div style={{ fontSize: "11px", color: "var(--herbs-muted)", marginTop: "4px" }}>
                  {CHANNEL_LABELS[c.accessChannel] || c.accessChannel}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── パスコード管理 ────────────────────────────────────────────────────────────
function PasscodesTab() {
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"general" | "partner" | "admin">("general");
  const [newLabel, setNewLabel] = useState("");
  const [newSalonId, setNewSalonId] = useState("");
  const [adding, setAdding] = useState(false);

  const { data: passcodes, refetch } = trpc.admin.listPasscodes.useQuery();
  const { data: salons } = trpc.admin.listSalons.useQuery();
  const createMutation = trpc.admin.createPasscode.useMutation();
  const deactivateMutation = trpc.admin.deactivatePasscode.useMutation();

  const handleCreate = async () => {
    if (!newCode.trim()) return;
    setAdding(true);
    try {
      await createMutation.mutateAsync({
        code: newCode.trim(),
        type: newType,
        label: newLabel || undefined,
        partnerSalonId: newType === "partner" && newSalonId ? parseInt(newSalonId) : undefined,
      });
      setNewCode(""); setNewLabel(""); setNewSalonId("");
      refetch();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "エラーが発生しました";
      alert(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("このパスコードを無効化しますか？")) return;
    await deactivateMutation.mutateAsync({ id });
    refetch();
  };

  const TYPE_BADGE = { general: { label: "一般", color: "#5A7A5A" }, partner: { label: "パートナー", color: "#3A6285" }, admin: { label: "管理者", color: "#9A4870" } };

  return (
    <div className="space-y-5">
      {/* 新規作成 */}
      <div className="rounded-2xl p-5" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 500, color: "var(--herbs-green)", marginBottom: "14px" }}>新規パスコード発行</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label style={{ fontSize: "11px", color: "var(--herbs-muted)", display: "block", marginBottom: "4px" }}>パスコード *</label>
            <input value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="例: t102"
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--herbs-light)", borderRadius: "8px", fontSize: "13px", background: "var(--herbs-cream)", outline: "none" }} />
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "var(--herbs-muted)", display: "block", marginBottom: "4px" }}>種別 *</label>
            <select value={newType} onChange={e => setNewType(e.target.value as typeof newType)}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--herbs-light)", borderRadius: "8px", fontSize: "13px", background: "var(--herbs-cream)", outline: "none" }}>
              <option value="general">一般</option>
              <option value="partner">パートナーサロン</option>
              <option value="admin">管理者</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "var(--herbs-muted)", display: "block", marginBottom: "4px" }}>ラベル（メモ）</label>
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="例: 神戸阪急店用"
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--herbs-light)", borderRadius: "8px", fontSize: "13px", background: "var(--herbs-cream)", outline: "none" }} />
          </div>
          {newType === "partner" && (
            <div>
              <label style={{ fontSize: "11px", color: "var(--herbs-muted)", display: "block", marginBottom: "4px" }}>紐付けサロン</label>
              <select value={newSalonId} onChange={e => setNewSalonId(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--herbs-light)", borderRadius: "8px", fontSize: "13px", background: "var(--herbs-cream)", outline: "none" }}>
                <option value="">選択してください</option>
                {salons?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <button onClick={handleCreate} disabled={adding || !newCode.trim()}
          style={{
            marginTop: "14px", padding: "10px 24px",
            background: adding || !newCode.trim() ? "var(--herbs-light)" : "var(--herbs-green)",
            color: adding || !newCode.trim() ? "var(--herbs-muted)" : "white",
            border: "none", borderRadius: "8px", fontSize: "13px", cursor: adding || !newCode.trim() ? "not-allowed" : "pointer",
          }}>
          {adding ? "発行中..." : "発行する"}
        </button>
      </div>

      {/* 一覧 */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--herbs-light)", overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 480, borderCollapse: "collapse", background: "var(--herbs-white)" }}>
          <thead>
            <tr style={{ background: "var(--herbs-cream)", borderBottom: "1px solid var(--herbs-light)" }}>
              {["パスコード", "種別", "ラベル", "状態", "操作"].map(h => (
                <th key={h} style={{ padding: "10px 12px", fontSize: "11px", color: "var(--herbs-muted)", fontWeight: 600, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {passcodes?.map((p, i) => {
              const badge = TYPE_BADGE[p.type as keyof typeof TYPE_BADGE];
              return (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--herbs-light)", background: i % 2 === 0 ? "var(--herbs-white)" : "#FDFAF8" }}>
                  <td style={{ padding: "10px 12px", fontSize: "14px", fontFamily: "'Cormorant Garamond', serif", color: "var(--herbs-green)", letterSpacing: "0.1em" }}>{p.code}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "12px", background: `${badge?.color}20`, color: badge?.color, fontWeight: 500 }}>
                      {badge?.label}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: "12px", color: "var(--herbs-muted)" }}>{p.label || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "12px", background: p.isActive ? "#E8F5E9" : "#F5E8E8", color: p.isActive ? "#2E7D32" : "#C62828" }}>
                      {p.isActive ? "有効" : "無効"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {p.isActive && (
                      <button onClick={() => handleDeactivate(p.id)}
                        style={{ fontSize: "11px", padding: "4px 10px", border: "1px solid #C47A5A", borderRadius: "6px", background: "none", color: "#C47A5A", cursor: "pointer" }}>
                        無効化
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── パートナーサロン管理 ──────────────────────────────────────────────────────
function SalonsTab() {
  const [newName, setNewName] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [adding, setAdding] = useState(false);

  const { data: salons, refetch } = trpc.admin.listSalons.useQuery();
  const createMutation = trpc.admin.createSalon.useMutation();

  const handleCreate = async () => {
    if (!newName.trim() || !newPasscode.trim()) return;
    setAdding(true);
    try {
      await createMutation.mutateAsync({ name: newName.trim(), passcode: newPasscode.trim() });
      setNewName(""); setNewPasscode("");
      refetch();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "エラーが発生しました";
      alert(msg);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 新規登録 */}
      <div className="rounded-2xl p-5" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 500, color: "var(--herbs-green)", marginBottom: "14px" }}>パートナーサロン登録</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label style={{ fontSize: "11px", color: "var(--herbs-muted)", display: "block", marginBottom: "4px" }}>サロン名 *</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="例: ○○ヘアサロン"
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--herbs-light)", borderRadius: "8px", fontSize: "13px", background: "var(--herbs-cream)", outline: "none" }} />
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "var(--herbs-muted)", display: "block", marginBottom: "4px" }}>パスコード *（h＋数字3桁推奨）</label>
            <input value={newPasscode} onChange={e => setNewPasscode(e.target.value)} placeholder="例: h102"
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--herbs-light)", borderRadius: "8px", fontSize: "13px", background: "var(--herbs-cream)", outline: "none" }} />
          </div>
        </div>
        <button onClick={handleCreate} disabled={adding || !newName.trim() || !newPasscode.trim()}
          style={{
            marginTop: "14px", padding: "10px 24px",
            background: adding || !newName.trim() || !newPasscode.trim() ? "var(--herbs-light)" : "var(--herbs-green)",
            color: adding || !newName.trim() || !newPasscode.trim() ? "var(--herbs-muted)" : "white",
            border: "none", borderRadius: "8px", fontSize: "13px", cursor: "pointer",
          }}>
          {adding ? "登録中..." : "登録する"}
        </button>
      </div>

      {/* 一覧 */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--herbs-light)", overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 400, borderCollapse: "collapse", background: "var(--herbs-white)" }}>
          <thead>
            <tr style={{ background: "var(--herbs-cream)", borderBottom: "1px solid var(--herbs-light)" }}>
              {["サロン名", "パスコード", "状態", "登録日"].map(h => (
                <th key={h} style={{ padding: "10px 12px", fontSize: "11px", color: "var(--herbs-muted)", fontWeight: 600, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {salons?.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: "1px solid var(--herbs-light)", background: i % 2 === 0 ? "var(--herbs-white)" : "#FDFAF8" }}>
                <td style={{ padding: "10px 12px", fontSize: "13px", color: "var(--herbs-green)", fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: "10px 12px", fontSize: "14px", fontFamily: "'Cormorant Garamond', serif", color: "#3A6285", letterSpacing: "0.1em" }}>{s.passcode}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "12px", background: s.isActive ? "#E8F5E9" : "#F5E8E8", color: s.isActive ? "#2E7D32" : "#C62828" }}>
                    {s.isActive ? "有効" : "無効"}
                  </span>
                </td>
                <td style={{ padding: "10px 12px", fontSize: "11px", color: "var(--herbs-muted)" }}>
                  {new Date(s.createdAt).toLocaleDateString("ja-JP")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
