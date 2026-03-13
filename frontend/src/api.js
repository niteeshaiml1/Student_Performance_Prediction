import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/api" });
export const getMetrics = () => api.get("/metrics").then((r) => r.data);
export const predictRisk = (data) => api.post("/predict", data).then((r) => r.data);
export const getStudents = (params) => api.get("/students", { params }).then((r) => r.data);
export const getSubjects = () => api.get("/subjects").then((r) => r.data);
export const getDistribution = () => api.get("/analytics/distribution").then((r) => r.data);
export const getSubjectRisk = () => api.get("/analytics/subject_risk").then((r) => r.data);
export const checkHealth = () => api.get("/health").then((r) => r.data);
