import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserRole, Patient, MedicalCondition, Medication, LabResult, ClinicalNote } from '@types/index';
import { searchService, medicalService } from '@services/api';
import PatientTimeline from '@components/PatientTimeline/PatientTimeline';
import MedicalDataVisualization from '@components/Charts/MedicalDataVisualization';
import './PatientDetails.css';

interface PatientDetailsProps {
  userRole: UserRole;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ userRole }) => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [medicalCodes, setMedicalCodes] = useState<any[]>([]);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // Search for patient data
        const searchResponse = await searchService.search({
          query: `patient_id:${id}`,
          role: userRole,
          indices: ['patients']
        });
        
        if (searchResponse.results.length > 0) {
          // In a real implementation, this would be properly typed
          const patientData = searchResponse.results[0] as any;
          setPatient({
            id: patientData.id,
            demographics: patientData.demographics || {},
            conditions: patientData.conditions || [],
            medications: patientData.medications || [],
            labResults: patientData.labResults || [],
            clinicalNotes: patientData.clinicalNotes || [],
            admissions: patientData.admissions || [],
            timeline: patientData.timeline || []
          } as Patient);
        }
        
        // Fetch medical codes for reference
        const codesResponse = await medicalService.getMedicalCodes(undefined, undefined, 50);
        setMedicalCodes(codesResponse.codes);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id, userRole]);

  if (loading) {
    return (
      <div className="patient-details-container">
        <div className="loading-state">
          <h2>Loading Patient Details...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-details-container">
        <div className="error-state">
          <h2>Error Loading Patient Data</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-details-container">
        <div className="not-found-state">
          <h2>Patient Not Found</h2>
          <p>No patient data available for the provided ID.</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="overview-content">
      <div className="patient-demographics">
        <h3>Demographics</h3>
        <div className="demographics-grid">
          <div className="demographic-item">
            <label>Date of Birth</label>
            <span>{patient.demographics.dateOfBirth || 'N/A'}</span>
          </div>
          <div className="demographic-item">
            <label>Gender</label>
            <span>{patient.demographics.gender || 'N/A'}</span>
          </div>
          <div className="demographic-item">
            <label>Race</label>
            <span>{patient.demographics.race || 'N/A'}</span>
          </div>
          <div className="demographic-item">
            <label>Insurance</label>
            <span>{patient.demographics.insurance || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="patient-conditions">
        <h3>Active Conditions</h3>
        {patient.conditions && patient.conditions.length > 0 ? (
          <div className="conditions-list">
            {patient.conditions
              .filter(condition => condition.status === 'active')
              .map(condition => (
                <div key={condition.id} className="condition-item">
                  <div className="condition-header">
                    <span className="condition-code">{condition.code}</span>
                    <span className={`condition-status ${condition.status}`}>
                      {condition.status}
                    </span>
                  </div>
                  <div className="condition-description">
                    {condition.description}
                  </div>
                  {condition.onsetDate && (
                    <div className="condition-onset">
                      Onset: {new Date(condition.onsetDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        ) : (
          <p>No active conditions recorded.</p>
        )}
      </div>

      <div className="patient-medications">
        <h3>Current Medications</h3>
        {patient.medications && patient.medications.length > 0 ? (
          <div className="medications-list">
            {patient.medications
              .filter(med => med.status === 'active')
              .map(medication => (
                <div key={medication.id} className="medication-item">
                  <div className="medication-header">
                    <span className="medication-name">{medication.name}</span>
                    <span className={`medication-status ${medication.status}`}>
                      {medication.status}
                    </span>
                  </div>
                  <div className="medication-details">
                    {medication.dosage} {medication.frequency}
                  </div>
                  <div className="medication-period">
                    {medication.startDate && `Started: ${new Date(medication.startDate).toLocaleDateString()}`}
                  </div>
                </div>
              ))
            }
          </div>
        ) : (
          <p>No current medications recorded.</p>
        )}
      </div>
    </div>
  );

  const renderConditions = () => (
    <div className="conditions-content">
      <h3>All Conditions</h3>
      {patient.conditions && patient.conditions.length > 0 ? (
        <div className="conditions-table">
          <div className="table-header">
            <div className="table-cell">Code</div>
            <div className="table-cell">Description</div>
            <div className="table-cell">Status</div>
            <div className="table-cell">Onset Date</div>
          </div>
          {patient.conditions.map(condition => (
            <div key={condition.id} className="table-row">
              <div className="table-cell">{condition.code}</div>
              <div className="table-cell">{condition.description}</div>
              <div className="table-cell">
                <span className={`status-badge ${condition.status}`}>
                  {condition.status}
                </span>
              </div>
              <div className="table-cell">
                {condition.onsetDate && new Date(condition.onsetDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No conditions recorded.</p>
      )}
    </div>
  );

  const renderMedications = () => (
    <div className="medications-content">
      <h3>All Medications</h3>
      {patient.medications && patient.medications.length > 0 ? (
        <div className="medications-table">
          <div className="table-header">
            <div className="table-cell">Medication</div>
            <div className="table-cell">Dosage</div>
            <div className="table-cell">Frequency</div>
            <div className="table-cell">Status</div>
            <div className="table-cell">Start Date</div>
          </div>
          {patient.medications.map(medication => (
            <div key={medication.id} className="table-row">
              <div className="table-cell">{medication.name}</div>
              <div className="table-cell">{medication.dosage}</div>
              <div className="table-cell">{medication.frequency}</div>
              <div className="table-cell">
                <span className={`status-badge ${medication.status}`}>
                  {medication.status}
                </span>
              </div>
              <div className="table-cell">
                {medication.startDate && new Date(medication.startDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No medications recorded.</p>
      )}
    </div>
  );

  const renderLabResults = () => (
    <div className="lab-results-content">
      <h3>Recent Lab Results</h3>
      {patient.labResults && patient.labResults.length > 0 ? (
        <div className="lab-results-table">
          <div className="table-header">
            <div className="table-cell">Test Name</div>
            <div className="table-cell">Value</div>
            <div className="table-cell">Unit</div>
            <div className="table-cell">Status</div>
            <div className="table-cell">Date</div>
          </div>
          {patient.labResults
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 20)
            .map(result => (
              <div key={result.id} className="table-row">
                <div className="table-cell">{result.testName}</div>
                <div className="table-cell">{result.value}</div>
                <div className="table-cell">{result.unit || 'N/A'}</div>
                <div className="table-cell">
                  <span className={`status-badge ${result.status}`}>
                    {result.status}
                  </span>
                </div>
                <div className="table-cell">
                  {new Date(result.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p>No lab results recorded.</p>
      )}
    </div>
  );

  const renderNotes = () => (
    <div className="notes-content">
      <h3>Clinical Notes</h3>
      {patient.clinicalNotes && patient.clinicalNotes.length > 0 ? (
        <div className="notes-list">
          {patient.clinicalNotes
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map(note => (
              <div key={note.id} className="note-item">
                <div className="note-header">
                  <h4>{note.title}</h4>
                  <span className="note-type">{note.type}</span>
                  <span className="note-date">
                    {new Date(note.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="note-content">
                  {note.content.substring(0, 200)}...
                </div>
                <div className="note-author">
                  By: {note.author} | Department: {note.department}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p>No clinical notes recorded.</p>
      )}
    </div>
  );

  return (
    <div className="patient-details-container">
      <div className="patient-header">
        <h1>Patient Details</h1>
        <div className="patient-info">
          <span className="patient-id">ID: {id}</span>
          {patient.demographics && (
            <span className="patient-name">
              {patient.demographics.firstName} {patient.demographics.lastName}
            </span>
          )}
        </div>
      </div>

      <div className="patient-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'conditions' ? 'active' : ''}
          onClick={() => setActiveTab('conditions')}
        >
          Conditions
        </button>
        <button 
          className={activeTab === 'medications' ? 'active' : ''}
          onClick={() => setActiveTab('medications')}
        >
          Medications
        </button>
        <button 
          className={activeTab === 'lab-results' ? 'active' : ''}
          onClick={() => setActiveTab('lab-results')}
        >
          Lab Results
        </button>
        <button 
          className={activeTab === 'timeline' ? 'active' : ''}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
        <button 
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button 
          className={activeTab === 'notes' ? 'active' : ''}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
      </div>

      <div className="patient-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'conditions' && renderConditions()}
        {activeTab === 'medications' && renderMedications()}
        {activeTab === 'lab-results' && renderLabResults()}
        {activeTab === 'timeline' && (
          <PatientTimeline 
            events={patient.timeline || []} 
            userRole={userRole} 
            patientId={id || ''} 
          />
        )}
        {activeTab === 'analytics' && <MedicalDataVisualization patientId={id} />}
        {activeTab === 'notes' && renderNotes()}
      </div>
    </div>
  );
};

export default PatientDetails;