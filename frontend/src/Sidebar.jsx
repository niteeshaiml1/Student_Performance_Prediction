import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Brain, Users, BarChart3, Activity, GraduationCap,
} from "lucide-react";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/predict", icon: Brain, label: "Predict Risk" },
  { to: "/students", icon: Users, label: "Students" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        background: "rgba(255,255,255,0.02)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 14px",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "8px 10px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: "var(--electric-glow)",
              border: "1px solid rgba(79,255,176,0.3)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GraduationCap size={18} color="var(--electric)" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 15,
                color: "var(--text-primary)",
                lineHeight: 1,
              }}
            >
              EduPredict
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
              AI · Student Risk
            </div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {NAV.map(({ to, icon: Icon, label }) => {
          const active =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`nav-link${active ? " active" : ""}`}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "14px 10px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          fontSize: 11,
          color: "var(--text-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Activity size={12} color="var(--electric)" />
          <span>XGBoost · 36k records</span>
        </div>
        <div style={{ marginTop: 4, fontFamily: "JetBrains Mono, monospace" }}>
          v1.0.0
        </div>
      </div>
    </aside>
  );
}
