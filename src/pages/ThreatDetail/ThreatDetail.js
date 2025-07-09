import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  Activity, 
  Clock, 
  User, 
  Globe,
  FileText,
  Download,
  Share2,
  Copy,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import './ThreatDetail.css';

const ThreatDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [threat, setThreat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchThreatDetail();
  }, [id]);

  const fetchThreatDetail = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual endpoint
      const response = await fetch(`/api/threats/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setThreat(data);
      } else {
        // Mock detailed threat data
        const mockThreat = {
          id: parseInt(id),
          title: 'Advanced Persistent Threat (APT) Campaign Detected',
          description: 'Sophisticated multi-stage attack campaign targeting financial institutions with custom malware and social engineering techniques.',
          severity: 'high',
          type: 'apt',
          source: 'Threat Intelligence Platform',
          timestamp: '2024-01-15T10:30:00Z',
          lastUpdated: '2024-01-15T14:22:00Z',
          status: 'active',
          confidence: 95,
          indicators: [
            {
              type: 'ip',
              value: '192.168.1.100',
              description: 'Command and control server'
            },
            {
              type: 'domain',
              value: 'malicious-domain.com',
              description: 'Phishing domain'
            },
            {
              type: 'hash',
              value: 'a1b2c3d4e5f6789012345678901234567890abcd',
              description: 'Malware payload hash'
            },
            {
              type: 'email',
              value: 'attacker@suspicious.com',
              description: 'Phishing email sender'
            }
          ],
          timeline: [
            {
              time: '2024-01-15T10:30:00Z',
              event: 'Initial detection',
              description: 'Suspicious network activity detected'
            },
            {
              time: '2024-01-15T11:15:00Z',
              event: 'Analysis started',
              description: 'Automated analysis initiated'
            },
            {
              time: '2024-01-15T12:00:00Z',
              event: 'Threat classified',
              description: 'Classified as high severity APT campaign'
            },
            {
              time: '2024-01-15T14:22:00Z',
              event: 'Response initiated',
              description: 'Incident response team notified'
            }
          ],
          recommendations: [
            'Immediately block all identified IP addresses and domains',
            'Scan all systems for the identified malware hash',
            'Review email logs for similar phishing attempts',
            'Update firewall rules to prevent similar attacks',
            'Conduct security awareness training for employees',
            'Monitor network traffic for indicators of compromise'
          ],
          tags: ['APT', 'Malware', 'Phishing', 'Financial', 'High-Risk'],
          references: [
            'https://example.com/threat-report-1',
            'https://example.com/ioc-analysis',
            'https://example.com/mitigation-guide'
          ],
          affectedSystems: [
            'Email Server (10.0.0.5)',
            'Web Server (10.0.0.10)',
            'Database Server (10.0.0.15)'
          ],
          mitigation: {
            status: 'in_progress',
            actions: [
              'Blocked malicious IPs at firewall',
              'Quarantined suspicious emails',
              'Initiated system scans'
            ],
            responsible: 'Security Operations Team'
          }
        };
        setThreat(mockThreat);
      }
    } catch (error) {
      console.error('Error fetching threat detail:', error);
      toast.error('Failed to load threat details');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return AlertTriangle;
      case 'medium': return Activity;
      case 'low': return Shield;
      default: return Shield;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#ef4444';
      case 'investigating': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'blocked': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const exportThreat = () => {
    const dataStr = JSON.stringify(threat, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `threat-${threat.id}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="threat-detail-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading threat details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!threat) {
    return (
      <div className="threat-detail-page">
        <div className="container">
          <div className="error-container">
            <h2>Threat not found</h2>
            <p>The requested threat could not be found.</p>
            <button className="btn btn-primary" onClick={() => navigate('/threats')}>
              Back to Threats
            </button>
          </div>
        </div>
      </div>
    );
  }

  const SeverityIcon = getSeverityIcon(threat.severity);

  return (
    <div className="threat-detail-page">
      <div className="container">
        <div className="page-header">
          <div className="header-nav">
            <button className="back-btn" onClick={() => navigate('/threats')}>
              <ArrowLeft size={18} />
              Back to Threats
            </button>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={() => copyToClipboard(window.location.href)}>
              {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button className="btn btn-outline" onClick={exportThreat}>
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        <div className="threat-overview">
          <div className="threat-header">
            <div className="threat-icon">
              <SeverityIcon 
                size={32} 
                style={{ color: getSeverityColor(threat.severity) }}
              />
            </div>
            <div className="threat-info">
              <h1 className="threat-title">{threat.title}</h1>
              <p className="threat-description">{threat.description}</p>
              <div className="threat-meta">
                <span 
                  className="severity-badge"
                  style={{ backgroundColor: getSeverityColor(threat.severity) }}
                >
                  {threat.severity} severity
                </span>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(threat.status) }}
                >
                  {threat.status}
                </span>
                <span className="confidence-badge">
                  {threat.confidence}% confidence
                </span>
              </div>
            </div>
          </div>

          <div className="threat-stats">
            <div className="stat-item">
              <Clock size={16} />
              <div>
                <span className="stat-label">Detected</span>
                <span className="stat-value">{formatTimestamp(threat.timestamp)}</span>
              </div>
            </div>
            <div className="stat-item">
              <User size={16} />
              <div>
                <span className="stat-label">Source</span>
                <span className="stat-value">{threat.source}</span>
              </div>
            </div>
            <div className="stat-item">
              <Globe size={16} />
              <div>
                <span className="stat-label">Type</span>
                <span className="stat-value">{threat.type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="threat-content">
          <div className="content-main">
            <div className="content-section">
              <h3>Indicators of Compromise (IOCs)</h3>
              <div className="indicators-grid">
                {threat.indicators.map((indicator, index) => (
                  <div key={index} className="indicator-card">
                    <div className="indicator-header">
                      <span className="indicator-type">{indicator.type}</span>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(indicator.value)}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <div className="indicator-value">{indicator.value}</div>
                    <div className="indicator-description">{indicator.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="content-section">
              <h3>Timeline</h3>
              <div className="timeline">
                {threat.timeline.map((item, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker" />
                    <div className="timeline-content">
                      <div className="timeline-time">{formatTimestamp(item.time)}</div>
                      <div className="timeline-event">{item.event}</div>
                      <div className="timeline-description">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="content-section">
              <h3>Recommendations</h3>
              <ul className="recommendations-list">
                {threat.recommendations.map((recommendation, index) => (
                  <li key={index} className="recommendation-item">
                    <CheckCircle size={16} className="recommendation-icon" />
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="content-sidebar">
            <div className="sidebar-section">
              <h4>Affected Systems</h4>
              <ul className="systems-list">
                {threat.affectedSystems.map((system, index) => (
                  <li key={index} className="system-item">{system}</li>
                ))}
              </ul>
            </div>

            <div className="sidebar-section">
              <h4>Mitigation Status</h4>
              <div className="mitigation-status">
                <div className="status-header">
                  <span 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(threat.mitigation.status) }}
                  />
                  <span className="status-text">{threat.mitigation.status}</span>
                </div>
                <div className="mitigation-actions">
                  {threat.mitigation.actions.map((action, index) => (
                    <div key={index} className="action-item">
                      <CheckCircle size={14} className="action-icon" />
                      {action}
                    </div>
                  ))}
                </div>
                <div className="responsible">
                  <span className="responsible-label">Responsible:</span>
                  <span className="responsible-value">{threat.mitigation.responsible}</span>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h4>Tags</h4>
              <div className="tags-container">
                {threat.tags.map((tag, index) => (
                  <span key={index} className="tag-badge">{tag}</span>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h4>References</h4>
              <div className="references-list">
                {threat.references.map((reference, index) => (
                  <a 
                    key={index} 
                    href={reference} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="reference-link"
                  >
                    <FileText size={14} />
                    Reference {index + 1}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatDetail;