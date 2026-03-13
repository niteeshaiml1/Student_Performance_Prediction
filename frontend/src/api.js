import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "https://student-performance-prediction-1845.onrender.com/api";
const api = axios.create({ baseURL: BASE });

export const getMetrics = () => api.get("/metrics").then((r) => r.data);
export const predictRisk = (data) => api.post("/predict", data).then((r) => r.data);
export const getStudents = (params) => api.get("/students", { params }).then((r) => r.data);
export const getSubjects = () => api.get("/subjects").then((r) => r.data);
export const getDistribution = () => api.get("/analytics/distribution").then((r) => r.data);
export const getSubjectRisk = () => api.get("/analytics/subject_risk").then((r) => r.data);
export const checkHealth = () => api.get("/health").then((r) => r.data);