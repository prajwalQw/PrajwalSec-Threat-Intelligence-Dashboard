import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Eye,
  ArrowRight,
  RefreshCw,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { toast } from 'react-toastify';
import LiveFeed from '../../components/LiveFeed/LiveFeed';
import './Dashboard.css';

const Dashboard = ({ socket }) => {
  const [stats, setStats] = useState({
    totalThreats: 0,
    highSeverity: 0,
    mediumSeverity: 0,
    lowSeverity: 0,
    recentAnalyses: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentThreats, setRecentThreats] = useState([]);

  // Mock data for charts
  const severityData = [
    { name: 'High', value: 45, color: '#ef4444' },
    { name: 'Medium', value: 120, color: '#f59e0b' },
    { name: 'Low', value: 85, color: '#10b981' },
    { name: 'Info', value: 30, color: '#3b82f6' }
  ];

  const trendData = [
    { name: 'Mon', threats: 12, analyses: 8 },
    { name: 'Tue', threats: 19, analyses: 14 },
    { name: 'Wed', threats: 15, analyses: 11 },
    { name: 'Thu', threats: 22, analyses: 18 },
    { name: 'Fri', threats: 18, analyses: 15 },
    { name: 'Sat', threats: 8, analyses: 6 },
    { name: 'Sun', threats: 14, analyses: 10 }
  ];

  const activityData = [
    { time: '00:00', activity: 12 },
    { time: '04:00', activity: 8 },
    { time: '08:00', activity: 25 },
    { time: '12:00', activity: 18 },
    { time: '16:00', activity: 22 },
    { time: '20:00', activity: 15 }
  ];

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual API endpoints
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Mock data for demo
        setStats({
          totalThreats: 280,
          highSeverity: 45,
          mediumSeverity: 120,
          lowSeverity: 85,
          recentAnalyses: 156
        });
      }
      
      // Fetch recent threats
      const threatsResponse = await fetch('/api/threats/recent');
      if (threatsResponse.ok) {
        const threatsData = await threatsResponse.json();
        setRecentThreats(threatsData);
      } else {
        // Mock data
        setRecentThreats([
          {
            id: 1,
            title: 'Malicious Email Campaign Detected',
            severity: 'high',
            timestamp: new Date().toISOString(),
            source: 'Email Security'
          },
          {
            id: 2,
            title: 'Suspicious Network Activity',
            severity: 'medium',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            source: 'Network Monitor'
          },
          {
            id: 3,
            title: 'Potential Data Exfiltration',
            severity: 'high',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            source: 'DLP System'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon-container" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
        <div className="stat-info">
          <h3 className="stat-title">{title}</h3>
          <div className="stat-value">{loading ? <div className="loading-spinner" /> : value}</div>
          {subtitle && <p className="stat-subtitle">{subtitle}</p>}
          }
        </div>
      </div>
      {trend && (
        <div className="stat-trend">
          <TrendingUp size={16} className="trend-icon" />
          <span className="trend-text">{trend}</span>
        </div>
      )}
    </div>
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">PrajwalSec Intelligence Dashboard</h1>
            <p className="dashboard-subtitle">
              Monitor and analyze cybersecurity threats in real-time
            </p>
          </div>
          <div className="dashboard-actions">
            <button className="btn btn-outline" onClick={fetchDashboardData}>
              <RefreshCw size={18} />
              Refresh
            </button>
            <button className="btn btn-outline">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        <div className="grid grid-4 mb-6">
          <StatCard
            title="Total Threats"
            value={stats.totalThreats}
            icon={Shield}
            color="#3b82f6"
            trend="+12% from last week"
          />
          <StatCard
            title="High Severity"
            value={stats.highSeverity}
            icon={AlertTriangle}
            color="#ef4444"
            trend="+5% from yesterday"
          />
          <StatCard
            title="Medium Severity"
            value={stats.mediumSeverity}
            icon={Activity}
            color="#f59e0b"
            trend="-8% from yesterday"
          />
          <StatCard
            title="Recent Analyses"
            value={stats.recentAnalyses}
            icon={TrendingUp}
            color="#10b981"
            trend="+25% from last week"
          />
        </div>

        <div className="grid grid-2 mb-6">
          <div className="card p-6">
            <h3 className="chart-title">Threat Severity Distribution</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="chart-title">Weekly Threat Trends</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="threats" fill="#3b82f6" />
                  <Bar dataKey="analyses" fill="#14b8a6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="card p-6">
            <h3 className="chart-title">Threat Activity (24h)</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="activity" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <LiveFeed socket={socket} />
        </div>
        
        <div className="grid grid-1 mt-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="chart-title">Recent Threats</h3>
              <Link to="/threats" className="text-link">
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="recent-threats">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner" />
                </div>
              ) : (
                recentThreats.map((threat) => (
                  <div key={threat.id} className="threat-item">
                    <div className="threat-info">
                      <h4 className="threat-title">{threat.title}</h4>
                      <p className="threat-source">{threat.source}</p>
                      <p className="threat-time">{formatTime(threat.timestamp)}</p>
                    </div>
                    <div className="threat-actions">
                      <span 
                        className={`badge severity-${threat.severity}`}
                        style={{ backgroundColor: getSeverityColor(threat.severity) }}
                      >
                        {threat.severity}
                      </span>
                      <Link to={`/threat/${threat.id}`} className="view-btn">
                        <Eye size={16} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;