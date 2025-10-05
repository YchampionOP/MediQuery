import React from 'react';
import { ChartData, UserRole } from '@types/index';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './MedicalCharts.css';

interface MedicalChartsProps {
  chartData: ChartData;
  chartType: 'line' | 'area' | 'bar' | 'pie';
  userRole: UserRole;
  title: string;
  description?: string;
  unit?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  timeRange?: string;
}

interface LabTrendData {
  date: string;
  value: number;
  normalRange?: {
    min: number;
    max: number;
  };
  unit: string;
  testName: string;
}

interface VitalSignsData {
  timestamp: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const MedicalCharts: React.FC<MedicalChartsProps> = ({
  chartData,
  chartType,
  userRole,
  title,
  description,
  unit,
  height = 300,
  showLegend = true,
  showGrid = true,
  timeRange
}) => {
  const formatTooltipValue = (value: any, name: string) => {
    if (typeof value === 'number') {
      return [`${value.toFixed(2)} ${unit || ''}`, name];
    }
    return [value, name];
  };

  const formatAxisLabel = (value: string) => {
    // Format dates for better readability
    if (Date.parse(value)) {
      return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
    return value;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.color }}>
              {`${pld.name}: ${pld.value} ${unit || ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderNormalRangeArea = (data: any[]) => {
    if (!data[0]?.normalRange) return null;
    
    const { min, max } = data[0].normalRange;
    return (
      <Area
        type="monotone"
        dataKey={() => max}
        stackId="normalRange"
        stroke="none"
        fill="#e8f5e8"
        fillOpacity={0.3}
      />
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData.datasets[0].data}>
              <CartesianGrid strokeDasharray="3 3" stroke={showGrid ? '#f0f0f0' : 'none'} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatAxisLabel}
                stroke="#666"
              />
              <YAxis stroke="#666" />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              
              {chartData.datasets.map((dataset, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData.datasets[0].data}>
              <CartesianGrid strokeDasharray="3 3" stroke={showGrid ? '#f0f0f0' : 'none'} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatAxisLabel}
                stroke="#666"
              />
              <YAxis stroke="#666" />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              
              {chartData.datasets.map((dataset, index) => (
                <Area
                  key={index}
                  type="monotone"
                  dataKey="value"
                  stackId="1"
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData.datasets[0].data}>
              <CartesianGrid strokeDasharray="3 3" stroke={showGrid ? '#f0f0f0' : 'none'} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatAxisLabel}
                stroke="#666"
              />
              <YAxis stroke="#666" />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              
              {chartData.datasets.map((dataset, index) => (
                <Bar
                  key={index}
                  dataKey="value"
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData.datasets[0].data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.datasets[0].data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  const renderPatientEducationNote = () => {
    if (userRole !== 'patient') return null;

    const educationalNotes: { [key: string]: string } = {
      'Blood Pressure': 'Normal blood pressure is typically below 120/80 mmHg. Speak with your doctor about any concerns.',
      'Blood Glucose': 'Normal fasting glucose is 70-100 mg/dL. Keep track of trends and follow your care plan.',
      'HbA1c': 'HbA1c shows average blood sugar over 2-3 months. Target is usually below 7% for most people with diabetes.',
      'Cholesterol': 'Total cholesterol should be below 200 mg/dL. Diet and exercise can help manage levels.'
    };

    const note = educationalNotes[title];
    if (!note) return null;

    return (
      <div className="patient-education-note">
        <div className="education-icon">💡</div>
        <p>{note}</p>
      </div>
    );
  };

  return (
    <div className="medical-chart">
      <div className="chart-header">
        <div className="chart-title-section">
          <h3>{title}</h3>
          {timeRange && (
            <span className="time-range">{timeRange}</span>
          )}
        </div>
        
        {description && (
          <p className="chart-description">{description}</p>
        )}
      </div>

      <div className="chart-container">
        {renderChart()}
      </div>

      {renderPatientEducationNote()}

      <div className="chart-footer">
        <div className="data-points">
          {chartData.datasets[0].data.length} data points
        </div>
        
        {userRole === 'clinician' && (
          <div className="chart-actions">
            <button className="export-btn">📊 Export</button>
            <button className="share-btn">📤 Share</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalCharts;