import { useEffect, useState } from "react";
import {
  Users, AlertTriangle, CheckCircle, BookOpen,
  TrendingUp, Clock, Activity,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, RadialBarChart, RadialBar,
} from "recharts";
import { getMetrics, getDistribution, getSubjectRisk } from "./api";
import { StatCard, SectionTitle, Skeleton, Spinner } from "./components";

const COLORS_BAR = ["#4fffb0", "#ff4f6b", "#ffcc44", "#7c6fff", "#ff9f44", "#44cfff"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#141420",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 13,
    }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: "flex", gap: 8 }}>
          <span>{p.name}:</span>
          <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [dist, setDist] = useState(null);
  const [subjectRisk, setSubjectRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMetrics(), getDistribution(), getSubjectRisk()])
      .then(([m, d, s]) => {
        setMetrics(m);
        setDist(d);
        setSubjectRisk(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!metrics) return (
    <div style={{ color: "var(--danger)", padding: 20 }}>
      ⚠ Could not load metrics. Make sure the backend is running and the model is trained.
    </div>
  );

  const riskPie = [
    { name: "High Risk", value: metrics.high_risk_count, fill: "var(--danger)" },
    { name: "Low Risk", value: metrics.low_risk_count, fill: "var(--electric)" },
  ];

  const radialData = [
    { name: "Accuracy", value: Math.round(metrics.accuracy * 100), fill: "var(--electric)" },
    { name: "AUC-ROC", value: Math.round(metrics.auc * 100), fill: "#7c6fff" },
    { name: "CV Score", value: Math.round(metrics.cv_mean * 100), fill: "#ffcc44" },
  ];

  const featureData = Object.entries(metrics.feature_importances)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ name: k.replace("_enc", "").replace("_", " "), value: parseFloat((v * 100).toFixed(1)) }));

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, margin: 0 }}>
          Overview
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 6 }}>
          XGBoost model trained on {metrics.total_records.toLocaleString()} records · {metrics.total_students.toLocaleString()} students
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Students" value={metrics.total_students.toLocaleString()} icon={Users} chipType="green" chip="12,000 unique" delay={0} />
        <StatCard label="High Risk" value={metrics.high_risk_count.toLocaleString()} icon={AlertTriangle} chipType="red" chip={`${(metrics.high_risk_count / metrics.total_records * 100).toFixed(1)}% of records`} delay={0.05} />
        <StatCard label="Model Accuracy" value={`${(metrics.accuracy * 100).toFixed(1)}%`} icon={Activity} chipType="green" chip={`AUC ${(metrics.auc).toFixed(3)}`} delay={0.1} />
        <StatCard label="Avg Attendance" value={`${metrics.avg_attendance}%`} icon={Clock} chipType="green" chip={`${metrics.avg_study_hours}h study avg`} delay={0.15} />
      </div>

      {/* Row 2: Score Distribution + Risk Pie */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, marginBottom: 16 }}>
        <div className="card animate-fade-up-2">
          <SectionTitle sub="High risk vs low risk students per score bracket">
            Score Distribution by Risk
          </SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dist} barSize={18}>
              <XAxis dataKey="range" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="low_risk" name="Low Risk" fill="var(--electric)" opacity={0.8} radius={[4, 4, 0, 0]} />
              <Bar dataKey="high_risk" name="High Risk" fill="var(--danger)" opacity={0.8} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card animate-fade-up-3">
          <SectionTitle sub="Risk label split across all records">Risk Breakdown</SectionTitle>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={riskPie} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                {riskPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {riskPie.map((d) => (
              <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: d.fill }} />
                  <span style={{ color: "var(--text-secondary)" }}>{d.name}</span>
                </div>
                <span style={{ fontFamily: "JetBrains Mono", color: "var(--text-primary)", fontWeight: 600 }}>
                  {d.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Feature Importance + Subject Risk */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card animate-fade-up-4">
          <SectionTitle sub="XGBoost feature importance scores (%)">Feature Importance</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={featureData} layout="vertical" barSize={14}>
              <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} width={100} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Importance %" radius={[0, 4, 4, 0]}>
                {featureData.map((_, i) => <Cell key={i} fill={COLORS_BAR[i % COLORS_BAR.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card animate-fade-up-5">
          <SectionTitle sub="Risk rate per subject (%)">Risk Rate by Subject</SectionTitle>
          {subjectRisk && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
              {subjectRisk.sort((a, b) => b.risk_rate - a.risk_rate).map((s, i) => (
                <div key={s.subject}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                    <span style={{ color: "var(--text-secondary)" }}>{s.subject}</span>
                    <span style={{ fontFamily: "JetBrains Mono", color: s.risk_rate > 35 ? "var(--danger)" : "var(--electric)", fontWeight: 600 }}>
                      {s.risk_rate}%
                    </span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                    <div style={{
                      width: `${s.risk_rate}%`,
                      height: "100%",
                      borderRadius: 99,
                      background: s.risk_rate > 35 ? "var(--danger)" : "var(--electric)",
                      transition: "width 1s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ROC Curve */}
      <div className="card animate-fade-up-5">
        <SectionTitle sub={`AUC = ${metrics.auc.toFixed(4)} · 5-fold CV = ${(metrics.cv_mean * 100).toFixed(2)}% ± ${(metrics.cv_std * 100).toFixed(2)}%`}>
          Model Performance · ROC Curve
        </SectionTitle>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={metrics.roc_curve.fpr.map((f, i) => ({ fpr: parseFloat(f.toFixed(3)), tpr: parseFloat(metrics.roc_curve.tpr[i].toFixed(3)) }))}>
            <defs>
              <linearGradient id="rocGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--electric)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--electric)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="fpr" tick={{ fill: "var(--text-muted)", fontSize: 11 }} label={{ value: "FPR", fill: "var(--text-muted)", fontSize: 11, position: "insideBottomRight", offset: 0 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} label={{ value: "TPR", fill: "var(--text-muted)", fontSize: 11, angle: -90, position: "insideLeft" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="tpr" name="TPR" stroke="var(--electric)" strokeWidth={2} fill="url(#rocGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
