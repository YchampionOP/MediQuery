import {
    Activity,
    Download,
    FileText,
    Heart,
    Pill
} from 'lucide-react';
import React, { useState } from 'react';
import MedicalDataVisualization from '../../components/Charts/MedicalDataVisualization';
import './PatientAnalytics.css';

const PatientAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [patientId, setPatientId] = useState<string>('patient-12345');
  const [filters, setFilters] = useState({
    metric: 'all',
    condition: 'all'
  });

  const handleExport = () => {
    // In a real application, this would export the data
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="patient-analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h1>Patient Analytics</h1>
          <p>Comprehensive health data visualization and insights</p>
        </div>
        <div className="header-actions">
          <button className="export-button" onClick={handleExport}>
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      <div className="analytics-controls">
        <div className="filter-section">
          <div className="filter-group">
            <label htmlFor="time-range">Time Range</label>
            <select 
              id="time-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="metric">Metric</label>
            <select 
              id="metric"
              value={filters.metric}
              onChange={(e) => setFilters({...filters, metric: e.target.value})}
            >
              <option value="all">All Metrics</option>
              <option value="vitals">Vital Signs</option>
              <option value="labs">Lab Results</option>
              <option value="medications">Medications</option>
              <option value="conditions">Conditions</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="condition">Condition</label>
            <select 
              id="condition"
              value={filters.condition}
              onChange={(e) => setFilters({...filters, condition: e.target.value})}
            >
              <option value="all">All Conditions</option>
              <option value="diabetes">Diabetes</option>
              <option value="hypertension">Hypertension</option>
              <option value="hyperlipidemia">Hyperlipidemia</option>
              <option value="heart-disease">Heart Disease</option>
            </select>
          </div>
        </div>

        <div className="patient-selector">
          <label htmlFor="patient-id">Patient ID</label>
          <input
            id="patient-id"
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="Enter patient ID"
          />
        </div>
      </div>

      <div className="analytics-summary">
        <div className="summary-card">
          <div className="card-icon">
            <Activity size={24} color="#3b82f6" />
          </div>
          <div className="card-content">
            <h3>Overall Health Score</h3>
            <p className="score">78/100</p>
            <span className="trend positive">+5 from last month</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <Heart size={24} color="#ef4444" />
          </div>
          <div className="card-content">
            <h3>Avg. Blood Pressure</h3>
            <p className="value">135/85 mmHg</p>
            <span className="trend positive">-10 mmHg from target</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <Pill size={24} color="#f59e0b" />
          </div>
          <div className="card-content">
            <h3>Medication Adherence</h3>
            <p className="value">92%</p>
            <span className="trend positive">+3% from last month</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <FileText size={24} color="#8b5cf6" />
          </div>
          <div className="card-content">
            <h3>Lab Results</h3>
            <p className="value">4 pending</p>
            <span className="trend">2 critical alerts</span>
          </div>
        </div>
      </div>

      <MedicalDataVisualization 
        patientId={patientId}
        timeRange={timeRange}
      />

      <div className="analytics-insights">
        <h2>Health Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h3>🔔 Improvement Notice</h3>
            <p>Your blood pressure has improved significantly over the past month. Continue with your current medication regimen and lifestyle modifications.</p>
            <div className="insight-footer">
              <span className="insight-type positive">Positive Trend</span>
              <span className="insight-date">Updated today</span>
            </div>
          </div>

          <div className="insight-card">
            <h3>⚠️ Attention Required</h3>
            <p>Your HbA1c is still above target. Consider discussing medication adjustments with your healthcare provider at your next visit.</p>
            <div className="insight-footer">
              <span className="insight-type warning">Needs Attention</span>
              <span className="insight-date">Updated 2 days ago</span>
            </div>
          </div>

          <div className="insight-card">
            <h3>💡 Recommendation</h3>
            <p>Increase physical activity to 150 minutes per week to help manage both blood pressure and blood sugar levels.</p>
            <div className="insight-footer">
              <span className="insight-type info">Suggestion</span>
              <span className="insight-date">Based on latest guidelines</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAnalytics;