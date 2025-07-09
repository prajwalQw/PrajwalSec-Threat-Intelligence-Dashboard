import React, { useState, useEffect } from 'react';
import { Send, Loader, CheckCircle, AlertCircle, Info, Upload, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import './Analysis.css';

const Analysis = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [charCount, setCharCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  const maxChars = 5000;

  const sampleTexts = [
    'Suspicious email received from unknown sender with attachment',
    'Multiple failed login attempts detected from IP 192.168.1.100',
    'Unusual network traffic to external server at 3 AM',
    'File with suspicious hash detected in downloads folder'
  ];

  useEffect(() => {
    setCharCount(inputText.length);
    
    // Show suggestions if input is empty
    if (inputText.trim() === '') {
      setSuggestions(sampleTexts);
    } else {
      setSuggestions([]);
    }
  }, [inputText]);

  const handleAnalysis = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual analysis endpoint
      const response = await fetch('/api/analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
      } else {
        // Mock analysis result for demo
        const mockResult = {
          threatLevel: Math.random() > 0.5 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          confidence: Math.floor(Math.random() * 30) + 70,
          category: ['malware', 'phishing', 'network_intrusion', 'data_breach'][Math.floor(Math.random() * 4)],
          indicators: [
            'Suspicious file hash detected',
            'Known malicious IP address',
            'Unusual network pattern'
          ],
          recommendations: [
            'Block the identified IP address',
            'Run full system scan',
            'Review network logs for similar patterns',
            'Update security policies'
          ],
          timestamp: new Date().toISOString()
        };
        setAnalysisResult(mockResult);
      }

      // Add to history
      const newHistoryItem = {
        id: Date.now(),
        text: inputText,
        result: analysisResult,
        timestamp: new Date().toISOString()
      };
      
      setAnalysisHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
      toast.success('Analysis completed successfully');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion);
    setSuggestions([]);
  };

  const handleClear = () => {
    setInputText('');
    setAnalysisResult(null);
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const getThreatLevelIcon = (level) => {
    switch (level) {
      case 'high': return AlertCircle;
      case 'medium': return AlertCircle;
      case 'low': return CheckCircle;
      default: return Info;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="analysis-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">PrajwalSec Threat Analysis</h1>
            <p className="page-subtitle">
              Analyze text for potential cybersecurity threats using advanced ML models
            </p>
          </div>
        </div>

        <div className="analysis-container">
          <div className="analysis-input-section">
            <div className="input-card">
              <div className="input-header">
                <h3>Enter Text for Analysis</h3>
                <div className="char-counter">
                  <span className={charCount > maxChars ? 'over-limit' : ''}>{charCount}</span>
                  <span>/{maxChars}</span>
                </div>
              </div>
              
              <div className="input-wrapper">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter suspicious text, log entries, email content, or any cybersecurity-related information for analysis..."
                  className="analysis-textarea"
                  maxLength={maxChars}
                />
                
                {suggestions.length > 0 && (
                  <div className="suggestions">
                    <p className="suggestions-title">Try these examples:</p>
                    <div className="suggestions-list">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="suggestion-btn"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="input-actions">
                <button
                  className="btn btn-outline"
                  onClick={handleClear}
                  disabled={!inputText.trim()}
                >
                  Clear
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAnalysis}
                  disabled={loading || !inputText.trim() || charCount > maxChars}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="analysis-results-section">
            {analysisResult && (
              <div className="results-card">
                <div className="results-header">
                  <h3>Analysis Results</h3>
                  <span className="analysis-time">
                    {formatTimestamp(analysisResult.timestamp)}
                  </span>
                </div>
                
                <div className="threat-level-section">
                  <div className="threat-level-display">
                    <div 
                      className="threat-level-icon"
                      style={{ backgroundColor: `${getThreatLevelColor(analysisResult.threatLevel)}20` }}
                    >
                      {React.createElement(getThreatLevelIcon(analysisResult.threatLevel), {
                        size: 24,
                        style: { color: getThreatLevelColor(analysisResult.threatLevel) }
                      })}
                    </div>
                    <div className="threat-level-info">
                      <h4>Threat Level</h4>
                      <span 
                        className="threat-level-badge"
                        style={{ backgroundColor: getThreatLevelColor(analysisResult.threatLevel) }}
                      >
                        {analysisResult.threatLevel}
                      </span>
                    </div>
                  </div>
                  
                  <div className="confidence-section">
                    <div className="confidence-label">
                      Confidence: {analysisResult.confidence}%
                    </div>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill"
                        style={{ 
                          width: `${analysisResult.confidence}%`,
                          backgroundColor: getThreatLevelColor(analysisResult.threatLevel)
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="analysis-details">
                  <div className="detail-section">
                    <h4>Category</h4>
                    <span className="category-badge">{analysisResult.category}</span>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Indicators</h4>
                    <ul className="indicators-list">
                      {analysisResult.indicators.map((indicator, index) => (
                        <li key={index} className="indicator-item">
                          <CheckCircle size={16} className="indicator-icon" />
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Recommendations</h4>
                    <ul className="recommendations-list">
                      {analysisResult.recommendations.map((recommendation, index) => (
                        <li key={index} className="recommendation-item">
                          <Info size={16} className="recommendation-icon" />
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {analysisHistory.length > 0 && (
              <div className="history-card">
                <h3>Analysis History</h3>
                <div className="history-list">
                  {analysisHistory.map((item) => (
                    <div key={item.id} className="history-item">
                      <div className="history-header">
                        <span className="history-time">
                          {formatTimestamp(item.timestamp)}
                        </span>
                        <span 
                          className="history-threat-level"
                          style={{ 
                            backgroundColor: item.result ? getThreatLevelColor(item.result.threatLevel) : '#6b7280'
                          }}
                        >
                          {item.result ? item.result.threatLevel : 'unknown'}
                        </span>
                      </div>
                      <p className="history-text">
                        {item.text.substring(0, 100)}
                        {item.text.length > 100 ? '...' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;