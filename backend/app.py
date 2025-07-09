#!/usr/bin/env python3
"""
Basic Flask application for the cybersecurity dashboard backend.
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'password'),
    'database': os.getenv('DB_NAME', 'prajwalsec_threat_intelligence'),
    'port': int(os.getenv('DB_PORT', 3306))
}

@app.route('/')
def health_check():
    return jsonify({"status": "healthy", "message": "Backend is running"})

@app.route('/api/threats')
def get_threats():
    # Mock threat data
    threats = [
        {
            "id": 1,
            "type": "Malware",
            "severity": "High",
            "status": "Active",
            "timestamp": "2024-01-15T10:30:00Z"
        },
        {
            "id": 2,
            "type": "Phishing",
            "severity": "Medium",
            "status": "Resolved",
            "timestamp": "2024-01-15T09:15:00Z"
        }
    ]
    return jsonify(threats)

@app.route('/api/dashboard/stats')
def get_dashboard_stats():
    stats = {
        "total_threats": 156,
        "active_threats": 23,
        "resolved_threats": 133,
        "critical_alerts": 5
    }
    return jsonify(stats)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info("Starting ConSecure Threat Intelligence API server...")
    logger.info("Starting PrajwalSec Threat Intelligence API server...")
    app.run(
        host=os.getenv('FLASK_HOST', '0.0.0.0'),
        port=port, 
        debug=debug
    )