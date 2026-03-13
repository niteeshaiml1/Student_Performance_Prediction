"""
Student Performance Prediction - Model Training Script
Run this once to train and save the XGBoost model.
"""

import pandas as pd
import numpy as np
import json
import pickle
import os
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, classification_report,
    confusion_matrix, roc_auc_score, roc_curve
)
from xgboost import XGBClassifier

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/final.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/model.pkl")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "../models/label_encoder.pkl")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "../models/metrics.json")
FEATURES_PATH = os.path.join(os.path.dirname(__file__), "../models/feature_names.json")

def train():
    print("📂 Loading data...")
    df = pd.read_csv(DATA_PATH)
    print(f"   Shape: {df.shape}")

    # Encode subject
    le = LabelEncoder()
    df["subject_enc"] = le.fit_transform(df["subject"])

    feature_cols = ["mean_score", "min_score", "max_score", "test_count",
                    "attendance_pct", "study_hours", "trend", "subject_enc"]
    X = df[feature_cols]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("🤖 Training XGBoost model...")
    model = XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42,
        use_label_encoder=False,
    )
    model.fit(X_train, y_train,
              eval_set=[(X_test, y_test)],
              verbose=False)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    report = classification_report(y_test, y_pred, output_dict=True)
    cm = confusion_matrix(y_test, y_pred).tolist()

    fpr, tpr, _ = roc_curve(y_test, y_prob)
    cv_scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")

    # Feature importance
    importances = dict(zip(feature_cols, model.feature_importances_.tolist()))

    # Subject distribution in data
    subject_counts = df["subject"].value_counts().to_dict()
    risk_by_subject = df.groupby("subject")["label"].mean().round(3).to_dict()

    metrics = {
        "accuracy": round(acc, 4),
        "auc": round(auc, 4),
        "cv_mean": round(cv_scores.mean(), 4),
        "cv_std": round(cv_scores.std(), 4),
        "confusion_matrix": cm,
        "classification_report": report,
        "feature_importances": importances,
        "roc_curve": {
            "fpr": fpr[::10].tolist(),
            "tpr": tpr[::10].tolist()
        },
        "subject_counts": subject_counts,
        "risk_by_subject": risk_by_subject,
        "label_classes": le.classes_.tolist(),
        "total_students": int(df["student_id"].nunique()),
        "total_records": len(df),
        "high_risk_count": int(y.sum()),
        "low_risk_count": int((y == 0).sum()),
        "avg_attendance": round(df["attendance_pct"].mean(), 2),
        "avg_score": round(df["mean_score"].mean(), 2),
        "avg_study_hours": round(df["study_hours"].mean(), 2),
    }

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(ENCODER_PATH, "wb") as f:
        pickle.dump(le, f)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    with open(FEATURES_PATH, "w") as f:
        json.dump({"features": feature_cols}, f)

    print(f"\n✅ Model trained successfully!")
    print(f"   Accuracy : {acc:.4f}")
    print(f"   AUC-ROC  : {auc:.4f}")
    print(f"   CV Mean  : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    print(f"\n📦 Saved: model.pkl, label_encoder.pkl, metrics.json")

if __name__ == "__main__":
    train()
