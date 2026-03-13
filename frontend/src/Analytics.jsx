import { useEffect, useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, BarChart, Bar,
  Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { getSubjectRisk, getMetrics } from "./api";
import { SectionTitle, Spinner } from "./components";

const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#141420", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
      {label && <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "var(--text-primary)" }}>
          {p.name}: <strong>{typeof p.value === "number" ? p.value.toFixed ? p.value.toFixed(2) : p.value : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const COLORS = ["#4fffb0", "#ff4f6b", "#ffcc44", "#7c6fff", "#ff9f44", "#44cfff", "#ff44cf", "#cfff44"];

export default function Analytics() {
  const [subjectRisk, setSubjectRisk] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSubjectRisk(), getMetrics()])
      .then(([s, m]) => { setSubjectRisk(s); setMetrics(m); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!subjectRisk || !metrics) return <div style={{ color: "var(--danger)", padding: 20 }}>Failed to load analytics.</div>;

  // Radar data per subject
  const radarData = subjectRisk.map((s) => ({
    subject: s.subject,
    "Risk Rate": s.risk_rate,
    "Avg Score": s.avg_score,
    "Avg Attendance": s.avg_attendance,
    "Study Hours": s.avg_study_hours * 10,
  }));

  // Confusion matrix data
  const cm = metrics.confusion_matrix;
  const cmData = [
    { name: "True Negative", value: cm[0][0], fill: "var(--electric)" },
    { name: "False Positive", value: cm[0][1], fill: "#ffcc44" },
    { name: "False Negative", value: cm[1][0], fill: "#ff9f44" },
    { name: "True Positive", value: cm[1][1], fill: "var(--danger)" },
  ];

  // Classification report
  const cr = metrics.classification_report;
  const classData = ["0", "1"].map((c) => ({
    label: c === "0" ? "Low Risk" : "High Risk",
    precision: parseFloat((cr[c].precision * 100).toFixed(1)),
    recall: parseFloat((cr[c].recall * 100).toFixed(1)),
    f1: parseFloat((cr[c]["f1-score"] * 100).toFixed(1)),
  }));

  // Scatter: attendance vs mean_score (using subject aggregates as proxy)
  const scatter = subjectRisk.map((s) => ({
    x: s.avg_attendance,
    y: s.avg_score,
    z: s.risk_rate,
    name: s.subject,
  }));

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, margin: 0 }}>Analytics</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 6 }}>
          Deep-dive into subject-level performance, model evaluation, and risk patterns.
        </p>
      </div>

      {/* Row 1: Subject comparison bar + Radar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card animate-fade-up-1">
          <SectionTitle sub="Average score and risk rate per subject">Subject Comparison</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={subjectRisk} barSize={16}>
              <XAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CT />} />
              <Bar dataKey="avg_score" name="Avg Score" fill="var(--electric)" opacity={0.85} radius={[4, 4, 0, 0]} />
              <Bar dataKey="risk_rate" name="Risk Rate %" fill="var(--danger)" opacity={0.7} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card animate-fade-up-2">
          <SectionTitle sub="Multi-dimensional subject profile (radar)">Subject Radar</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Radar name="Risk Rate" dataKey="Risk Rate" stroke="var(--danger)" fill="var(--danger)" fillOpacity={0.15} />
              <Radar name="Avg Score" dataKey="Avg Score" stroke="var(--electric)" fill="var(--electric)" fillOpacity={0.1} />
              <Tooltip content={<CT />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Confusion matrix + classification report */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card animate-fade-up-3">
          <SectionTitle sub="Breakdown of predictions on the test set">Confusion Matrix</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {cmData.map((d) => (
              <div key={d.name} style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: 10, padding: "16px",
              }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{d.name}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 28, fontWeight: 700, color: d.fill }}>
                  {d.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
            Total test samples: {cmData.reduce((a, d) => a + d.value, 0).toLocaleString()}
          </div>
        </div>

        <div className="card animate-fade-up-4">
          <SectionTitle sub="Precision, Recall & F1 per class">Classification Report</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={classData} barSize={20}>
              <XAxis dataKey="label" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CT />} />
              <Bar dataKey="precision" name="Precision %" fill="var(--electric)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="recall" name="Recall %" fill="#7c6fff" radius={[3, 3, 0, 0]} />
              <Bar dataKey="f1" name="F1 %" fill="#ffcc44" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Attendance vs Score scatter + Study hours bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card animate-fade-up-4">
          <SectionTitle sub="Per-subject average: attendance vs mean score">Attendance vs Score</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <XAxis dataKey="x" name="Attendance %" type="number" domain={[60, 85]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Attendance %", fill: "var(--text-muted)", fontSize: 11, position: "insideBottom", offset: -5 }} />
              <YAxis dataKey="y" name="Mean Score" type="number" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div style={{ background: "#141420", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
                    <div>Attendance: {d.x.toFixed(1)}%</div>
                    <div>Avg Score: {d.y.toFixed(1)}</div>
                    <div style={{ color: d.z > 35 ? "var(--danger)" : "var(--electric)" }}>Risk Rate: {d.z}%</div>
                  </div>
                );
              }} />
              <Scatter data={scatter} fill="var(--electric)">
                {scatter.map((d, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="card animate-fade-up-5">
          <SectionTitle sub="Average daily study hours per subject">Study Hours by Subject</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectRisk} layout="vertical" barSize={16}>
              <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="subject" width={70} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CT />} />
              <Bar dataKey="avg_study_hours" name="Avg Study Hours" radius={[0, 4, 4, 0]}>
                {subjectRisk.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model metrics summary */}
      <div className="card animate-fade-up-5">
        <SectionTitle sub="Cross-validated model performance summary">Model Evaluation Summary</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {[
            ["Accuracy", `${(metrics.accuracy * 100).toFixed(2)}%`, "var(--electric)"],
            ["AUC-ROC", metrics.auc.toFixed(4), "#7c6fff"],
            ["CV Mean", `${(metrics.cv_mean * 100).toFixed(2)}%`, "#ffcc44"],
            ["CV Std", `±${(metrics.cv_std * 100).toFixed(2)}%`, "#ff9f44"],
            ["Precision (HR)", `${(cr["1"].precision * 100).toFixed(1)}%`, "var(--danger)"],
          ].map(([label, value, color]) => (
            <div key={label} style={{ textAlign: "center", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 22, color }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
