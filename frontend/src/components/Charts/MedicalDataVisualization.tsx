import React, { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

// Types for medical data
interface MedicalDataPoint {
  date: string;
  value: number;
  metric: string;
  unit?: string;
  target?: number;
  status?: 'normal' | 'warning' | 'critical';
}

interface PatientVitals {
  bloodPressure: MedicalDataPoint[];
  bloodSugar: MedicalDataPoint[];
  weight: MedicalDataPoint[];
  cholesterol: MedicalDataPoint[];
}

interface MedicationAdherence {
  name: string;
  adherence: number;
  target: number;
}

interface ConditionDistribution {
  name: string;
  value: number;
  color: string;
}

// Mock data for demonstration
const mockVitalsData: PatientVitals = {
  bloodPressure: [
    { date: '2024-01-01', value: 145, metric: 'Systolic', unit: 'mmHg', target: 130 },
    { date: '2024-01-08', value: 142, metric: 'Systolic', unit: 'mmHg', target: 130 },
    { date: '2024-01-15', value: 140, metric: 'Systolic', unit: 'mmHg', target: 130 },
    { date: '2024-01-22', value: 138, metric: 'Systolic', unit: 'mmHg', target: 130 },
    { date: '2024-01-29', value: 135, metric: 'Systolic', unit: 'mmHg', target: 130 },
    { date: '2024-02-05', value: 132, metric: 'Systolic', unit: 'mmHg', target: 130 }
  ],
  bloodSugar: [
    { date: '2024-01-01', value: 8.2, metric: 'HbA1c', unit: '%', target: 7.0 },
    { date: '2024-01-08', value: 8.0, metric: 'HbA1c', unit: '%', target: 7.0 },
    { date: '2024-01-15', value: 7.8, metric: 'HbA1c', unit: '%', target: 7.0 },
    { date: '2024-01-22', value: 7.6, metric: 'HbA1c', unit: '%', target: 7.0 },
    { date: '2024-01-29', value: 7.4, metric: 'HbA1c', unit: '%', target: 7.0 },
    { date: '2024-02-05', value: 7.2, metric: 'HbA1c', unit: '%', target: 7.0 }
  ],
  weight: [
    { date: '2024-01-01', value: 185, metric: 'Weight', unit: 'lbs', target: 180 },
    { date: '2024-01-08', value: 184, metric: 'Weight', unit: 'lbs', target: 180 },
    { date: '2024-01-15', value: 183, metric: 'Weight', unit: 'lbs', target: 180 },
    { date: '2024-01-22', value: 182, metric: 'Weight', unit: 'lbs', target: 180 },
    { date: '2024-01-29', value: 181, metric: 'Weight', unit: 'lbs', target: 180 },
    { date: '2024-02-05', value: 180, metric: 'Weight', unit: 'lbs', target: 180 }
  ],
  cholesterol: [
    { date: '2024-01-01', value: 195, metric: 'Total Cholesterol', unit: 'mg/dL', target: 200 },
    { date: '2024-01-08', value: 192, metric: 'Total Cholesterol', unit: 'mg/dL', target: 200 },
    { date: '2024-01-15', value: 190, metric: 'Total Cholesterol', unit: 'mg/dL', target: 200 },
    { date: '2024-01-22', value: 188, metric: 'Total Cholesterol', unit: 'mg/dL', target: 200 },
    { date: '2024-01-29', value: 185, metric: 'Total Cholesterol', unit: 'mg/dL', target: 200 },
    { date: '2024-02-05', value: 185, metric: 'Total Cholesterol', unit: 'mg/dL', target: 200 }
  ]
};

const mockMedicationAdherence: MedicationAdherence[] = [
  { name: 'Metformin', adherence: 95, target: 100 },
  { name: 'Lisinopril', adherence: 88, target: 100 },
  { name: 'Atorvastatin', adherence: 92, target: 100 },
  { name: 'Aspirin', adherence: 75, target: 100 }
];

const mockConditionDistribution: ConditionDistribution[] = [
  { name: 'Diabetes', value: 35, color: '#3b82f6' },
  { name: 'Hypertension', value: 25, color: '#ef4444' },
  { name: 'Hyperlipidemia', value: 20, color: '#f59e0b' },
  { name: 'Other', value: 20, color: '#8b5cf6' }
];

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981'];

interface MedicalDataVisualizationProps {
  patientId?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

const MedicalDataVisualization: React.FC<MedicalDataVisualizationProps> = ({ 
  patientId, 
  timeRange = 'month' 
}) => {
  const [activeTab, setActiveTab] = useState('vitals');
  const [vitalsData, setVitalsData] = useState<PatientVitals>(mockVitalsData);
  const [medicationData, setMedicationData] = useState<MedicationAdherence[]>(mockMedicationAdherence);
  const [conditionData, setConditionData] = useState<ConditionDistribution[]>(mockConditionDistribution);

  // In a real application, this would fetch data from an API
  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      // This would be replaced with actual API calls
      setVitalsData(mockVitalsData);
      setMedicationData(mockMedicationAdherence);
      setConditionData(mockConditionDistribution);
    };

    fetchData();
  }, [patientId, timeRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value} ${entry.unit || ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderVitalsCharts = () => (
    <div className="chart-grid">
      <div className="chart-container">
        <h3>Blood Pressure Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={vitalsData.bloodPressure}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[120, 160]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              name="Systolic BP" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              name="Target BP" 
              stroke="#94a3b8" 
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Blood Sugar (HbA1c) Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={vitalsData.bloodSugar}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[6.5, 9]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="value" 
              name="HbA1c" 
              stroke="#f59e0b" 
              fill="#f59e0b" 
              fillOpacity={0.3}
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              name="Target HbA1c" 
              stroke="#94a3b8" 
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Weight Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={vitalsData.weight}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[175, 190]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="value" 
              name="Weight (lbs)" 
              fill="#10b981"
            >
              {vitalsData.weight.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.value <= entry.target! ? '#10b981' : '#f59e0b'} 
                />
              ))}
            </Bar>
            <Line 
              type="monotone" 
              dataKey="target" 
              name="Target Weight" 
              stroke="#94a3b8" 
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Cholesterol Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={vitalsData.cholesterol}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[180, 210]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              name="Total Cholesterol" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              name="Target Cholesterol" 
              stroke="#94a3b8" 
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderMedicationCharts = () => (
    <div className="chart-grid">
      <div className="chart-container">
        <h3>Medication Adherence</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={medicationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="adherence" name="Actual Adherence %" fill="#3b82f6" />
            <Line 
              type="monotone" 
              dataKey="target" 
              name="Target (100%)" 
              stroke="#94a3b8" 
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Adherence by Medication</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={medicationData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="adherence"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {medicationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderConditionCharts = () => (
    <div className="chart-grid">
      <div className="chart-container">
        <h3>Condition Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={conditionData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {conditionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Health Metrics Radar</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={conditionData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Condition Prevalence"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="medical-data-visualization">
      <div className="visualization-header">
        <h2>Medical Data Visualization</h2>
        <div className="time-filters">
          <button 
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => {}}
          >
            Week
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => {}}
          >
            Month
          </button>
          <button 
            className={timeRange === 'quarter' ? 'active' : ''}
            onClick={() => {}}
          >
            Quarter
          </button>
          <button 
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => {}}
          >
            Year
          </button>
        </div>
      </div>

      <div className="tab-navigation">
        <button 
          className={activeTab === 'vitals' ? 'active' : ''}
          onClick={() => setActiveTab('vitals')}
        >
          Vital Signs
        </button>
        <button 
          className={activeTab === 'medications' ? 'active' : ''}
          onClick={() => setActiveTab('medications')}
        >
          Medications
        </button>
        <button 
          className={activeTab === 'conditions' ? 'active' : ''}
          onClick={() => setActiveTab('conditions')}
        >
          Conditions
        </button>
      </div>

      <div className="visualization-content">
        {activeTab === 'vitals' && renderVitalsCharts()}
        {activeTab === 'medications' && renderMedicationCharts()}
        {activeTab === 'conditions' && renderConditionCharts()}
      </div>

      <div className="visualization-footer">
        <p>Data updated: {new Date().toLocaleDateString()}</p>
        <button className="export-button">Export Charts</button>
      </div>
    </div>
  );
};

export default MedicalDataVisualization;