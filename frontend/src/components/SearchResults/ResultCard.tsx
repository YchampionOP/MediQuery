import React from 'react';
import { SearchResult, UserRole } from '@types/index';
import './ResultCard.css';

interface ResultCardProps {
  result: SearchResult;
  userRole: UserRole;
  viewMode: 'card' | 'list' | 'compact';
  onClick: () => void;
  metadata: Record<string, any>;
}

const ResultCard: React.FC<ResultCardProps> = ({
  result,
  userRole,
  viewMode,
  onClick,
  metadata
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'patient': return '👤';
      case 'clinical-note': return '📋';
      case 'lab-result': return '🧪';
      case 'medication': return '💊';
      case 'research': return '📚';
      default: return '📄';
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return '#4CAF50'; // Green
    if (score >= 0.6) return '#FF9800'; // Orange
    return '#757575'; // Gray
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const highlightText = (text: string, highlights: string[]) => {
    if (!highlights.length) return text;
    
    let highlightedText = text;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return { __html: highlightedText };
  };

  const renderMetadataForRole = () => {
    if (userRole === 'patient') {
      // Simplified metadata for patients
      return (
        <div className="result-metadata patient">
          <span className="metadata-item">
            📅 {formatTimestamp(result.timestamp)}
          </span>
          <span className="metadata-item">
            🏥 {result.source}
          </span>
        </div>
      );
    }

    // Detailed metadata for clinicians
    return (
      <div className="result-metadata clinician">
        {metadata.patientId && (
          <span className="metadata-item">
            👤 Patient: {metadata.patientId}
          </span>
        )}
        {metadata.department && (
          <span className="metadata-item">
            🏥 {metadata.department}
          </span>
        )}
        {metadata.orderingPhysician && (
          <span className="metadata-item">
            👨‍⚕️ {metadata.orderingPhysician}
          </span>
        )}
        <span className="metadata-item">
          📅 {formatTimestamp(result.timestamp)}
        </span>
        <span className="metadata-item">
          📊 Relevance: {Math.round(result.relevanceScore * 100)}%
        </span>
      </div>
    );
  };

  if (viewMode === 'compact') {
    return (
      <div className="result-card compact" onClick={onClick}>
        <div className="result-header">
          <span className="result-icon">{getTypeIcon(result.type)}</span>
          <span className="result-title">{result.title}</span>
          <span 
            className="relevance-score"
            style={{ color: getRelevanceColor(result.relevanceScore) }}
          >
            {Math.round(result.relevanceScore * 100)}%
          </span>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="result-card list" onClick={onClick}>
        <div className="result-content">
          <div className="result-header">
            <span className="result-icon">{getTypeIcon(result.type)}</span>
            <h4 className="result-title">{result.title}</h4>
            <span 
              className="relevance-score"
              style={{ color: getRelevanceColor(result.relevanceScore) }}
            >
              {Math.round(result.relevanceScore * 100)}%
            </span>
          </div>
          
          <p 
            className="result-summary"
            dangerouslySetInnerHTML={highlightText(result.summary, result.highlights)}
          />
          
          {renderMetadataForRole()}
        </div>
      </div>
    );
  }

  // Default card view
  return (
    <div className="result-card card" onClick={onClick}>
      <div className="result-header">
        <div className="result-type">
          <span className="result-icon">{getTypeIcon(result.type)}</span>
          <span className="result-type-label">{result.type.replace('-', ' ')}</span>
        </div>
        <div 
          className="relevance-score"
          style={{ backgroundColor: getRelevanceColor(result.relevanceScore) }}
        >
          {Math.round(result.relevanceScore * 100)}%
        </div>
      </div>
      
      <div className="result-content">
        <h4 className="result-title">{result.title}</h4>
        
        <p 
          className="result-summary"
          dangerouslySetInnerHTML={highlightText(result.summary, result.highlights)}
        />
        
        {result.highlights.length > 0 && (
          <div className="result-highlights">
            <span className="highlights-label">Key terms:</span>
            {result.highlights.map((highlight, index) => (
              <span key={index} className="highlight-tag">
                {highlight}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="result-footer">
        {renderMetadataForRole()}
        <div className="result-source">
          📋 {result.source}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;