import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Path to the ML scripts directory
const ML_DIR = path.join(process.cwd(), 'ml');
const SCRIPTS_DIR = path.join(ML_DIR, 'scripts');

export interface PredictionResult {
    vendor_id: string;
    risk?: {
        risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
        risk_score: number;
        probabilities: {
            LOW: number;
            MEDIUM: number;
            HIGH: number;
        };
    };
    anomaly?: {
        is_anomaly: boolean;
        anomaly_score: number;
        details: Array<{
            type: string;
            message: string;
            severity: string;
        }>;
    };
    performance?: {
        will_have_delay: boolean;
        delay_probability: number;
        predictions: Array<{
            type: string;
            probability: number;
            message: string;
            severity: string;
        }>;
    };
    trend?: {
        predicted_score: number;
        trend: 'improving' | 'stable' | 'declining';
        historical_scores: number[];
    };
    recommendations?: Array<{
        type: string;
        priority: string;
        title: string;
        message: string;
        action: string;
    }>;
    error?: string;
}

/**
 * Run a Python prediction script and return the JSON result
 */
export async function runPythonPrediction(
    vendorId?: string,
    action: 'all' | 'risk' | 'anomaly' | 'performance' | 'trend' = 'all'
): Promise<PredictionResult> {
    try {
        const scriptPath = path.join(SCRIPTS_DIR, 'predict.py');

        let command = `python "${scriptPath}" --action ${action}`;
        if (vendorId) {
            command += ` --vendor ${vendorId}`;
        }

        const { stdout, stderr } = await execAsync(command, {
            cwd: ML_DIR,
            timeout: 30000, // 30 second timeout
        });

        // Parse the JSON output
        const result = JSON.parse(stdout);
        return result;
    } catch (error: unknown) {
        console.error('Python prediction error:', error);

        // Check if error has message property
        const errorMessage = error instanceof Error
            ? error.message
            : 'Unknown error occurred';

        return {
            vendor_id: vendorId || 'unknown',
            error: `Prediction failed: ${errorMessage}`,
        };
    }
}

/**
 * Run prediction with custom vendor data (JSON input)
 */
export async function runPredictionWithData(
    vendorData: Record<string, unknown>,
    action: 'all' | 'risk' | 'anomaly' | 'performance' | 'trend' = 'all'
): Promise<PredictionResult> {
    try {
        const scriptPath = path.join(SCRIPTS_DIR, 'predict.py');
        const jsonData = JSON.stringify(vendorData).replace(/"/g, '\\"');

        const command = `python "${scriptPath}" --action ${action} --data "${jsonData}"`;

        const { stdout } = await execAsync(command, {
            cwd: ML_DIR,
            timeout: 30000,
        });

        return JSON.parse(stdout);
    } catch (error: unknown) {
        console.error('Python prediction error:', error);

        const errorMessage = error instanceof Error
            ? error.message
            : 'Unknown error occurred';

        return {
            vendor_id: 'unknown',
            error: `Prediction failed: ${errorMessage}`,
        };
    }
}

/**
 * Check if the ML models are available
 */
export async function checkModelsAvailable(): Promise<boolean> {
    try {
        const modelsDir = path.join(ML_DIR, 'models');
        const { stdout } = await execAsync(`dir "${modelsDir}"`, { cwd: ML_DIR });
        return stdout.includes('risk_classifier.pkl');
    } catch {
        return false;
    }
}
