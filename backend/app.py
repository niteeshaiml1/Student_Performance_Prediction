"""
Student Performance Prediction - Flask REST API
Run: python app.py
"""

import json
import os
import pickle
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "https://student-performance-prediction-alpha.vercel.app"
])
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "../models/model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "../models/label_encoder.pkl")
METRICS_PATH = os.path.join(BASE_DIR, "../models/metrics.json")
FEATURES_PATH = os.path.join(BASE_DIR, "../models/feature_names.json")
DATA_PATH = os.path.join(BASE_DIR, "../data/final.csv")

# ── Load artifacts ──────────────────────────────────────────────────────────
def load_artifacts():
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(ENCODER_PATH, "rb") as f:
        le = pickle.load(f)
    with open(METRICS_PATH) as f:
        metrics = json.load(f)
    with open(FEATURES_PATH) as f:
        feature_names = json.load(f)["features"]
    return model, le, metrics, feature_names

try:
    model, label_encoder, metrics_data, FEATURE_NAMES = load_artifacts()
    print("✅ Model artifacts loaded.")
except FileNotFoundError:
    print("⚠️  Models not found. Run train_model.py first.")
    model = label_encoder = metrics_data = FEATURE_NAMES = None


# ── Routes ────────────────────────────────────────────────────────────────

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})


@app.route("/api/metrics")
def get_metrics():
    if not metrics_data:
        return jsonify({"error": "Model not trained yet"}), 503
    return jsonify(metrics_data)


@app.route("/api/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not trained yet"}), 503

    data = request.get_json()
    required = ["mean_score", "min_score", "max_score", "test_count",
                "attendance_pct", "study_hours", "trend", "subject"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    subject_enc = label_encoder.transform([data["subject"]])[0]
    features = np.array([[
        float(data["mean_score"]),
        float(data["min_score"]),
        float(data["max_score"]),
        int(data["test_count"]),
        float(data["attendance_pct"]),
        float(data["study_hours"]),
        int(data["trend"]),
        int(subject_enc),
    ]])

    pred = int(model.predict(features)[0])
    prob = float(model.predict_proba(features)[0][1])

    risk_label = "High Risk" if pred == 1 else "Low Risk"
    risk_score = round(prob * 100, 1)

    # Generate insights
    insights = []
    if data["attendance_pct"] < 65:
        insights.append({"type": "warning", "msg": "Attendance is critically low (< 65%)."})
    elif data["attendance_pct"] < 75:
        insights.append({"type": "caution", "msg": "Attendance below 75% — improvement needed."})
    if data["mean_score"] < 45:
        insights.append({"type": "warning", "msg": "Mean score is very low (< 45)."})
    if data["study_hours"] < 1.5:
        insights.append({"type": "caution", "msg": "Study hours are low — encourage more time."})
    if data["trend"] < -10:
        insights.append({"type": "warning", "msg": "Score trend is declining sharply."})
    elif data["trend"] > 10:
        insights.append({"type": "success", "msg": "Strong upward score trend detected."})
    if not insights:
        insights.append({"type": "success", "msg": "Student profile looks healthy."})

    return jsonify({
        "prediction": pred,
        "risk_label": risk_label,
        "risk_score": risk_score,
        "probability": round(prob, 4),
        "insights": insights,
    })


@app.route("/api/students")
def get_students():
    """Return paginated student data with predictions."""
    if model is None:
        return jsonify({"error": "Model not trained yet"}), 503

    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 50))
    subject_filter = request.args.get("subject", None)
    risk_filter = request.args.get("risk", None)

    df = pd.read_csv(DATA_PATH)

    if subject_filter and subject_filter != "All":
        df = df[df["subject"] == subject_filter]
    if risk_filter == "high":
        df = df[df["label"] == 1]
    elif risk_filter == "low":
        df = df[df["label"] == 0]

    total = len(df)
    df_page = df.iloc[(page - 1) * per_page: page * per_page].copy()

    records = df_page.to_dict(orient="records")
    for r in records:
        r["risk_label"] = "High Risk" if r["label"] == 1 else "Low Risk"

    return jsonify({
        "students": records,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
    })


@app.route("/api/subjects")
def get_subjects():
    df = pd.read_csv(DATA_PATH)
    return jsonify({"subjects": sorted(df["subject"].unique().tolist())})


@app.route("/api/analytics/distribution")
def distribution():
    df = pd.read_csv(DATA_PATH)
    bins = [0, 30, 40, 50, 60, 70, 80, 90, 100]
    labels = ["<30", "30-40", "40-50", "50-60", "60-70", "70-80", "80-90", "90+"]
    df["score_bin"] = pd.cut(df["mean_score"], bins=bins, labels=labels)
    dist = df.groupby(["score_bin", "label"]).size().unstack(fill_value=0).reset_index()
    dist.columns = ["range", "low_risk", "high_risk"]
    return jsonify(dist.to_dict(orient="records"))


@app.route("/api/analytics/subject_risk")
def subject_risk():
    df = pd.read_csv(DATA_PATH)
    result = df.groupby("subject").agg(
        total=("label", "count"),
        high_risk=("label", "sum"),
        avg_score=("mean_score", "mean"),
        avg_attendance=("attendance_pct", "mean"),
        avg_study_hours=("study_hours", "mean"),
    ).reset_index()
    result["risk_rate"] = (result["high_risk"] / result["total"] * 100).round(1)
    result["avg_score"] = result["avg_score"].round(1)
    result["avg_attendance"] = result["avg_attendance"].round(1)
    result["avg_study_hours"] = result["avg_study_hours"].round(2)
    return jsonify(result.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
