import React from 'react';
import { TimelineEvent, UserRole } from '@types/index';
import './PatientTimeline.css';

interface PatientTimelineProps {
  events: TimelineEvent[];
  userRole: UserRole;
  patientId: string;
  dateRange?: {
    start: string;
    end: string;
  };
  onEventClick?: (event: TimelineEvent) => void;
  onDateRangeChange?: (start: string, end: string) => void;
}

const PatientTimeline: React.FC<PatientTimelineProps> = ({
  events,
  userRole,
  patientId,
  dateRange,
  onEventClick,
  onDateRangeChange
}) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'admission': return '🏥';
      case 'diagnosis': return '🔍';
      case 'medication': return '💊';
      case 'lab': return '🧪';
      case 'procedure': return '⚕️';
      case 'note': return '📝';
      default: return '📄';
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const formatEventDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const groupEventsByDate = (events: TimelineEvent[]) => {
    const grouped: { [key: string]: TimelineEvent[] } = {};
    
    events.forEach(event => {
      const date = new Date(event.timestamp).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    
    return grouped;
  };

  const renderEventForRole = (event: TimelineEvent) => {
    if (userRole === 'patient') {
      // Simplified view for patients
      return (
        <div className="timeline-event-content patient-view">
          <h4>{event.title}</h4>
          <p>{event.description}</p>
          {event.category && (
            <span className="event-category">{event.category}</span>
          )}
        </div>
      );
    }

    // Detailed view for clinicians
    return (
      <div className="timeline-event-content clinician-view">
        <div className="event-header">
          <h4>{event.title}</h4>
          <span 
            className="significance-badge"
            style={{ backgroundColor: getSignificanceColor(event.significance) }}
          >
            {event.significance}
          </span>
        </div>
        <p>{event.description}</p>
        <div className="event-metadata">
          <span className="event-category">{event.category}</span>
          {event.relatedItems && event.relatedItems.length > 0 && (
            <span className="related-items">
              Related: {event.relatedItems.length} items
            </span>
          )}
        </div>
      </div>
    );
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const groupedEvents = groupEventsByDate(sortedEvents);

  return (
    <div className="patient-timeline">
      <div className="timeline-header">
        <h3>Patient Timeline</h3>
        
        {onDateRangeChange && (
          <div className="date-range-filter">
            <input
              type="date"
              value={dateRange?.start || ''}
              onChange={(e) => onDateRangeChange(e.target.value, dateRange?.end || '')}
              max={new Date().toISOString().split('T')[0]}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange?.end || ''}
              onChange={(e) => onDateRangeChange(dateRange?.start || '', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        )}
      </div>

      <div className="timeline-stats">
        <div className="stat">
          <span className="stat-value">{events.length}</span>
          <span className="stat-label">Total Events</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {events.filter(e => e.significance === 'high').length}
          </span>
          <span className="stat-label">High Priority</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {Object.keys(groupedEvents).length}
          </span>
          <span className="stat-label">Days with Events</span>
        </div>
      </div>

      <div className="timeline-container">
        {Object.entries(groupedEvents).map(([date, dayEvents]) => (
          <div key={date} className="timeline-day">
            <div className="timeline-date">
              <span className="date-label">{new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}</span>
              <span className="events-count">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="timeline-events">
              {dayEvents.map((event, index) => {
                const eventTime = formatEventDate(event.timestamp);
                
                return (
                  <div 
                    key={event.id} 
                    className={`timeline-event ${event.significance} ${onEventClick ? 'clickable' : ''}`}
                    onClick={() => onEventClick && onEventClick(event)}
                  >
                    <div className="timeline-marker">
                      <span className="event-icon">{getEventIcon(event.type)}</span>
                    </div>
                    
                    <div className="timeline-content">
                      <div className="event-time">{eventTime.time}</div>
                      {renderEventForRole(event)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="timeline-empty">
          <p>No timeline events found for this patient.</p>
        </div>
      )}
    </div>
  );
};

export default PatientTimeline;