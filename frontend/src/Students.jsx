import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { getStudents, getSubjects } from "./api";
import { Badge, Spinner, SectionTitle } from "./components";

export default function Students() {
  const [data, setData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("all");
  const PER_PAGE = 50;

  const fetchData = (pg = 1, subj = subjectFilter, risk = riskFilter) => {
    setLoading(true);
    const params = { page: pg, per_page: PER_PAGE };
    if (subj !== "All") params.subject = subj;
    if (risk !== "all") params.risk = risk;
    getStudents(params)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getSubjects().then((d) => setSubjects(["All", ...d.subjects])).catch(() => {});
    fetchData(1);
  }, []);

  const handleSubject = (v) => { setSubjectFilter(v); setPage(1); fetchData(1, v, riskFilter); };
  const handleRisk = (v) => { setRiskFilter(v); setPage(1); fetchData(1, subjectFilter, v); };
  const handlePage = (p) => { setPage(p); fetchData(p); };

  const scoreColor = (s) => s >= 70 ? "var(--electric)" : s >= 50 ? "var(--amber)" : "var(--danger)";

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, margin: 0 }}>Students</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 6 }}>
          Browse and filter all student records with predicted risk labels.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Filter size={14} color="var(--text-muted)" />
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Subject:</span>
        </div>
        {subjects.map((s) => (
          <button key={s} onClick={() => handleSubject(s)} className={subjectFilter === s ? "btn-primary" : "btn-ghost"}
            style={{ padding: "6px 14px", fontSize: 12 }}>
            {s}
          </button>
        ))}
        <div style={{ marginLeft: 8, display: "flex", gap: 8 }}>
          {[["all", "All Risk"], ["high", "High Risk"], ["low", "Low Risk"]].map(([v, l]) => (
            <button key={v} onClick={() => handleRisk(v)} className={riskFilter === v ? "btn-primary" : "btn-ghost"}
              style={{ padding: "6px 14px", fontSize: 12 }}>
              {l}
            </button>
          ))}
        </div>
        {data && (
          <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-secondary)", fontFamily: "JetBrains Mono" }}>
            {data.total.toLocaleString()} records
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? <Spinner /> : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Subject</th>
                  <th>Mean Score</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Tests</th>
                  <th>Attendance %</th>
                  <th>Study Hrs</th>
                  <th>Trend</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {data?.students.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: "JetBrains Mono", color: "var(--text-primary)" }}>
                      #{s.student_id}
                    </td>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{s.subject}</td>
                    <td style={{ fontFamily: "JetBrains Mono", color: scoreColor(s.mean_score), fontWeight: 600 }}>
                      {typeof s.mean_score === "number" ? s.mean_score.toFixed(1) : s.mean_score}
                    </td>
                    <td style={{ fontFamily: "JetBrains Mono" }}>{s.min_score}</td>
                    <td style={{ fontFamily: "JetBrains Mono" }}>{s.max_score}</td>
                    <td>{s.test_count}</td>
                    <td style={{ fontFamily: "JetBrains Mono", color: s.attendance_pct < 65 ? "var(--danger)" : "inherit" }}>
                      {typeof s.attendance_pct === "number" ? s.attendance_pct.toFixed(1) : s.attendance_pct}%
                    </td>
                    <td>{typeof s.study_hours === "number" ? s.study_hours.toFixed(1) : s.study_hours}h</td>
                    <td style={{ fontFamily: "JetBrains Mono", color: s.trend > 0 ? "var(--electric)" : s.trend < 0 ? "var(--danger)" : "var(--text-muted)" }}>
                      {s.trend > 0 ? `+${s.trend}` : s.trend}
                    </td>
                    <td>
                      <Badge type={s.label === 1 ? "red" : "green"}>
                        {s.risk_label}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 }}>
          <button className="btn-ghost" onClick={() => handlePage(page - 1)} disabled={page === 1}>
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(7, data.pages) }, (_, i) => {
            const pg = page <= 4 ? i + 1 : page - 3 + i;
            if (pg < 1 || pg > data.pages) return null;
            return (
              <button key={pg} onClick={() => handlePage(pg)} className={page === pg ? "btn-primary" : "btn-ghost"}
                style={{ padding: "6px 12px", minWidth: 36, fontSize: 13, fontFamily: "JetBrains Mono" }}>
                {pg}
              </button>
            );
          })}
          <button className="btn-ghost" onClick={() => handlePage(page + 1)} disabled={page === data.pages}>
            <ChevronRight size={14} />
          </button>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "JetBrains Mono", marginLeft: 8 }}>
            Page {page} / {data.pages}
          </span>
        </div>
      )}
    </div>
  );
}
