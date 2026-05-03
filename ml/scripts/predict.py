

import pandas as pd
import numpy as np
import joblib
import os
import sys
import json
import argparse

# Get paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'models')
DATA_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'data')


def convert_to_serializable(obj):
    """Convert numpy types to Python native types for JSON serialization."""
    if isinstance(obj, dict):
        return {k: convert_to_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_serializable(i) for i in obj]
    elif isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.bool_):
        return bool(obj)
    else:
        return obj


def load_models():
    """Load all trained models and their dependencies."""
    models = {}
    
    try:
        models['risk_classifier'] = joblib.load(os.path.join(MODELS_DIR, 'risk_classifier.pkl'))
        models['risk_label_encoder'] = joblib.load(os.path.join(MODELS_DIR, 'risk_label_encoder.pkl'))
    except Exception as e:
        print(f"Warning: Could not load risk classifier: {e}", file=sys.stderr)
    
    try:
        models['anomaly_detector'] = joblib.load(os.path.join(MODELS_DIR, 'anomaly_detector.pkl'))
        models['anomaly_scaler'] = joblib.load(os.path.join(MODELS_DIR, 'anomaly_scaler.pkl'))
    except Exception as e:
        print(f"Warning: Could not load anomaly detector: {e}", file=sys.stderr)
    
    try:
        models['performance_predictor'] = joblib.load(os.path.join(MODELS_DIR, 'performance_predictor.pkl'))
        models['performance_scaler'] = joblib.load(os.path.join(MODELS_DIR, 'performance_scaler.pkl'))
    except Exception as e:
        print(f"Warning: Could not load performance predictor: {e}", file=sys.stderr)
    
    try:
        models['trend_forecaster'] = joblib.load(os.path.join(MODELS_DIR, 'trend_forecaster.pkl'))
    except Exception as e:
        print(f"Warning: Could not load trend forecaster: {e}", file=sys.stderr)
    
    return models


def predict_risk(models: dict, vendor_data: dict) -> dict:
    """Predict risk level for a vendor."""
    
    if 'risk_classifier' not in models:
        return {'error': 'Risk classifier not loaded'}
    
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
    
    # Prepare input
    X = np.array([[vendor_data.get(f, 0) for f in features]])
    
    # Predict
    model = models['risk_classifier']
    encoder = models['risk_label_encoder']
    
    prediction = model.predict(X)[0]
    probabilities = model.predict_proba(X)[0]
    
    risk_level = encoder.inverse_transform([prediction])[0]
    
    # Calculate risk score (0-100) based on probabilities
    # LOW=0, MEDIUM=1, HIGH=2
    risk_score = int(probabilities[0] * 0 + probabilities[1] * 50 + probabilities[2] * 100)
    
    return {
        'risk_level': risk_level,
        'risk_score': risk_score,
        'probabilities': {
            'LOW': round(probabilities[0], 4),
            'MEDIUM': round(probabilities[1], 4),
            'HIGH': round(probabilities[2], 4),
        }
    }


def detect_anomaly(models: dict, vendor_data: dict) -> dict:
    """Detect if vendor behavior is anomalous."""
    
    if 'anomaly_detector' not in models:
        return {'error': 'Anomaly detector not loaded'}
    
    features = [
        'avg_invoice_amount',
        'orders_last_month',
        'disputes_last_month',
        'late_deliveries',
        'payment_disputes_count',
        'avg_monthly_disputes',
    ]
    
    # Prepare input
    X = np.array([[vendor_data.get(f, 0) for f in features]])
    
    # Scale
    scaler = models['anomaly_scaler']
    X_scaled = scaler.transform(X)
    
    # Predict
    model = models['anomaly_detector']
    prediction = model.predict(X_scaled)[0]
    anomaly_score = model.score_samples(X_scaled)[0]
    
    is_anomaly = prediction == -1
    
    # Generate anomaly details if detected
    anomaly_details = []
    if is_anomaly:
        # Check which features are unusual
        if vendor_data.get('disputes_last_month', 0) > 3:
            anomaly_details.append({
                'type': 'DISPUTE_PATTERN',
                'message': f"High dispute count ({vendor_data.get('disputes_last_month', 0)}) in last month",
                'severity': 'HIGH' if vendor_data.get('disputes_last_month', 0) > 5 else 'MEDIUM'
            })
        if vendor_data.get('avg_invoice_amount', 0) > 100000:
            anomaly_details.append({
                'type': 'INVOICE_ANOMALY',
                'message': f"Unusually high average invoice amount",
                'severity': 'MEDIUM'
            })
        if vendor_data.get('late_deliveries', 0) > vendor_data.get('on_time_deliveries', 1):
            anomaly_details.append({
                'type': 'DELIVERY_PATTERN',
                'message': "More late deliveries than on-time deliveries",
                'severity': 'HIGH'
            })
    
    return {
        'is_anomaly': is_anomaly,
        'anomaly_score': round(float(anomaly_score), 4),
        'details': anomaly_details
    }


def predict_performance(models: dict, vendor_data: dict) -> dict:
    """Predict if vendor will have performance issues."""
    
    if 'performance_predictor' not in models:
        return {'error': 'Performance predictor not loaded'}
    
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
    
    # Prepare input
    X = np.array([[vendor_data.get(f, 0) for f in features]])
    
    # Scale
    scaler = models['performance_scaler']
    X_scaled = scaler.transform(X)
    
    # Predict
    model = models['performance_predictor']
    prediction = model.predict(X_scaled)[0]
    probability = model.predict_proba(X_scaled)[0]
    
    delay_probability = round(probability[1] * 100, 1)
    
    # Generate predictions
    predictions = []
    
    if delay_probability > 60:
        predictions.append({
            'type': 'DELIVERY_DELAY',
            'probability': delay_probability,
            'message': f"High probability ({delay_probability}%) of delivery delays",
            'severity': 'HIGH'
        })
    elif delay_probability > 40:
        predictions.append({
            'type': 'DELIVERY_DELAY',
            'probability': delay_probability,
            'message': f"Moderate probability ({delay_probability}%) of delivery delays",
            'severity': 'MEDIUM'
        })
    
    # Add quality issue prediction based on features
    quality_risk = vendor_data.get('quality_issues_count', 0) / max(vendor_data.get('total_orders', 1), 1)
    if quality_risk > 0.05:
        predictions.append({
            'type': 'QUALITY_ISSUE',
            'probability': round(quality_risk * 100, 1),
            'message': "Higher than average quality issues expected",
            'severity': 'MEDIUM'
        })
    
    return {
        'will_have_delay': bool(prediction),
        'delay_probability': delay_probability,
        'predictions': predictions
    }


def forecast_trend(models: dict, historical_scores: list) -> dict:
    """Forecast next month's risk score based on history."""
    
    if 'trend_forecaster' not in models:
        return {'error': 'Trend forecaster not loaded'}
    
    if len(historical_scores) < 3:
        return {'error': 'Need at least 3 months of history'}
    
    # Use last 3 months
    X = np.array([historical_scores[-3:]])
    
    # Predict
    model = models['trend_forecaster']
    prediction = model.predict(X)[0]
    
    # Determine trend
    avg_recent = np.mean(historical_scores[-3:])
    if prediction < avg_recent - 3:
        trend = 'improving'
    elif prediction > avg_recent + 3:
        trend = 'declining'
    else:
        trend = 'stable'
    
    return {
        'predicted_score': round(float(prediction), 1),
        'trend': trend,
        'historical_scores': historical_scores[-6:],  # Include last 6 months
    }


def generate_recommendations(risk_result: dict, anomaly_result: dict, performance_result: dict, vendor_data: dict) -> list:
    """Generate smart recommendations based on all model outputs."""
    
    recommendations = []
    
    # Risk-based recommendations
    risk_level = risk_result.get('risk_level', 'MEDIUM')
    
    if risk_level == 'HIGH':
        recommendations.append({
            'type': 'RISK_ALERT',
            'priority': 'HIGH',
            'title': 'High Risk Vendor Alert',
            'message': 'This vendor shows high risk patterns. Consider limiting order volumes and monitoring closely.',
            'action': 'REVIEW_REQUIRED'
        })
    elif risk_level == 'LOW' and vendor_data.get('preferred_vendor_flag', 0) == 0:
        recommendations.append({
            'type': 'OPPORTUNITY',
            'priority': 'LOW',
            'title': 'Preferred Vendor Candidate',
            'message': 'This vendor has low risk and good performance. Consider adding to preferred vendor list.',
            'action': 'CONSIDER_UPGRADE'
        })
    
    # Anomaly-based recommendations
    if anomaly_result.get('is_anomaly', False):
        recommendations.append({
            'type': 'ANOMALY_ALERT',
            'priority': 'HIGH',
            'title': 'Unusual Activity Detected',
            'message': 'AI detected unusual patterns in vendor behavior. Investigation recommended.',
            'action': 'INVESTIGATE'
        })
    
    # Performance-based recommendations
    delay_prob = performance_result.get('delay_probability', 0)
    if delay_prob > 50:
        recommendations.append({
            'type': 'PERFORMANCE_WARNING',
            'priority': 'MEDIUM',
            'title': 'Delivery Delay Risk',
            'message': f'There is a {delay_prob}% chance of delivery delays. Consider buffer time for orders.',
            'action': 'PLAN_BUFFER'
        })
    
    # Improvement recommendations
    on_time_rate = vendor_data.get('on_time_delivery_rate', 1)
    if on_time_rate < 0.9:
        recommendations.append({
            'type': 'IMPROVEMENT',
            'priority': 'MEDIUM',
            'title': 'Delivery Performance Improvement Needed',
            'message': f'On-time delivery rate ({on_time_rate*100:.0f}%) is below 90%. Work with vendor to improve.',
            'action': 'SCHEDULE_REVIEW'
        })
    
    disputes = vendor_data.get('disputes_last_month', 0)
    if disputes > 2:
        recommendations.append({
            'type': 'DISPUTE_ALERT',
            'priority': 'HIGH',
            'title': 'High Dispute Rate',
            'message': f'{disputes} disputes in the last month. Root cause analysis recommended.',
            'action': 'ANALYZE_DISPUTES'
        })
    
    return recommendations


def predict_all(vendor_data: dict) -> dict:
    """Run all predictions for a vendor and return combined results."""
    
    models = load_models()
    
    # Run all predictions
    risk_result = predict_risk(models, vendor_data)
    anomaly_result = detect_anomaly(models, vendor_data)
    performance_result = predict_performance(models, vendor_data)
    
    # Get trend forecast if historical data provided
    trend_result = {}
    if 'historical_risk_scores' in vendor_data:
        trend_result = forecast_trend(models, vendor_data['historical_risk_scores'])
    
    # Generate recommendations
    recommendations = generate_recommendations(
        risk_result, anomaly_result, performance_result, vendor_data
    )
    
    return {
        'vendor_id': vendor_data.get('vendor_id', 'unknown'),
        'risk': risk_result,
        'anomaly': anomaly_result,
        'performance': performance_result,
        'trend': trend_result,
        'recommendations': recommendations,
    }


def main():
    """Main entry point for command-line usage."""
    
    parser = argparse.ArgumentParser(description='VendorGuard ML Prediction')
    parser.add_argument('--vendor', type=str, help='Vendor ID to predict for')
    parser.add_argument('--action', type=str, choices=['risk', 'anomaly', 'performance', 'trend', 'all'],
                        default='all', help='Prediction type')
    parser.add_argument('--data', type=str, help='JSON string of vendor data')
    
    args = parser.parse_args()
    
    # Load models
    models = load_models()
    
    # If vendor ID provided, load from CSV
    if args.vendor:
        df = pd.read_csv(os.path.join(DATA_DIR, 'vendor_features.csv'))
        vendor_row = df[df['vendor_id'] == args.vendor]
        
        if vendor_row.empty:
            # Fallback: Generate synthetic data for unknown vendor ID (e.g. real DB vendor)
            # Use hash of vendor ID to make it deterministic
            import hashlib
            h = int(hashlib.sha256(args.vendor.encode('utf-8')).hexdigest(), 16)
            np.random.seed(h % 2**32)
            
            vendor_data = {
                'vendor_id': args.vendor,
                'industry_risk_factor': np.random.uniform(0.1, 0.9),
                'years_in_business': np.random.randint(1, 20),
                'on_time_delivery_rate': np.random.uniform(0.7, 1.0),
                'avg_delivery_delay_days': np.random.uniform(0, 5),
                'total_disputes': np.random.randint(0, 10),
                'quality_issues_count': np.random.randint(0, 5),
                'dispute_resolution_time_avg': np.random.uniform(1, 10),
                'manual_reliability_rating': np.random.uniform(2, 5),
                'total_orders': np.random.randint(10, 500),
                'avg_monthly_disputes': np.random.uniform(0, 2),
                'avg_invoice_amount': np.random.uniform(1000, 50000),
                'orders_last_month': np.random.randint(0, 50),
                'disputes_last_month': np.random.randint(0, 3),
                'late_deliveries': np.random.randint(0, 5),
                'payment_disputes_count': np.random.randint(0, 2),
                'preferred_vendor_flag': 0 if np.random.random() < 0.8 else 1,
            }
            
            # Generate random history
            last_score = np.random.randint(20, 80)
            history = []
            for _ in range(6):
                change = np.random.randint(-5, 6)
                last_score = max(0, min(100, last_score + change))
                history.append(last_score)
            vendor_data['historical_risk_scores'] = history
        else:
            vendor_data = vendor_row.iloc[0].to_dict()
            
            # Load historical data for trend
            trends_df = pd.read_csv(os.path.join(DATA_DIR, 'risk_trends_monthly.csv'))
            vendor_trends = trends_df[trends_df['vendor_id'] == args.vendor].sort_values('year_month')
            if not vendor_trends.empty:
                vendor_data['historical_risk_scores'] = vendor_trends['risk_score'].tolist()
            else:
                # Fallback history if vendor in CSV but no history
                vendor_data['historical_risk_scores'] = [50, 50, 50]
    
    elif args.data:
        vendor_data = json.loads(args.data)
    else:
        # Demo with sample data
        vendor_data = {
            'vendor_id': 'V001',
            'industry_risk_factor': 0.3,
            'years_in_business': 10,
            'on_time_delivery_rate': 0.92,
            'avg_delivery_delay_days': 1.5,
            'total_disputes': 5,
            'quality_issues_count': 2,
            'dispute_resolution_time_avg': 4.5,
            'manual_reliability_rating': 4.0,
            'total_orders': 200,
            'avg_monthly_disputes': 0.5,
            'avg_invoice_amount': 50000,
            'orders_last_month': 15,
            'disputes_last_month': 1,
            'late_deliveries': 16,
            'payment_disputes_count': 2,
            'preferred_vendor_flag': 0,
            'historical_risk_scores': [25, 28, 24, 26, 23, 22],
        }
    
    # Run prediction
    if args.action == 'all':
        result = predict_all(vendor_data)
    elif args.action == 'risk':
        result = predict_risk(models, vendor_data)
    elif args.action == 'anomaly':
        result = detect_anomaly(models, vendor_data)
    elif args.action == 'performance':
        result = predict_performance(models, vendor_data)
    elif args.action == 'trend':
        if 'historical_risk_scores' not in vendor_data:
            result = {'error': 'No historical data provided'}
        else:
            result = forecast_trend(models, vendor_data['historical_risk_scores'])
    
    # Output as JSON (convert numpy types to native Python types)
    result = convert_to_serializable(result)
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
