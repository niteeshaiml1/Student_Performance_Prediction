import { useEffect, useState } from "react";
import { Brain, Send, RotateCcw, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { predictRisk, getSubjects } from "./api";
import { InsightBadge, SectionTitle } from "./components";

const DEFAULT = {
  subject: "Math",
  mean_score: 52,
  min_score: 35,
  max_score: 68,
  test_count: 4,
  attendance_pct: 74,
  study_hours: 2.5,
  trend: 0,
};

const Field = ({ label, name, type = "number", min, max, step = 1, value, onChange, options }) => (
  <div>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
      {label}
    </label>
    {options ? (
      <select className="form-input" name={name} value={value} onChange={onChange} style={{ appearance: "none" }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input
        className="form-input"
        type={type}
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    )}
  </div>
);

export default function Predict() {
  const [form, setForm] = useState(DEFAULT);
  const [subjects, setSubjects] = useState(["Math", "English", "Physics", "Chemistry", "Biology", "History"]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSubjects().then((d) => setSubjects(d.subjects)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "subject" ? value : Number(value) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await predictRisk(form);
      setResult(res);
    } catch (e) {
      setError("Prediction failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const isHighRisk = result?.prediction === 1;

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, margin: 0 }}>
          Predict Student Risk
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 6 }}>
          Enter a student's academic profile to get an XGBoost risk prediction in real-time.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 24, alignItems: "start" }}>
        {/* Form */}
        <div className="card animate-fade-up-1">
          <SectionTitle sub="Fill in the academic indicators below">Student Profile</SectionTitle>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Subject" name="subject" options={subjects} value={form.subject} onChange={handleChange} />
            </div>
            <Field label="Mean Score" name="mean_score" min={0} max={100} step={0.5} value={form.mean_score} onChange={handleChange} />
            <Field label="Min Score" name="min_score" min={0} max={100} value={form.min_score} onChange={handleChange} />
            <Field label="Max Score" name="max_score" min={0} max={100} value={form.max_score} onChange={handleChange} />
            <Field label="Test Count" name="test_count" min={1} max={10} value={form.test_count} onChange={handleChange} />
            <Field label="Attendance %" name="attendance_pct" min={0} max={100} step={0.1} value={form.attendance_pct} onChange={handleChange} />
            <Field label="Study Hours / Day" name="study_hours" min={0} max={10} step={0.1} value={form.study_hours} onChange={handleChange} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Score Trend (last – first)" name="trend" min={-30} max={30} value={form.trend} onChange={handleChange} />
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                Negative = declining · Positive = improving
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 1 }}>
              {loading ? (
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  Predicting…
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </span>
              ) : (
                <><Send size={15} /> Run Prediction</>
              )}
            </button>
            <button className="btn-ghost" onClick={() => { setForm(DEFAULT); setResult(null); setError(null); }}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
          {error && <div style={{ marginTop: 14, color: "var(--danger)", fontSize: 13 }}>{error}</div>}
        </div>

        {/* Result Panel */}
        <div>
          {!result && (
            <div className="card" style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              minHeight: 300, color: "var(--text-muted)", gap: 14, textAlign: "center",
            }}>
              <Brain size={40} strokeWidth={1} color="rgba(255,255,255,0.1)" />
              <div style={{ fontSize: 14 }}>Fill in the form and click<br /><strong style={{ color: "var(--text-secondary)" }}>Run Prediction</strong></div>
            </div>
          )}

          {result && (
            <div className={`card animate-fade-up ${isHighRisk ? "glow-red" : "glow-green"}`} style={{
              border: `1px solid ${isHighRisk ? "rgba(255,79,107,0.3)" : "rgba(79,255,176,0.3)"}`,
            }}>
              {/* Risk Badge */}
              <div style={{ textAlign: "center", padding: "20px 0 24px" }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%", margin: "0 auto 16px",
                  background: isHighRisk ? "var(--danger-glow)" : "var(--electric-glow)",
                  border: `2px solid ${isHighRisk ? "var(--danger)" : "var(--electric)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  animation: "pulse-ring 2s ease-in-out infinite",
                }}>
                  {isHighRisk
                    ? <AlertTriangle size={32} color="var(--danger)" />
                    : <CheckCircle size={32} color="var(--electric)" />
                  }
                </div>
                <div style={{
                  fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26,
                  color: isHighRisk ? "var(--danger)" : "var(--electric)",
                }}>
                  {result.risk_label}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
                  Risk Probability
                </div>

                {/* Probability bar */}
                <div style={{ margin: "16px 0", position: "relative" }}>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                    <div style={{
                      width: `${result.risk_score}%`,
                      height: "100%",
                      borderRadius: 99,
                      background: isHighRisk
                        ? `linear-gradient(90deg, #ff9f44, var(--danger))`
                        : `linear-gradient(90deg, var(--electric-dim), var(--electric))`,
                      transition: "width 1s ease",
                    }} />
                  </div>
                  <div style={{
                    position: "absolute", top: -24, left: `${Math.min(result.risk_score, 90)}%`,
                    transform: "translateX(-50%)",
                    fontFamily: "JetBrains Mono", fontSize: 12,
                    color: isHighRisk ? "var(--danger)" : "var(--electric)",
                    fontWeight: 700,
                  }}>
                    {result.risk_score}%
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  ["Subject", form.subject],
                  ["Mean Score", form.mean_score],
                  ["Attendance", `${form.attendance_pct}%`],
                  ["Study Hours", `${form.study_hours}h`],
                  ["Trend", form.trend > 0 ? `+${form.trend}` : form.trend],
                  ["Tests", form.test_count],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Insights */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                  Insights
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.insights.map((ins, i) => (
                    <InsightBadge key={i} type={ins.type} msg={ins.msg} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
