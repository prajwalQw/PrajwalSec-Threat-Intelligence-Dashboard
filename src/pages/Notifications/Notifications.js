import React, { useState, useEffect } from 'react';
import { Bell, Filter, Check, CheckCheck, AlertTriangle, Shield, Activity, Info, Clock, User } from 'lucide-react';
import { toast } from 'react-toastify';
import './Notifications.css';

const Notifications = ({ socket }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    unread_count: 0,
    total_count: 0,
    severity_counts: {}
  });

  useEffect(() => {
    fetchNotifications();
    fetchNotificationStats();
    
    // Set up WebSocket listeners
    if (socket) {
      socket.on('new_notification', handleNewNotification);
      socket.emit('join_notifications');
    }
    
    return () => {
      if (socket) {
        socket.off('new_notification', handleNewNotification);
      }
    };
  }, [socket, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const url = filter === 'unread' 
        ? '/api/notifications?unread_only=true&limit=50'
        : '/api/notifications?limit=50';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const response = await fetch('/api/notifications/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setStats(prev => ({
      ...prev,
      unread_count: prev.unread_count + 1,
      total_count: prev.total_count + 1
    }));
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
        setStats(prev => ({
          ...prev,
          unread_count: Math.max(0, prev.unread_count - 1)
        }));
        toast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      for (const notification of unreadNotifications) {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PUT'
        });
      }
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setStats(prev => ({ ...prev, unread_count: 0 }));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return AlertTriangle;
      case 'medium': return Activity;
      case 'low': return Shield;
      default: return Info;
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

  const getTypeLabel = (type) => {
    switch (type) {
      case 'threat_analyzed': return 'Analysis';
      case 'new_threat': return 'New Threat';
      case 'system_alert': return 'System Alert';
      default: return 'Notification';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getUserDisplayName = (userId) => {
    switch (userId) {
      case 'system': return 'System';
      case 'analyst': return 'Security Analyst';
      default: return userId;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'high') return notification.severity === 'high';
    if (filter === 'medium') return notification.severity === 'medium';
    if (filter === 'low') return notification.severity === 'low';
    return true;
  });

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">PrajwalSec Notifications</h1>
            <p className="page-subtitle">
              Stay updated with real-time security alerts and system activities
            </p>
          </div>
          <div className="page-actions">
            {stats.unread_count > 0 && (
              <button className="btn btn-outline" onClick={markAllAsRead}>
                <CheckCheck size={18} />
                Mark All Read ({stats.unread_count})
              </button>
            )}
          </div>
        </div>

        <div className="notifications-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Bell size={24} style={{ color: '#3b82f6' }} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.total_count}</div>
              <div className="stat-label">Total Notifications</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <AlertTriangle size={24} style={{ color: '#ef4444' }} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.unread_count}</div>
              <div className="stat-label">Unread</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Activity size={24} style={{ color: '#f59e0b' }} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.severity_counts.high || 0}</div>
              <div className="stat-label">High Priority</div>
            </div>
          </div>
        </div>

        <div className="notifications-filters">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({stats.total_count})
            </button>
            <button 
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({stats.unread_count})
            </button>
            <button 
              className={`filter-tab ${filter === 'high' ? 'active' : ''}`}
              onClick={() => setFilter('high')}
            >
              High ({stats.severity_counts.high || 0})
            </button>
            <button 
              className={`filter-tab ${filter === 'medium' ? 'active' : ''}`}
              onClick={() => setFilter('medium')}
            >
              Medium ({stats.severity_counts.medium || 0})
            </button>
            <button 
              className={`filter-tab ${filter === 'low' ? 'active' : ''}`}
              onClick={() => setFilter('low')}
            >
              Low ({stats.severity_counts.low || 0})
            </button>
          </div>
        </div>

        <div className="notifications-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <Bell size={64} />
              <h3>No notifications found</h3>
              <p>
                {filter === 'all' 
                  ? 'No notifications have been received yet'
                  : `No ${filter} notifications found`
                }
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map((notification) => {
                const SeverityIcon = getSeverityIcon(notification.severity);
                return (
                  <div 
                    key={notification.id}
                    className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
                  >
                    <div className="notification-icon">
                      <SeverityIcon 
                        size={24} 
                        style={{ color: getSeverityColor(notification.severity) }}
                      />
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <div className="notification-meta">
                          <span className="notification-type">
                            {getTypeLabel(notification.type)}
                          </span>
                          <span 
                            className="notification-severity"
                            style={{ 
                              backgroundColor: getSeverityColor(notification.severity),
                              color: 'white'
                            }}
                          >
                            {notification.severity}
                          </span>
                        </div>
                        <div className="notification-time">
                          <Clock size={14} />
                          {formatTimestamp(notification.timestamp)}
                        </div>
                      </div>
                      <h3 className="notification-title">{notification.title}</h3>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-footer">
                        <div className="notification-user">
                          <User size={14} />
                          {getUserDisplayName(notification.user_id)}
                        </div>
                        {notification.metadata?.category && (
                          <div className="notification-category">
                            Category: {notification.metadata.category}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="notification-actions">
                      {!notification.is_read && (
                        <button 
                          className="mark-read-btn"
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;