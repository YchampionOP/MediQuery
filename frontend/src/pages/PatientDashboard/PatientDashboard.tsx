import {
    Activity,
    AlertTriangle,
    Award,
    Bell,
    Calendar,
    CheckCircle,
    Download,
    FileText,
    Heart,
    MessageSquare,
    Pill,
    Settings,
    Target,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PatientDashboard.css';

const PatientDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock data for demonstration
  const [healthSummary, setHealthSummary] = useState({
    overall: { status: 'good', value: 'Good', lastUpdated: '2 days ago' },
    bloodSugar: { status: 'warning', value: 'Needs Attention', detail: 'HbA1c: 8.2% (target: <7%)' },
    bloodPressure: { status: 'elevated', value: 'Slightly High', detail: '145/92 mmHg' },
    weight: { status: 'normal', value: 'Stable', detail: '185 lbs (target: 180 lbs)' },
    activity: { status: 'improving', value: 'Improving', detail: '4,200 steps/day (goal: 5,000)' }
  });

  const [labResults, setLabResults] = useState([
    {
      id: '1',
      testName: 'Blood Sugar (HbA1c)',
      date: 'January 15, 2024',
      value: '8.2%',
      status: 'high',
      target: '<7%',
      trend: 'up'
    },
    {
      id: '2',
      testName: 'Cholesterol (Total)',
      date: 'January 15, 2024',
      value: '185 mg/dL',
      status: 'normal',
      target: '<200',
      trend: 'down'
    },
    {
      id: '3',
      testName: 'Blood Pressure',
      date: 'January 17, 2024',
      value: '145/92',
      status: 'elevated',
      target: '<130/80',
      trend: 'stable'
    },
    {
      id: '4',
      testName: 'Kidney Function (eGFR)',
      date: 'January 15, 2024',
      value: '78 mL/min',
      status: 'normal',
      target: '>60',
      trend: 'up'
    }
  ]);

  const [medications, setMedications] = useState([
    {
      id: '1',
      name: 'Metformin',
      dosage: '500mg twice daily',
      purpose: 'For diabetes management',
      status: 'active',
      nextRefill: 'Feb 1, 2024',
      refillStatus: 'warning'
    },
    {
      id: '2',
      name: 'Lisinopril',
      dosage: '10mg once daily',
      purpose: 'For blood pressure',
      status: 'active',
      nextRefill: 'Mar 15, 2024',
      refillStatus: 'normal'
    },
    {
      id: '3',
      name: 'Atorvastatin',
      dosage: '20mg at bedtime',
      purpose: 'For cholesterol',
      status: 'active',
      nextRefill: 'Feb 28, 2024',
      refillStatus: 'normal'
    }
  ]);

  const [reminders, setReminders] = useState([
    {
      id: '1',
      type: 'important',
      title: 'Blood Sugar Check',
      description: 'Your recent HbA1c is above target. Consider discussing medication adjustments with your doctor.',
      date: 'Due for follow-up',
      action: 'Schedule appointment'
    },
    {
      id: '2',
      type: 'routine',
      title: 'Next Appointment',
      description: 'Scheduled follow-up with Dr. Johnson',
      date: 'February 15, 2024 at 2:00 PM',
      action: 'Add to calendar'
    },
    {
      id: '3',
      type: 'routine',
      title: 'Medication Refill',
      description: 'Metformin prescription expires in 2 weeks',
      date: 'Action needed by Feb 1',
      action: 'Request refill'
    }
  ]);

  const [healthTips, setHealthTips] = useState([
    {
      id: '1',
      category: 'Diet',
      title: '🍎 Diet Recommendation',
      description: 'Focus on low-glycemic foods to help manage your blood sugar. Consider adding more leafy greens and lean proteins to your meals.',
      priority: 'high'
    },
    {
      id: '2',
      category: 'Exercise',
      title: '🏃‍♂️ Exercise Suggestion',
      description: 'Regular walking for 30 minutes after meals can help lower blood sugar levels. Start with 10 minutes if you\'re new to exercise.',
      priority: 'medium'
    },
    {
      id: '3',
      category: 'Medication',
      title: '💊 Medication Timing',
      description: 'Take Metformin with meals to reduce stomach upset. Setting phone reminders can help maintain consistency.',
      priority: 'high'
    }
  ]);

  const [achievements, setAchievements] = useState([
    { id: '1', title: '7-Day Streak', description: 'Logged meals for 7 consecutive days', icon: '🔥' },
    { id: '2', title: 'Blood Pressure Goal', description: 'Maintained target BP for 2 weeks', icon: '🎯' },
    { id: '3', title: 'Medication Adherence', description: '100% medication compliance this month', icon: '✅' }
  ]);

  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Your Health Dashboard</h1>
            <p>Welcome back, John. Here's your health summary and recent updates.</p>
          </div>
          <div className="header-actions">
            <button className="notification-button">
              <Bell size={18} />
              <span className="badge">3</span>
            </button>
            <button className="settings-button">
              <Settings size={18} />
            </button>
          </div>
        </div>
        
        <div className="dashboard-filters">
          <div className="filter-group">
            <label>Time Range:</label>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Metric:</label>
            <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
              <option value="all">All Metrics</option>
              <option value="blood-sugar">Blood Sugar</option>
              <option value="blood-pressure">Blood Pressure</option>
              <option value="weight">Weight</option>
              <option value="activity">Activity</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Health Summary */}
        <div className="health-summary">
          <div className="section-header">
            <h2>Health Overview</h2>
            <button className="view-all">Detailed Report</button>
          </div>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">
                <Heart size={32} color="#22c55e" />
              </div>
              <div className="summary-content">
                <h3>Overall Health</h3>
                <p className={`status ${healthSummary.overall.status}`}>{healthSummary.overall.value}</p>
                <span>Last updated {healthSummary.overall.lastUpdated}</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <Activity size={32} color="#f59e0b" />
              </div>
              <div className="summary-content">
                <h3>Blood Sugar</h3>
                <p className={`status ${healthSummary.bloodSugar.status}`}>{healthSummary.bloodSugar.value}</p>
                <span>{healthSummary.bloodSugar.detail}</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <TrendingUp size={32} color="#3b82f6" />
              </div>
              <div className="summary-content">
                <h3>Blood Pressure</h3>
                <p className={`status ${healthSummary.bloodPressure.status}`}>{healthSummary.bloodPressure.value}</p>
                <span>{healthSummary.bloodPressure.detail}</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <Award size={32} color="#8b5cf6" />
              </div>
              <div className="summary-content">
                <h3>Health Score</h3>
                <p className="status good">78/100</p>
                <span>Improved by 5 points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <Link to="/chat" className="action-item">
              <MessageSquare size={24} />
              <span>Ask About My Health</span>
            </Link>
            
            <button className="action-item">
              <FileText size={24} />
              <span>View Lab Results</span>
            </button>
            
            <button className="action-item">
              <Pill size={24} />
              <span>My Medications</span>
            </button>
            
            <button className="action-item">
              <Calendar size={24} />
              <span>Upcoming Appointments</span>
            </button>
            
            <button className="action-item">
              <Target size={24} />
              <span>Health Goals</span>
            </button>
            
            <button className="action-item">
              <Download size={24} />
              <span>Download Records</span>
            </button>
          </div>
        </div>

        {/* Recent Lab Results */}
        <div className="recent-labs">
          <div className="section-header">
            <h2>Recent Lab Results</h2>
            <Link to="/labs" className="view-all">View All Results</Link>
          </div>
          <div className="lab-list">
            {labResults.map((lab) => (
              <div className="lab-item" key={lab.id}>
                <div className="lab-info">
                  <h4>{lab.testName}</h4>
                  <p className="lab-date">{lab.date}</p>
                </div>
                <div className="lab-result">
                  <div className="result-value-container">
                    <span className={`lab-value ${lab.status}`}>{lab.value}</span>
                    <span className="lab-range">Target: {lab.target}</span>
                  </div>
                  <div className="result-trend">
                    {lab.trend === 'up' && <TrendingUp size={16} color="#ef4444" />}
                    {lab.trend === 'down' && <TrendingDown size={16} color="#22c55e" />}
                    {lab.trend === 'stable' && <Activity size={16} color="#f59e0b" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Medications */}
        <div className="medications">
          <div className="section-header">
            <h2>Current Medications</h2>
            <Link to="/medications" className="view-all">View All</Link>
          </div>
          <div className="medication-list">
            {medications.map((med) => (
              <div className="medication-item" key={med.id}>
                <div className="medication-info">
                  <h4>{med.name}</h4>
                  <p>{med.dosage}</p>
                  <span className="medication-purpose">{med.purpose}</span>
                </div>
                <div className="medication-status">
                  <span className={`status-indicator ${med.status}`}>{med.status}</span>
                  <span className={`refill-status ${med.refillStatus}`}>Refill: {med.nextRefill}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Reminders */}
        <div className="health-reminders">
          <div className="section-header">
            <h2>Health Reminders</h2>
            <button className="view-all">Manage Reminders</button>
          </div>
          <div className="reminder-list">
            {reminders.map((reminder) => (
              <div className={`reminder-item ${reminder.type}`} key={reminder.id}>
                <AlertTriangle size={20} />
                <div className="reminder-content">
                  <h4>{reminder.title}</h4>
                  <p>{reminder.description}</p>
                  <span className="reminder-date">{reminder.date}</span>
                </div>
                <div className="reminder-actions">
                  <button className="action-btn">{reminder.action}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Tips */}
        <div className="health-tips">
          <div className="section-header">
            <h2>Personalized Health Tips</h2>
            <button className="view-all">View All Tips</button>
          </div>
          <div className="tip-list">
            {healthTips.map((tip) => (
              <div className="tip-item" key={tip.id}>
                <div className="tip-category">{tip.category}</div>
                <h4>{tip.title}</h4>
                <p>{tip.description}</p>
                <div className="tip-footer">
                  <span className={`priority ${tip.priority}`}>{tip.priority} priority</span>
                  <button className="save-tip">Save for Later</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="achievements">
          <div className="section-header">
            <h2>Your Health Achievements</h2>
            <button className="view-all">View All</button>
          </div>
          <div className="achievement-list">
            {achievements.map((achievement) => (
              <div className="achievement-item" key={achievement.id}>
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                </div>
                <CheckCircle size={20} color="#22c55e" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;