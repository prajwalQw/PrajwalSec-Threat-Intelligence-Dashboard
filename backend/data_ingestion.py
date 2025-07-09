import mysql.connector
from mysql.connector import Error
import pandas as pd
import json
import logging
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'password'),
    'database': os.getenv('DB_NAME', 'prajwalsec_threat_intelligence'),
    'port': int(os.getenv('DB_PORT', 3306))
}

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        logger.error(f"Database connection error: {str(e)}")
        raise

def ingest_csv_data(file_path: str):
    """Ingest threat data from CSV file"""
    try:
        logger.info(f"Starting data ingestion from: {file_path}")
        
        # Read CSV file
        df = pd.read_csv(file_path)
        logger.info(f"Loaded {len(df)} records from CSV")
        
        # Connect to database
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Process each row
        ingested_count = 0
        for index, row in df.iterrows():
            try:
                # Map CSV columns to database schema
                # Adjust these mappings based on your actual CSV structure
                title = row.get('title', f'Threat {index + 1}')
                description = row.get('description', row.get('text', ''))
                severity = map_severity(row.get('severity', row.get('label', 'medium')))
                threat_type = row.get('type', 'unknown')
                source = row.get('source', 'CSV Import')
                
                # Extract indicators if available
                indicators = []
                if 'indicators' in row and pd.notna(row['indicators']):
                    try:
                        indicators = json.loads(row['indicators'])
                    except:
                        indicators = [str(row['indicators'])]
                
                # Generate recommendations based on severity
                recommendations = generate_recommendations(severity, threat_type)
                
                # Insert into database
                cursor.execute("""
                    INSERT INTO threats (title, description, severity, type, source, indicators, recommendations, tags)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    title,
                    description,
                    severity,
                    threat_type,
                    source,
                    json.dumps(indicators),
                    json.dumps(recommendations),
                    json.dumps([threat_type, severity])
                ))
                
                ingested_count += 1
                
                if ingested_count % 100 == 0:
                    logger.info(f"Ingested {ingested_count} records...")
                    
            except Exception as e:
                logger.warning(f"Error processing row {index}: {str(e)}")
                continue
        
        connection.commit()
        logger.info(f"Successfully ingested {ingested_count} threat records")
        
    except Exception as e:
        logger.error(f"Data ingestion failed: {str(e)}")
        raise
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def map_severity(severity_value):
    """Map various severity formats to standard values"""
    if pd.isna(severity_value):
        return 'medium'
    
    severity_str = str(severity_value).lower()
    
    if severity_str in ['high', 'critical', '3', 'severe']:
        return 'high'
    elif severity_str in ['medium', 'moderate', '2', 'warning']:
        return 'medium'
    elif severity_str in ['low', 'info', '1', 'minor']:
        return 'low'
    else:
        return 'medium'

def generate_recommendations(severity: str, threat_type: str) -> list:
    """Generate recommendations based on threat characteristics"""
    base_recommendations = [
        "Monitor for similar indicators",
        "Review security logs",
        "Update security policies as needed"
    ]
    
    severity_recommendations = {
        'high': [
            "Immediate isolation of affected systems",
            "Activate incident response team",
            "Notify relevant stakeholders",
            "Implement emergency containment measures"
        ],
        'medium': [
            "Investigate potential impact",
            "Enhance monitoring of related systems",
            "Review access controls",
            "Consider additional security measures"
        ],
        'low': [
            "Document for future reference",
            "Include in routine security reviews",
            "Monitor for escalation"
        ]
    }
    
    type_recommendations = {
        'phishing': [
            "Block sender domains",
            "Update email filtering rules",
            "Conduct phishing awareness training"
        ],
        'malware': [
            "Run full system scans",
            "Update antivirus signatures",
            "Isolate infected systems"
        ],
        'network': [
            "Review firewall rules",
            "Monitor network traffic",
            "Check for lateral movement"
        ]
    }
    
    recommendations = base_recommendations.copy()
    recommendations.extend(severity_recommendations.get(severity, []))
    recommendations.extend(type_recommendations.get(threat_type, []))
    
    return recommendations

def ingest_sample_data():
    """Ingest sample threat data for testing"""
    try:
        logger.info("Ingesting sample threat data...")
        
        sample_threats = [
            {
                'title': 'Phishing Campaign Targeting Financial Institutions',
                'description': 'Large-scale phishing campaign using sophisticated social engineering to target banking customers',
                'severity': 'high',
                'type': 'phishing',
                'source': 'Email Security Gateway',
                'indicators': ['phishing-domain.com', 'attacker@malicious.com', '203.0.113.1'],
                'status': 'active'
            },
            {
                'title': 'Ransomware Variant Detection',
                'description': 'New ransomware variant detected with improved encryption and anti-analysis capabilities',
                'severity': 'high',
                'type': 'malware',
                'source': 'Endpoint Security',
                'indicators': ['ransomware.exe', 'C2-server.com', 'a1b2c3d4e5f6'],
                'status': 'active'
            },
            {
                'title': 'Suspicious Network Activity',
                'description': 'Unusual network traffic patterns suggesting potential data exfiltration',
                'severity': 'medium',
                'type': 'network',
                'source': 'Network Monitor',
                'indicators': ['192.168.1.100', 'unusual-traffic-pattern', 'port-443'],
                'status': 'investigating'
            },
            {
                'title': 'Brute Force Attack Detection',
                'description': 'Multiple failed login attempts detected from various IP addresses',
                'severity': 'medium',
                'type': 'brute_force',
                'source': 'Authentication System',
                'indicators': ['203.0.113.5', 'failed-logins', 'admin-account'],
                'status': 'blocked'
            },
            {
                'title': 'Social Engineering Attempt',
                'description': 'Reported social engineering attempt targeting IT support staff',
                'severity': 'low',
                'type': 'social_engineering',
                'source': 'Security Awareness',
                'indicators': ['fake-support-call', 'credential-request'],
                'status': 'resolved'
            }
        ]
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        for threat in sample_threats:
            recommendations = generate_recommendations(threat['severity'], threat['type'])
            tags = [threat['type'], threat['severity'], 'sample-data']
            
            cursor.execute("""
                INSERT INTO threats (title, description, severity, type, source, status, confidence, indicators, recommendations, tags)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                threat['title'],
                threat['description'],
                threat['severity'],
                threat['type'],
                threat['source'],
                threat['status'],
                85.0,  # Default confidence
                json.dumps(threat['indicators']),
                json.dumps(recommendations),
                json.dumps(tags)
            ))
        
        connection.commit()
        logger.info(f"Successfully ingested {len(sample_threats)} sample threats")
        
    except Exception as e:
        logger.error(f"Sample data ingestion failed: {str(e)}")
        raise
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    try:
        # Check if CSV file is provided
        import sys
        if len(sys.argv) > 1:
            csv_file = sys.argv[1]
            if os.path.exists(csv_file):
                ingest_csv_data(csv_file)
            else:
                logger.error(f"CSV file not found: {csv_file}")
        else:
            # Ingest sample data if no CSV file provided
            ingest_sample_data()
            logger.info("Sample data ingestion completed. Use 'python data_ingestion.py <csv_file>' to ingest from CSV.")
            
    except Exception as e:
        logger.error(f"Data ingestion script failed: {str(e)}")
        exit(1)