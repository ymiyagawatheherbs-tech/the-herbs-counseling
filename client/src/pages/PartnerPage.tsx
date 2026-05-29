import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/contexts/SessionContext";
import type { CounselingSession } from "../../../drizzle/schema";

const TYPE_LABELS = { ecto: "外胚葉型", meso: "中胚葉型", endo: "内胚葉型", unknown: "不明" };
const TYPE_COLORS = { ecto: "#C4604A", meso: "#3A6285", endo: "#9A4870", unknown: "#888" };
const CHANNEL_LABELS: Record<string, string> = { store: "店頭", sns: "SNS", line: "LINE", web: "Web", other: "その他" };

export default function PartnerPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const { session, clearSession } = useSession();

  if (!session || session.type !== "partner") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--herbs-page-bg)" }}>
        <div className="text-center">
          <p style={{ color: "var(--herbs-muted)", marginBottom: "16px" }}>パートナーサロンの権限が必要です</p>
          <button onClick={() => navigate("/")} style={{ padding: "10px 24px", background: "var(--herbs-green)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            トップへ戻る
          </button>
        </div>
      </div>
    );
  }

  const { data: sessions, isLoading } = trpc.counseling.listByPartner.useQuery({
    partnerSalonId: session.partnerSalonId!,
    limit: 200,
  });

  const filtered: CounselingSession[] = sessions?.filter((s: CounselingSession) =>
    s.clientName.includes(search) ||
    TYPE_LABELS[s.primaryType as keyof typeof TYPE_LABELS]?.includes(search)
  ) ?? [];

  const selected = selectedId ? sessions?.find((s: CounselingSession) => s.id === selectedId) : null;

  const typeCounts = { ecto: 0, meso: 0, endo: 0 };
  sessions?.forEach((s: CounselingSession) => {
    if (s.primaryType in typeCounts) typeCounts[s.primaryType as keyof typeof typeCounts]++;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--herbs-page-bg)" }}>
      {/* ヘッダー */}
      <header style={{ background: "var(--herbs-green)", padding: "14px 20px" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "var(--herbs-gold)", fontFamily: "'Cormorant Garamond', serif" }}>THE HERBS</div>
            <h1 style={{ fontSize: "15px", fontWeight: 400, color: "white", letterSpacing: "0.05em" }}>
              {session.salonName || "パートナーサロン"} 専用画面
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/types`)}
              style={{ fontSize: "12px", color: "white", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "6px", padding: "6px 12px", cursor: "pointer" }}>
              カウンセリングを始める
            </button>
            <button onClick={() => { clearSession(); navigate("/"); }}
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", background: "none", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "6px", padding: "6px 12px", cursor: "pointer" }}>
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* サマリーカード */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
          <SummaryCard label="総件数" value={sessions?.length || 0} color="var(--herbs-green)" />
          <SummaryCard label="外胚葉型" value={typeCounts.ecto} color="#C4604A" />
          <SummaryCard label="中胚葉型" value={typeCounts.meso} color="#3A6285" />
          <SummaryCard label="内胚葉型" value={typeCounts.endo} color="#9A4870" />
        </div>

        {/* 検索 */}
        <div className="flex items-center gap-3 mb-4">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="名前・体質タイプで検索..."
            style={{ flex: 1, padding: "10px 14px", border: "1.5px solid var(--herbs-light)", borderRadius: "8px", background: "var(--herbs-white)", fontSize: "13px", outline: "none" }} />
          <span style={{ fontSize: "12px", color: "var(--herbs-muted)" }}>{filtered.length}件</span>
        </div>

        {/* データ一覧 */}
        {isLoading ? (
          <div className="text-center py-12" style={{ color: "var(--herbs-muted)" }}>読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
            <p style={{ color: "var(--herbs-muted)", fontSize: "13px", marginBottom: "16px" }}>
              まだカウンセリングデータがありません
            </p>
            <button onClick={() => navigate("/types")}
              style={{ padding: "12px 28px", background: "var(--herbs-green)", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>
              カウンセリングを始める
            </button>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--herbs-light)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--herbs-white)" }}>
              <thead>
                <tr style={{ background: "var(--herbs-cream)", borderBottom: "1px solid var(--herbs-light)" }}>
                  {["お名前", "体質タイプ", "外胚葉", "中胚葉", "内胚葉", "経路", "日時"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", fontSize: "11px", color: "var(--herbs-muted)", fontWeight: 600, textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s: CounselingSession, i: number) => (
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
            <div className="grid grid-cols-2 gap-3">
              {selected.clientKana && <Detail label="ふりがな" value={selected.clientKana} />}
              {selected.clientDob && <Detail label="生年月日" value={selected.clientDob} />}
              {selected.clientJob && <Detail label="ご職業" value={selected.clientJob} />}
              {selected.visitReason && <Detail label="来店動機" value={selected.visitReason} />}
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
      </main>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ background: "var(--herbs-white)", border: "1px solid var(--herbs-light)" }}>
      <div style={{ fontSize: "28px", fontWeight: 300, color, fontFamily: "'Cormorant Garamond', serif" }}>{value}</div>
      <div style={{ fontSize: "11px", color: "var(--herbs-muted)", marginTop: "4px" }}>{label}</div>
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
