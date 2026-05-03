# VendorGuard ML Module

This directory contains all machine learning components for VendorGuard's AI features.

## Directory Structure

```
ml/
├── data/                    # Training datasets
│   ├── vendor_features.csv  # Main vendor dataset (22 features)
│   └── risk_trends_monthly.csv  # Time-series for trend forecasting
├── models/                  # Trained model files (.pkl)
│   ├── risk_classifier.pkl
│   ├── anomaly_detector.pkl
│   ├── performance_predictor.pkl
│   └── trend_forecaster.pkl
├── scripts/                 # Python scripts
│   ├── generate_data.py     # Synthetic data generator
│   ├── train_models.py      # Model training script
│   └── predict.py           # Prediction utilities
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Generate Synthetic Data
```bash
python scripts/generate_data.py
```

### Train Models
```bash
python scripts/train_models.py
```

### Test Predictions
```bash
python scripts/predict.py --vendor V001
```

## Models

| Model | Algorithm | Purpose |
|-------|-----------|---------|
| Risk Classifier | Random Forest | Classify vendors as LOW/MEDIUM/HIGH risk |
| Anomaly Detector | Isolation Forest | Detect unusual vendor behavior |
| Performance Predictor | Logistic Regression | Predict delivery delays |
| Trend Forecaster | Linear Regression | Forecast future risk scores |

## Features Used

See `implementation_plan.md` for the complete list of 22 features used for training.
