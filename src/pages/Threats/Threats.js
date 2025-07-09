import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  RefreshCw,
  ChevronDown,
  AlertTriangle,
  Shield,
  Activity,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import './Threats.css';

const Threats = () => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data - replace with actual API call
  const mockThreats = [
    {
      id: 1,
      title: 'Malicious Email Campaign Detected',
      description: 'Phishing campaign targeting financial institutions with credential harvesting',
      severity: 'high',
      type: 'phishing',
      source: 'Email Security',
      timestamp: '2024-01-15T10:30:00Z',
      indicators: ['suspicious-email@example.com', '192.168.1.100'],
      status: 'active'
    },
    {
      id: 2,
      title: 'Suspicious Network Activity',
      description: 'Unusual outbound traffic pattern detected from internal network',
      severity: 'medium',
      type: 'network',
      source: 'Network Monitor',
      timestamp: '2024-01-15T09:15:00Z',
      indicators: ['192.168.1.50', 'tcp:443'],
      status: 'investigating'
    },
    {
      id: 3,
      title: 'Potential Data Exfiltration',
      description: 'Large data transfer to external server detected',
      severity: 'high',
      type: 'data_exfiltration',
      source: 'DLP System',
      timestamp: '2024-01-15T08:45:00Z',
      indicators: ['ftp://external-server.com', '10.0.0.25'],
      status: 'resolved'
    },
    {
      id: 4,
      title: 'Malware Signature Match',
      description: 'Known malware hash detected in system scan',
      severity: 'high',
      type: 'malware',
      source: 'Antivirus',
      timestamp: '2024-01-15T07:20:00Z',
      indicators: ['md5:5d41402abc4b2a76b9719d911017c592'],
      status: 'active'
    },
    {
      id: 5,
      title: 'Brute Force Attack Attempt',
      description: 'Multiple failed login attempts from single IP address',
      severity: 'medium',
      type: 'brute_force',
      source: 'Auth System',
      timestamp: '2024-01-15T06:10:00Z',
      indicators: ['203.0.113.0', 'admin'],
      status: 'blocked'
    }
  ];

  useEffect(() => {
    fetchThreats();
  }, []);

  const fetchThreats = async () => {
    try {
      setLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setThreats(mockThreats);
    } catch (error) {
      console.error('Error fetching threats:', error);
      toast.error('Failed to load threats');
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

  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || threat.severity === filterSeverity;
    const matchesType = filterType === 'all' || threat.type === filterType;
    
    return matchesSearch && matchesSeverity && matchesType;
  });

  const sortedThreats = [...filteredThreats].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const paginatedThreats = sortedThreats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedThreats.length / itemsPerPage);

  return (
    <div className="threats-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">PrajwalSec Threat Intelligence</h1>
            <p className="page-subtitle">
              Monitor and analyze cybersecurity threats across your organization
            </p>
          </div>
          <div className="page-actions">
            <button className="btn btn-outline" onClick={fetchThreats}>
              <RefreshCw size={18} />
              Refresh
            </button>
            <button className="btn btn-outline">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        <div className="threats-filters">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search threats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <div className="filter-group">
              <label>Severity</label>
              <select 
                value={filterSeverity} 
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Type</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="phishing">Phishing</option>
                <option value="malware">Malware</option>
                <option value="network">Network</option>
                <option value="data_exfiltration">Data Exfiltration</option>
                <option value="brute_force">Brute Force</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="timestamp">Timestamp</option>
                <option value="severity">Severity</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        </div>

        <div className="threats-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p>Loading threats...</p>
            </div>
          ) : (
            <>
              <div className="threats-list">
                {paginatedThreats.map((threat) => {
                  const SeverityIcon = getSeverityIcon(threat.severity);
                  return (
                    <div key={threat.id} className="threat-card">
                      <div className="threat-header">
                        <div className="threat-severity">
                          <SeverityIcon 
                            size={20} 
                            style={{ color: getSeverityColor(threat.severity) }} 
                          />
                          <span 
                            className="severity-badge"
                            style={{ backgroundColor: getSeverityColor(threat.severity) }}
                          >
                            {threat.severity}
                          </span>
                        </div>
                        <div className="threat-actions">
                          <Link to={`/threat/${threat.id}`} className="action-btn">
                            <Eye size={16} />
                          </Link>
                        </div>
                      </div>
                      
                      <div className="threat-content">
                        <h3 className="threat-title">{threat.title}</h3>
                        <p className="threat-description">{threat.description}</p>
                        
                        <div className="threat-meta">
                          <div className="meta-item">
                            <Clock size={14} />
                            <span>{formatTimestamp(threat.timestamp)}</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-label">Source:</span>
                            <span>{threat.source}</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-label">Type:</span>
                            <span className="type-badge">{threat.type}</span>
                          </div>
                        </div>
                        
                        <div className="threat-indicators">
                          <span className="indicators-label">Indicators:</span>
                          <div className="indicators-list">
                            {threat.indicators.map((indicator, index) => (
                              <span key={index} className="indicator-badge">
                                {indicator}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="threat-status">
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(threat.status) }}
                          >
                            {threat.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </button>
                  
                  <div className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <button 
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Threats;