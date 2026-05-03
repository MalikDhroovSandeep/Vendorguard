
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import joblib
import os
import json

# Get paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'data')
MODELS_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'models')

# Create models directory if it doesn't exist
os.makedirs(MODELS_DIR, exist_ok=True)


def load_data():
    """Load the training datasets."""
    vendor_df = pd.read_csv(os.path.join(DATA_DIR, 'vendor_features.csv'))
    trends_df = pd.read_csv(os.path.join(DATA_DIR, 'risk_trends_monthly.csv'))
    
    print(f"Loaded {len(vendor_df)} vendor records")
    print(f"Loaded {len(trends_df)} trend records")
    
    return vendor_df, trends_df


def train_risk_classifier(df: pd.DataFrame) -> dict:
    """
    Train Random Forest Classifier for vendor risk scoring.
    Target: risk_level (LOW/MEDIUM/HIGH)
    """
    print("\n" + "=" * 50)
    print("Training Risk Classifier (Random Forest)")
    print("=" * 50)
    
    # Features for risk classification
    features = [
        'industry_risk_factor',
        'years_in_business',
        'on_time_delivery_rate',
        'avg_delivery_delay_days',
        'total_disputes',
        'quality_issues_count',
        'dispute_resolution_time_avg',
        'manual_reliability_rating',
        'total_orders',
        'avg_monthly_disputes',
    ]
    
    X = df[features]
    y = df['risk_level']
    
    # Encode labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    # Train model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nAccuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))
    
    # Feature importance
    print("\nFeature Importance:")
    importance = dict(zip(features, model.feature_importances_))
    for feat, imp in sorted(importance.items(), key=lambda x: x[1], reverse=True):
        print(f"  {feat}: {imp:.4f}")
    
    # Save model and encoder
    model_path = os.path.join(MODELS_DIR, 'risk_classifier.pkl')
    encoder_path = os.path.join(MODELS_DIR, 'risk_label_encoder.pkl')
    
    joblib.dump(model, model_path)
    joblib.dump(label_encoder, encoder_path)
    
    print(f"\nSaved model to: {model_path}")
    
    return {
        'model': 'risk_classifier',
        'algorithm': 'RandomForest',
        'accuracy': round(accuracy, 4),
        'features': features,
    }


def train_anomaly_detector(df: pd.DataFrame) -> dict:
    """
    Train Isolation Forest for anomaly detection.
    Unsupervised - detects unusual patterns.
    """
    print("\n" + "=" * 50)
    print("Training Anomaly Detector (Isolation Forest)")
    print("=" * 50)
    
    # Features for anomaly detection
    features = [
        'avg_invoice_amount',
        'orders_last_month',
        'disputes_last_month',
        'late_deliveries',
        'payment_disputes_count',
        'avg_monthly_disputes',
    ]
    
    X = df[features]
    
    # Scale features for better performance
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train model (contamination = expected proportion of anomalies)
    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,  # Expect ~10% anomalies
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_scaled)
    
    # Predict on training data to see distribution
    predictions = model.predict(X_scaled)
    anomalies = (predictions == -1).sum()
    normal = (predictions == 1).sum()
    
    print(f"\nDetected {anomalies} anomalies ({anomalies/len(df)*100:.1f}%)")
    print(f"Normal samples: {normal} ({normal/len(df)*100:.1f}%)")
    
    # Save model and scaler
    model_path = os.path.join(MODELS_DIR, 'anomaly_detector.pkl')
    scaler_path = os.path.join(MODELS_DIR, 'anomaly_scaler.pkl')
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"\nSaved model to: {model_path}")
    
    return {
        'model': 'anomaly_detector',
        'algorithm': 'IsolationForest',
        'anomalies_detected': int(anomalies),
        'features': features,
    }


def train_performance_predictor(df: pd.DataFrame) -> dict:
    """
    Train Logistic Regression for performance prediction.
    Target: predicted_delay_flag (0/1)
    """
    print("\n" + "=" * 50)
    print("Training Performance Predictor (Logistic Regression)")
    print("=" * 50)
    
    # Features for prediction
    features = [
        'on_time_delivery_rate',
        'late_deliveries',
        'avg_delivery_delay_days',
        'disputes_last_month',
        'quality_issues_count',
        'orders_last_month',
        'industry_risk_factor',
        'avg_monthly_disputes',
    ]
    
    X = df[features]
    y = df['predicted_delay_flag']
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Train model
    model = LogisticRegression(
        max_iter=1000,
        random_state=42,
        class_weight='balanced'
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    print(f"\nAccuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1 Score: {f1:.4f}")
    
    # Feature coefficients
    print("\nFeature Coefficients:")
    coefs = dict(zip(features, model.coef_[0]))
    for feat, coef in sorted(coefs.items(), key=lambda x: abs(x[1]), reverse=True):
        print(f"  {feat}: {coef:.4f}")
    
    # Save model and scaler
    model_path = os.path.join(MODELS_DIR, 'performance_predictor.pkl')
    scaler_path = os.path.join(MODELS_DIR, 'performance_scaler.pkl')
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"\nSaved model to: {model_path}")
    
    return {
        'model': 'performance_predictor',
        'algorithm': 'LogisticRegression',
        'accuracy': round(accuracy, 4),
        'precision': round(precision, 4),
        'recall': round(recall, 4),
        'f1_score': round(f1, 4),
        'features': features,
    }


def train_trend_forecaster(trends_df: pd.DataFrame) -> dict:
    """
    Train Linear Regression for risk trend forecasting.
    Uses past months to predict next month's risk score.
    """
    print("\n" + "=" * 50)
    print("Training Trend Forecaster (Linear Regression)")
    print("=" * 50)
    
    # Prepare time-series data
    # For each vendor, use past 3 months to predict next month
    
    X_data = []
    y_data = []
    
    vendors = trends_df['vendor_id'].unique()
    
    for vendor in vendors:
        vendor_data = trends_df[trends_df['vendor_id'] == vendor].sort_values('year_month')
        scores = vendor_data['risk_score'].values
        
        # Create sequences (use 3 months to predict 4th)
        for i in range(len(scores) - 3):
            X_data.append(scores[i:i+3])
            y_data.append(scores[i+3])
    
    X = np.array(X_data)
    y = np.array(y_data)
    
    print(f"Created {len(X)} training sequences from {len(vendors)} vendors")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train model
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    mse = np.mean((y_test - y_pred) ** 2)
    rmse = np.sqrt(mse)
    mae = np.mean(np.abs(y_test - y_pred))
    r2 = model.score(X_test, y_test)
    
    print(f"\nRMSE: {rmse:.4f}")
    print(f"MAE: {mae:.4f}")
    print(f"R² Score: {r2:.4f}")
    
    print(f"\nModel Coefficients:")
    print(f"  Month -3: {model.coef_[0]:.4f}")
    print(f"  Month -2: {model.coef_[1]:.4f}")
    print(f"  Month -1: {model.coef_[2]:.4f}")
    print(f"  Intercept: {model.intercept_:.4f}")
    
    # Save model
    model_path = os.path.join(MODELS_DIR, 'trend_forecaster.pkl')
    joblib.dump(model, model_path)
    
    print(f"\nSaved model to: {model_path}")
    
    return {
        'model': 'trend_forecaster',
        'algorithm': 'LinearRegression',
        'rmse': round(rmse, 4),
        'mae': round(mae, 4),
        'r2_score': round(r2, 4),
        'input_months': 3,
    }


def main():
    """Main function to train all models."""
    
    print("=" * 60)
    print("VendorGuard ML Model Training")
    print("=" * 60)
    
    # Load data
    vendor_df, trends_df = load_data()
    
    # Train all models
    results = []
    
    results.append(train_risk_classifier(vendor_df))
    results.append(train_anomaly_detector(vendor_df))
    results.append(train_performance_predictor(vendor_df))
    results.append(train_trend_forecaster(trends_df))
    
    # Save training summary
    summary_path = os.path.join(MODELS_DIR, 'training_summary.json')
    with open(summary_path, 'w') as f:
        json.dump({
            'trained_at': pd.Timestamp.now().isoformat(),
            'models': results
        }, f, indent=2)
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print("=" * 60)
    print(f"\nTrained {len(results)} models:")
    for r in results:
        print(f"  ✓ {r['model']} ({r['algorithm']})")
    print(f"\nModels saved to: {MODELS_DIR}")
    print(f"Training summary saved to: {summary_path}")


if __name__ == '__main__':
    main()
