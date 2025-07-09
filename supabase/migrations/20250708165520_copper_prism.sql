-- ConSecure Threat Intelligence Database Schema
-- This file initializes the database schema for the threat intelligence system

CREATE DATABASE IF NOT EXISTS threat_intelligence;
USE threat_intelligence;

-- Threats table
CREATE TABLE IF NOT EXISTS threats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity ENUM('low', 'medium', 'high') NOT NULL,
    type VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    status ENUM('active', 'investigating', 'resolved', 'blocked') DEFAULT 'active',
    confidence FLOAT DEFAULT 0.0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    indicators JSON,
    recommendations JSON,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_severity (severity),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_timestamp (timestamp),
    INDEX idx_source (source)
);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    input_text TEXT NOT NULL,
    threat_level ENUM('low', 'medium', 'high') NOT NULL,
    confidence FLOAT NOT NULL,
    category VARCHAR(100) NOT NULL,
    indicators JSON,
    recommendations JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_threat_level (threat_level),
    INDEX idx_category (category),
    INDEX idx_timestamp (timestamp)
);

-- IOCs (Indicators of Compromise) table
CREATE TABLE IF NOT EXISTS iocs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    threat_id INT,
    type ENUM('ip', 'domain', 'url', 'hash', 'email', 'file') NOT NULL,
    value VARCHAR(500) NOT NULL,
    description TEXT,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    confidence FLOAT DEFAULT 0.0,
    FOREIGN KEY (threat_id) REFERENCES threats(id) ON DELETE CASCADE,
    INDEX idx_type (type),
    INDEX idx_value (value),
    INDEX idx_threat_id (threat_id),
    INDEX idx_active (is_active)
);

-- Users table for authentication (future enhancement)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'analyst', 'viewer') DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INT NULL,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_action (action),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_user_id (user_id)
);

-- System settings table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('system_name', 'ConSecure Threat Intelligence', 'System name displayed in UI'),
('alert_threshold_high', '0.8', 'Confidence threshold for high severity alerts'),
('alert_threshold_medium', '0.6', 'Confidence threshold for medium severity alerts'),
('retention_days', '365', 'Number of days to retain threat data'),
('max_analysis_length', '5000', 'Maximum characters for text analysis'),
('api_rate_limit', '100', 'API requests per minute per IP'),
('email_notifications', 'false', 'Enable email notifications for high severity threats')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Create indexes for better performance
CREATE INDEX idx_threats_composite ON threats(severity, status, timestamp);
CREATE INDEX idx_analyses_composite ON analyses(threat_level, timestamp);
CREATE INDEX idx_iocs_composite ON iocs(type, is_active, first_seen);

-- Create a view for recent high-severity threats
CREATE VIEW recent_high_threats AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.severity,
    t.type,
    t.source,
    t.status,
    t.confidence,
    t.timestamp,
    JSON_LENGTH(t.indicators) as indicator_count
FROM threats t
WHERE t.severity = 'high' 
    AND t.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY t.timestamp DESC;

-- Create a view for threat statistics
CREATE VIEW threat_statistics AS
SELECT 
    COUNT(*) as total_threats,
    COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity,
    COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_severity,
    COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_severity,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_threats,
    COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_threats,
    AVG(confidence) as avg_confidence,
    COUNT(CASE WHEN timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as threats_24h,
    COUNT(CASE WHEN timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as threats_7d,
    COUNT(CASE WHEN timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as threats_30d
FROM threats;

-- Insert sample data for demonstration
INSERT INTO threats (title, description, severity, type, source, status, confidence, indicators, recommendations, tags) VALUES
('Advanced Phishing Campaign', 'Sophisticated phishing campaign targeting financial institutions with credential harvesting', 'high', 'phishing', 'Email Security Gateway', 'active', 0.92, '["suspicious-domain.com", "phishing@malicious.com", "192.168.1.100"]', '["Block sender domains", "Update email filtering rules", "Conduct security awareness training"]', '["phishing", "financial", "credential_theft"]'),

('Ransomware Deployment Detected', 'Ransomware variant detected with advanced encryption and anti-analysis techniques', 'high', 'malware', 'Endpoint Protection', 'investigating', 0.95, '["ransomware.exe", "C2-server.evil.com", "hash:a1b2c3d4e5f6"]', '["Isolate infected systems", "Restore from backups", "Update antivirus signatures"]', '["ransomware", "malware", "encryption"]'),

('Data Exfiltration Attempt', 'Unusual outbound data transfer patterns indicating potential data theft', 'high', 'data_exfiltration', 'Network Monitor', 'active', 0.88, '["10.0.0.25", "ftp://external-server.com", "large_data_transfer"]', '["Block external connections", "Review data access logs", "Implement DLP policies"]', '["data_theft", "exfiltration", "network"]'),

('Brute Force Attack', 'Multiple failed login attempts from distributed IP addresses', 'medium', 'brute_force', 'Authentication System', 'blocked', 0.76, '["203.0.113.5", "203.0.113.6", "admin_account"]', '["Implement account lockout", "Enable MFA", "Monitor authentication logs"]', '["brute_force", "authentication", "login"]'),

('Suspicious Network Activity', 'Abnormal network traffic patterns during off-hours', 'medium', 'network_anomaly', 'SIEM', 'investigating', 0.64, '["unusual_traffic", "off_hours", "internal_scan"]', '["Investigate traffic patterns", "Review user activity", "Check for insider threats"]', '["network", "anomaly", "investigation"]'),

('Social Engineering Attempt', 'Reported attempt to manipulate IT staff for credential disclosure', 'low', 'social_engineering', 'User Report', 'resolved', 0.58, '["phone_call", "credential_request", "impersonation"]', '["Security awareness training", "Verify caller identity", "Document incident"]', '["social_engineering", "human_factor", "training"]');

-- Insert sample IOCs
INSERT INTO iocs (threat_id, type, value, description, confidence) VALUES
(1, 'domain', 'suspicious-domain.com', 'Phishing domain used in email campaign', 0.92),
(1, 'email', 'phishing@malicious.com', 'Sender email address for phishing campaign', 0.90),
(1, 'ip', '192.168.1.100', 'IP address hosting phishing site', 0.85),
(2, 'hash', 'a1b2c3d4e5f6789012345678901234567890abcd', 'MD5 hash of ransomware payload', 0.95),
(2, 'domain', 'C2-server.evil.com', 'Command and control server', 0.93),
(3, 'ip', '10.0.0.25', 'Internal host involved in data exfiltration', 0.88),
(3, 'url', 'ftp://external-server.com', 'External server receiving data', 0.86),
(4, 'ip', '203.0.113.5', 'Source IP for brute force attack', 0.76),
(4, 'ip', '203.0.113.6', 'Additional source IP for brute force attack', 0.74);

-- Insert sample analysis records
INSERT INTO analyses (input_text, threat_level, confidence, category, indicators, recommendations) VALUES
('Suspicious email received with attachment claiming to be from bank', 'high', 0.89, 'phishing', '["email_attachment", "bank_impersonation", "suspicious_sender"]', '["Do not open attachment", "Report to security team", "Block sender"]'),
('Multiple failed login attempts detected from same IP', 'medium', 0.72, 'brute_force', '["failed_logins", "single_ip", "pattern_detected"]', '["Block IP address", "Review account security", "Enable monitoring"]'),
('Unusual network traffic at 3 AM to external server', 'medium', 0.68, 'network_anomaly', '["off_hours_activity", "external_connection", "data_transfer"]', '["Investigate user activity", "Check for malware", "Monitor network"]'),
('Employee reported suspicious phone call requesting credentials', 'low', 0.45, 'social_engineering', '["phone_call", "credential_request", "user_report"]', '["Verify caller identity", "Security awareness", "Document incident"]');

COMMIT;