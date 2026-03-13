# 🎓 EduPredict — Student Performance Risk Prediction

A full-stack AI-powered web app that predicts student academic risk using an **XGBoost classifier** trained on 36,000 student-subject records. Built for VS Code with a **Flask REST API** backend and a **React + Vite** frontend dashboard.

---

## 📁 Project Structure

```
student-performance/
├── backend/
│   ├── app.py              # Flask REST API (7 endpoints)
│   ├── train_model.py      # XGBoost training script
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Router shell
│   │   ├── Sidebar.jsx     # Navigation sidebar
│   │   ├── Dashboard.jsx   # Overview + KPIs + charts
│   │   ├── Predict.jsx     # Live prediction form
│   │   ├── Students.jsx    # Paginated student table
│   │   ├── Analytics.jsx   # Deep-dive analytics
│   │   ├── components.jsx  # Reusable UI components
│   │   ├── api.js          # Axios service layer
│   │   └── index.css       # Design system / global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── data/
│   └── final.csv           # Source dataset (36k records)
├── models/                 # Generated after training
│   ├── model.pkl
│   ├── label_encoder.pkl
│   ├── metrics.json
│   └── feature_names.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+

---

### Step 1 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train the XGBoost model (run once)
python train_model.py

# Start the Flask API
python app.py
```

The API will be available at `http://localhost:5000`

---

### Step 2 — Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check + model status |
| GET | `/api/metrics` | Model metrics, ROC, feature importance |
| POST | `/api/predict` | Predict risk for a single student |
| GET | `/api/students` | Paginated student records |
| GET | `/api/subjects` | List of all subjects |
| GET | `/api/analytics/distribution` | Score distribution by risk |
| GET | `/api/analytics/subject_risk` | Risk stats per subject |

### Predict Payload Example

```json
POST /api/predict
{
  "subject": "Math",
  "mean_score": 42.5,
  "min_score": 28,
  "max_score": 55,
  "test_count": 4,
  "attendance_pct": 68.0,
  "study_hours": 1.8,
  "trend": -5
}
```

### Response
```json
{
  "prediction": 1,
  "risk_label": "High Risk",
  "risk_score": 78.4,
  "probability": 0.7841,
  "insights": [
    { "type": "warning", "msg": "Attendance is critically low (< 65%)." },
    { "type": "warning", "msg": "Mean score is very low (< 45)." }
  ]
}
```

---

## 📊 Model Details

| Property | Value |
|----------|-------|
| Algorithm | XGBoost Classifier |
| Features | mean_score, min_score, max_score, test_count, attendance_pct, study_hours, trend, subject |
| Target | label (0 = Low Risk, 1 = High Risk) |
| Train/Test Split | 80/20 stratified |
| Cross-Validation | 5-fold |
| Training Records | 36,000 |
| Unique Students | 12,000 |

---

## 🖥️ Pages

- **Dashboard** — KPI cards, score distribution, risk breakdown pie, feature importance, ROC curve, subject risk bars
- **Predict Risk** — Live form with real-time XGBoost prediction + insight generation
- **Students** — Paginated + filterable table of all student records
- **Analytics** — Radar chart, confusion matrix, classification report, scatter plot, study hours analysis

---

## 🛠️ VS Code Tips

Recommended extensions:
- **Python** (ms-python.python)
- **ESLint** (dbaeumer.vscode-eslint)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **REST Client** (humao.rest-client) — for testing API endpoints

To run both servers simultaneously, use two integrated terminals:
1. `cd backend && python app.py`
2. `cd frontend && npm run dev`
