import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Shield, Info, Clock, User } from 'lucide-react';
import './LiveFeed.css';

const LiveFeed = ({ socket }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('new_notification', (notification) => {
        const feedItem = {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          severity: notification.severity,
          user_id: notification.user_id,
          timestamp: notification.timestamp,
          metadata: notification.metadata || {}
        };
        
        setFeedItems(prev => [feedItem, ...prev.slice(0, 49)]);
      });

      socket.emit('join_notifications');
    }

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('new_notification');
      }
    };
  }, [socket]);

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
      default: return 'Activity';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getUserDisplayName = (userId) => {
    switch (userId) {
      case 'system': return 'System';
      case 'analyst': return 'Security Analyst';
      default: return userId;
    }
  };

  return (
    <div className="live-feed">
      <div className="live-feed-header">
        <div className="feed-title">
          <Activity size={20} />
          <h3>Live Activity Feed</h3>
        </div>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <div className="status-indicator" />
          <span>{isConnected ? 'Live' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="live-feed-content">
        {feedItems.length === 0 ? (
          <div className="feed-empty">
            <Activity size={48} />
            <p>Waiting for activity...</p>
            <span>Live updates will appear here</span>
          </div>
        ) : (
          <div className="feed-items">
            {feedItems.map((item) => {
              const SeverityIcon = getSeverityIcon(item.severity);
              return (
                <div key={`${item.id}-${item.timestamp}`} className="feed-item">
                  <div className="feed-item-icon">
                    <SeverityIcon 
                      size={16} 
                      style={{ color: getSeverityColor(item.severity) }}
                    />
                  </div>
                  <div className="feed-item-content">
                    <div className="feed-item-header">
                      <span className="feed-item-type">{getTypeLabel(item.type)}</span>
                      <span className="feed-item-time">
                        <Clock size={12} />
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    <div className="feed-item-title">{item.title}</div>
                    <div className="feed-item-message">{item.message}</div>
                    <div className="feed-item-footer">
                      <div className="feed-item-user">
                        <User size={12} />
                        {getUserDisplayName(item.user_id)}
                      </div>
                      {item.metadata.category && (
                        <div className="feed-item-category">
                          Category: {item.metadata.category}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveFeed;