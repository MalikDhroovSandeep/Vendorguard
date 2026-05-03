"""
Synthetic Data Generator for VendorGuard ML Models
Generates realistic vendor data for training the 5 ML models.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import random

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Configuration
NUM_VENDORS = 500
NUM_MONTHS = 12  # For trend data

# Industry categories with associated risk factors
INDUSTRIES = {
    'Manufacturing': 0.3,
    'IT Services': 0.2,
    'Construction': 0.7,
    'Retail': 0.4,
    'Healthcare': 0.5,
    'Logistics': 0.5,
    'Food & Beverage': 0.6,
    'Textiles': 0.4,
    'Electronics': 0.3,
    'Chemicals': 0.8,
}

def generate_vendor_id(index: int) -> str:
    """Generate vendor ID like V001, V002, etc."""
    return f"V{str(index + 1).zfill(3)}"


def calculate_risk_level(row: dict) -> str:
    """
    Calculate risk level based on weighted scoring of features.
    This creates realistic correlations in the training data.
    """
    # Weighted risk score calculation
    score = 0
    
    # Industry risk factor (weight: 15%)
    score += row['industry_risk_factor'] * 15
    
    # On-time delivery rate (weight: 25%) - lower is worse
    score += (1 - row['on_time_delivery_rate']) * 25
    
    # Average delivery delay (weight: 15%)
    delay_score = min(row['avg_delivery_delay_days'] / 10, 1)  # Normalize to 0-1
    score += delay_score * 15
    
    # Dispute rate (weight: 20%)
    if row['total_orders'] > 0:
        dispute_rate = row['total_disputes'] / row['total_orders']
        score += min(dispute_rate * 10, 1) * 20
    
    # Quality issues (weight: 10%)
    if row['total_orders'] > 0:
        quality_rate = row['quality_issues_count'] / row['total_orders']
        score += min(quality_rate * 10, 1) * 10
    
    # Years in business (weight: 10%) - fewer years = higher risk
    years_score = max(0, 1 - (row['years_in_business'] / 20))
    score += years_score * 10
    
    # Manual reliability rating (weight: 5%) - inverse relationship
    rating_score = (5 - row['manual_reliability_rating']) / 5
    score += rating_score * 5
    
    # Classify based on score
    if score <= 30:
        return 'LOW'
    elif score <= 60:
        return 'MEDIUM'
    else:
        return 'HIGH'


def calculate_delay_prediction(row: dict) -> int:
    """
    Predict if vendor will have delivery delays.
    Based on historical patterns.
    """
    # Probability of delay based on features
    prob = 0.1  # Base probability
    
    # Low on-time rate increases probability
    if row['on_time_delivery_rate'] < 0.85:
        prob += 0.3
    elif row['on_time_delivery_rate'] < 0.92:
        prob += 0.15
    
    # Recent disputes increase probability
    if row['disputes_last_month'] > 2:
        prob += 0.2
    elif row['disputes_last_month'] > 0:
        prob += 0.1
    
    # High average delay increases probability
    if row['avg_delivery_delay_days'] > 3:
        prob += 0.25
    elif row['avg_delivery_delay_days'] > 1:
        prob += 0.1
    
    # Quality issues increase probability
    if row['quality_issues_count'] > 10:
        prob += 0.15
    
    # Random determination based on probability
    return 1 if random.random() < prob else 0


def generate_vendor_features() -> pd.DataFrame:
    """Generate the main vendor features dataset."""
    
    print("Generating vendor features dataset...")
    
    vendors = []
    
    for i in range(NUM_VENDORS):
        # Select industry
        industry = random.choice(list(INDUSTRIES.keys()))
        industry_risk = INDUSTRIES[industry]
        
        # Base characteristics influenced by industry risk
        base_quality = 1 - (industry_risk * 0.5) + random.uniform(-0.2, 0.2)
        base_quality = max(0.5, min(1, base_quality))  # Clamp to 0.5-1
        
        # Years in business (1-25 years)
        years_in_business = random.randint(1, 25)
        
        # Experience bonus (older vendors tend to be more reliable)
        exp_bonus = min(years_in_business / 20, 0.2)
        
        # Total orders (influenced by years and quality)
        orders_per_year = int(np.random.exponential(50) + 20)
        total_orders = orders_per_year * min(years_in_business, 10)
        total_orders = max(10, min(total_orders, 2000))
        
        # Orders last month
        orders_last_month = max(1, int(np.random.poisson(total_orders / 24)))
        
        # On-time deliveries (influenced by base quality)
        on_time_rate = base_quality + exp_bonus + np.random.normal(0, 0.05)
        on_time_rate = max(0.5, min(0.99, on_time_rate))
        on_time_deliveries = int(total_orders * on_time_rate)
        late_deliveries = total_orders - on_time_deliveries
        
        # Average delivery delay (for late deliveries)
        if on_time_rate > 0.95:
            avg_delay = np.random.exponential(0.5)
        elif on_time_rate > 0.85:
            avg_delay = np.random.exponential(1.5)
        else:
            avg_delay = np.random.exponential(3)
        avg_delay = round(max(0, avg_delay), 1)
        
        # Invoice data
        total_invoices = total_orders + random.randint(-5, 10)
        total_invoices = max(total_orders - 2, total_invoices)
        avg_invoice = int(np.random.lognormal(10, 1))  # Log-normal for realistic amounts
        avg_invoice = max(5000, min(avg_invoice, 500000))
        
        # Payment delays
        payment_delay = np.random.exponential(3) if industry_risk > 0.5 else np.random.exponential(2)
        payment_delay = round(max(0, payment_delay), 1)
        
        # Disputes
        dispute_rate = (1 - base_quality) * 0.1 + industry_risk * 0.05
        total_disputes = int(total_orders * dispute_rate)
        total_disputes = max(0, total_disputes + random.randint(-2, 3))
        
        payment_disputes = int(total_disputes * random.uniform(0.2, 0.4))
        delivery_issues = int(total_disputes * random.uniform(0.3, 0.5))
        quality_issues = total_disputes - payment_disputes - delivery_issues
        quality_issues = max(0, quality_issues)
        
        # Dispute resolution time
        resolution_time = np.random.exponential(5) + 2
        resolution_time = round(max(1, min(resolution_time, 30)), 1)
        
        # Recent disputes (last month)
        monthly_dispute_rate = total_disputes / max(years_in_business * 12, 1)
        disputes_last_month = int(np.random.poisson(monthly_dispute_rate * 1.5))
        avg_monthly_disputes = round(monthly_dispute_rate, 2)
        
        # Manual reliability rating (1-5, influenced by quality)
        base_rating = base_quality * 4 + 1  # Map 0.5-1 to 3-5
        rating = base_rating + np.random.normal(0, 0.5)
        rating = round(max(1, min(5, rating)), 1)
        
        # Preferred vendor flag
        preferred = 1 if (rating >= 4 and on_time_rate >= 0.9 and total_disputes < 5) else 0
        
        vendor = {
            'vendor_id': generate_vendor_id(i),
            'industry_category': industry,
            'industry_risk_factor': industry_risk,
            'years_in_business': years_in_business,
            'total_orders': total_orders,
            'orders_last_month': orders_last_month,
            'on_time_deliveries': on_time_deliveries,
            'late_deliveries': late_deliveries,
            'avg_delivery_delay_days': avg_delay,
            'on_time_delivery_rate': round(on_time_rate, 2),
            'total_invoices': total_invoices,
            'avg_invoice_amount': avg_invoice,
            'payment_delay_days_avg': payment_delay,
            'payment_disputes_count': payment_disputes,
            'total_disputes': total_disputes,
            'delivery_issues_count': delivery_issues,
            'quality_issues_count': quality_issues,
            'dispute_resolution_time_avg': resolution_time,
            'disputes_last_month': disputes_last_month,
            'avg_monthly_disputes': avg_monthly_disputes,
            'manual_reliability_rating': rating,
            'preferred_vendor_flag': preferred,
        }
        
        # Calculate target variables
        vendor['risk_level'] = calculate_risk_level(vendor)
        vendor['predicted_delay_flag'] = calculate_delay_prediction(vendor)
        
        vendors.append(vendor)
    
    df = pd.DataFrame(vendors)
    
    # Print distribution stats
    print(f"\nRisk Level Distribution:")
    print(df['risk_level'].value_counts())
    print(f"\nDelay Prediction Distribution:")
    print(df['predicted_delay_flag'].value_counts())
    
    return df


def generate_risk_trends() -> pd.DataFrame:
    """Generate monthly risk trends for time-series forecasting."""
    
    print("\nGenerating risk trends dataset...")
    
    trends = []
    
    # Generate for subset of vendors (250)
    vendor_subset = random.sample(range(NUM_VENDORS), min(250, NUM_VENDORS))
    
    base_date = datetime(2025, 1, 1)
    
    for vendor_idx in vendor_subset:
        vendor_id = generate_vendor_id(vendor_idx)
        
        # Starting risk score (random between 15-80)
        base_risk = random.randint(15, 80)
        
        # Trend direction
        trend_type = random.choice(['improving', 'stable', 'declining'])
        
        if trend_type == 'improving':
            monthly_change = -random.uniform(0.5, 2)
        elif trend_type == 'declining':
            monthly_change = random.uniform(0.5, 2)
        else:
            monthly_change = random.uniform(-0.3, 0.3)
        
        for month_offset in range(NUM_MONTHS):
            month_date = base_date + timedelta(days=30 * month_offset)
            year_month = month_date.strftime('%Y-%m')
            
            # Calculate risk score with some noise
            risk_score = base_risk + (monthly_change * month_offset) + random.uniform(-3, 3)
            risk_score = max(5, min(95, risk_score))
            
            # Component scores
            delivery_score = 100 - risk_score + random.uniform(-10, 10)
            delivery_score = max(40, min(100, delivery_score))
            
            dispute_score = (risk_score / 2) + random.uniform(-5, 5)
            dispute_score = max(0, min(50, dispute_score))
            
            quality_score = 100 - risk_score + random.uniform(-15, 15)
            quality_score = max(50, min(100, quality_score))
            
            # Determine trend label
            if month_offset < 2:
                overall_trend = 'stable'
            elif month_offset >= 2:
                if monthly_change < -0.3:
                    overall_trend = 'decreasing'
                elif monthly_change > 0.3:
                    overall_trend = 'increasing'
                else:
                    overall_trend = 'stable'
            
            trends.append({
                'vendor_id': vendor_id,
                'year_month': year_month,
                'risk_score': round(risk_score, 1),
                'delivery_score': round(delivery_score, 1),
                'dispute_score': round(dispute_score, 1),
                'quality_score': round(quality_score, 1),
                'overall_trend': overall_trend,
            })
    
    df = pd.DataFrame(trends)
    print(f"Generated {len(df)} trend records for {len(vendor_subset)} vendors")
    
    return df


def main():
    """Main function to generate all datasets."""
    
    # Get the script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(os.path.dirname(script_dir), 'data')
    
    # Create data directory if it doesn't exist
    os.makedirs(data_dir, exist_ok=True)
    
    print("=" * 50)
    print("VendorGuard Synthetic Data Generator")
    print("=" * 50)
    
    # Generate vendor features
    vendor_df = generate_vendor_features()
    vendor_path = os.path.join(data_dir, 'vendor_features.csv')
    vendor_df.to_csv(vendor_path, index=False)
    print(f"\nSaved vendor features to: {vendor_path}")
    print(f"Total records: {len(vendor_df)}")
    
    # Generate risk trends
    trends_df = generate_risk_trends()
    trends_path = os.path.join(data_dir, 'risk_trends_monthly.csv')
    trends_df.to_csv(trends_path, index=False)
    print(f"\nSaved risk trends to: {trends_path}")
    print(f"Total records: {len(trends_df)}")
    
    print("\n" + "=" * 50)
    print("Data generation complete!")
    print("=" * 50)


if __name__ == '__main__':
    main()
