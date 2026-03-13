// ─── Reusable UI primitives ───────────────────────────────────────────────

export function StatCard({ label, value, sub, chip, chipType = "green", icon: Icon, delay = 0, large }) {
  return (
    <div className="card animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
            {label}
          </div>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: large ? 36 : 28, color: "var(--text-primary)", lineHeight: 1 }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>{sub}</div>}
          {chip && (
            <div style={{ marginTop: 10 }}>
              <span className={`stat-chip chip-${chipType}`}>{chip}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div style={{
            width: 40, height: 40,
            background: chipType === "red" ? "var(--danger-glow)" : "var(--electric-glow)",
            border: `1px solid ${chipType === "red" ? "rgba(255,79,107,0.2)" : "rgba(79,255,176,0.2)"}`,
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={18} color={chipType === "red" ? "var(--danger)" : "var(--electric)"} />
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, margin: 0, color: "var(--text-primary)" }}>
        {children}
      </h2>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>{sub}</p>}
    </div>
  );
}

export function Skeleton({ h = 24, w = "100%", style = {} }) {
  return <div className="skeleton" style={{ height: h, width: w, ...style }} />;
}

export function Badge({ children, type = "green" }) {
  const map = { green: "chip-green", red: "chip-red", amber: "chip-amber", gray: "chip-gray" };
  return <span className={`stat-chip ${map[type]}`}>{children}</span>;
}

export function EmptyState({ msg = "No data available" }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", fontSize: 14 }}>
      {msg}
    </div>
  );
}

export function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
      <div style={{
        width: 32, height: 32,
        border: "2px solid rgba(255,255,255,0.1)",
        borderTopColor: "var(--electric)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function InsightBadge({ type, msg }) {
  const colors = {
    warning: { bg: "var(--danger-glow)", color: "var(--danger)", border: "rgba(255,79,107,0.2)" },
    caution: { bg: "rgba(255,204,68,0.1)", color: "var(--amber)", border: "rgba(255,204,68,0.2)" },
    success: { bg: "var(--electric-glow)", color: "var(--electric)", border: "rgba(79,255,176,0.2)" },
  };
  const c = colors[type] || colors.success;
  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.color,
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 13,
      display: "flex",
      gap: 8,
      alignItems: "flex-start",
    }}>
      <span>{type === "warning" ? "⚠" : type === "caution" ? "●" : "✓"}</span>
      <span>{msg}</span>
    </div>
  );
}
