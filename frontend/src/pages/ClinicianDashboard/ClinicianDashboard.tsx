import {
    Activity,
    AlertCircle,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileText,
    RefreshCw,
    Search,
    Stethoscope,
    TrendingUp,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ClinicianDashboard.css';

const ClinicianDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const [stats, setStats] = useState({
    activePatients: 247,
    pendingNotes: 8,
    criticalAlerts: 3,
    todayActivity: 15,
    patientSatisfaction: 92,
    avgVisitTime: 18
  });

  const [recentPatients, setRecentPatients] = useState([
    {
      id: '1',
      name: 'John Smith',
      condition: 'Type 2 Diabetes',
      lastVisit: '2 days ago',
      status: 'critical',
      value: 'HbA1c: 8.2%',
      avatar: 'JS'
    },
    {
      id: '2',
      name: 'Maria Garcia',
      condition: 'Hypertension',
      lastVisit: '1 week ago',
      status: 'warning',
      value: 'BP: 145/92',
      avatar: 'MG'
    },
    {
      id: '3',
      name: 'Robert Chen',
      condition: 'Post-op follow-up',
      lastVisit: '3 days ago',
      status: 'normal',
      value: 'Recovering well',
      avatar: 'RC'
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      condition: 'Annual checkup',
      lastVisit: '5 days ago',
      status: 'normal',
      value: 'All normal',
      avatar: 'SW'
    }
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: '1',
      type: 'critical',
      title: 'Critical Lab Value',
      description: 'Patient #12345 - Troponin I: 15.2 ng/mL',
      time: '15 minutes ago',
      priority: 'high'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Drug Interaction',
      description: 'Warfarin + Aspirin for Patient #67890',
      time: '2 hours ago',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'info',
      title: 'Overdue Follow-up',
      description: '5 patients require diabetes follow-up',
      time: '1 day ago',
      priority: 'low'
    }
  ]);

  const [researchUpdates, setResearchUpdates] = useState([
    {
      id: '1',
      title: 'New Guidelines for Diabetes Management',
      description: 'Updated HbA1c targets for elderly patients with multiple comorbidities',
      date: 'Published today',
      category: 'Endocrinology'
    },
    {
      id: '2',
      title: 'ACE Inhibitor Effectiveness Study',
      description: 'Large-scale meta-analysis shows 23% reduction in cardiovascular events',
      date: '2 days ago',
      category: 'Cardiology'
    },
    {
      id: '3',
      title: 'AI in Diagnostic Imaging',
      description: 'Machine learning models improve early detection of lung cancer by 15%',
      date: '1 week ago',
      category: 'Radiology'
    }
  ]);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="clinician-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Clinical Dashboard</h1>
            <p>Welcome back, Dr. Johnson. Here's your clinical overview for today.</p>
          </div>
          <div className="header-actions">
            <button className="refresh-button" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button className="export-button">
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>
        
        <div className="dashboard-filters">
          <div className="filter-group">
            <label>Time Range:</label>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Department:</label>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
              <option value="all">All Departments</option>
              <option value="cardiology">Cardiology</option>
              <option value="endocrinology">Endocrinology</option>
              <option value="internal">Internal Medicine</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Quick Stats */}
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-icon patients">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>Active Patients</h3>
              <p className="stat-number">{stats.activePatients}</p>
              <span className="stat-change positive">+12 this week</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon notes">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <h3>Pending Notes</h3>
              <p className="stat-number">{stats.pendingNotes}</p>
              <span className="stat-change neutral">Due today</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon alerts">
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>Critical Alerts</h3>
              <p className="stat-number">{stats.criticalAlerts}</p>
              <span className="stat-change urgent">Requires attention</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon activity">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <h3>Today's Activity</h3>
              <p className="stat-number">{stats.todayActivity}</p>
              <span className="stat-change positive">Consultations</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon satisfaction">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>Patient Satisfaction</h3>
              <p className="stat-number">{stats.patientSatisfaction}%</p>
              <span className="stat-change positive">+3% this month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon time">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>Avg. Visit Time</h3>
              <p className="stat-number">{stats.avgVisitTime} min</p>
              <span className="stat-change negative">-2 min from target</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/chat" className="action-button">
              <Search size={20} />
              <span>Search Patients</span>
            </Link>
            
            <Link to="/search" className="action-button">
              <BarChart3 size={20} />
              <span>Clinical Analytics</span>
            </Link>
            
            <button className="action-button">
              <Calendar size={20} />
              <span>Schedule Review</span>
            </button>
            
            <button className="action-button">
              <TrendingUp size={20} />
              <span>Quality Metrics</span>
            </button>
            
            <button className="action-button">
              <Stethoscope size={20} />
              <span>New Consultation</span>
            </button>
            
            <button className="action-button">
              <Eye size={20} />
              <span>Case Review</span>
            </button>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="recent-patients">
          <div className="section-header">
            <h2>Recent Patients</h2>
            <Link to="/patients" className="view-all">View All</Link>
          </div>
          <div className="patient-list">
            {recentPatients.map((patient) => (
              <div className="patient-item" key={patient.id}>
                <div className="patient-avatar">
                  {patient.avatar}
                </div>
                <div className="patient-info">
                  <h4>{patient.name}</h4>
                  <p>{patient.condition} • Last visit: {patient.lastVisit}</p>
                </div>
                <div className="patient-status">
                  <span className={`status-badge ${patient.status}`}>{patient.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Alerts */}
        <div className="clinical-alerts">
          <div className="section-header">
            <h2>Clinical Alerts</h2>
            <button className="view-all">Manage Alerts</button>
          </div>
          <div className="alert-list">
            {alerts.map((alert) => (
              <div className={`alert-item ${alert.type}`} key={alert.id}>
                <AlertCircle size={16} />
                <div className="alert-content">
                  <p><strong>{alert.title}:</strong> {alert.description}</p>
                  <span className="alert-time">{alert.time}</span>
                </div>
                <div className="alert-actions">
                  <button className="action-btn">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Research Updates */}
        <div className="research-updates">
          <div className="section-header">
            <h2>Latest Research</h2>
            <button className="view-all">Browse All</button>
          </div>
          <div className="research-list">
            {researchUpdates.map((research) => (
              <div className="research-item" key={research.id}>
                <div className="research-category">{research.category}</div>
                <h4>{research.title}</h4>
                <p>{research.description}</p>
                <div className="research-footer">
                  <span className="research-date">{research.date}</span>
                  <button className="read-more">Read Full Study</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicianDashboard;