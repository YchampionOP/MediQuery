import React from 'react';
import { UserRole } from '@types/index';
import { UserIcon, HeartHandshake } from 'lucide-react';
import './RoleSelector.css';

interface RoleSelectorProps {
  onRoleSelect: (role: UserRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleSelect }) => {
  return (
    <div className="role-selector">
      <h2 className="role-selector-title">Choose Your Role</h2>
      <p className="role-selector-description">
        Select how you'd like to use MediQuery AI
      </p>
      
      <div className="role-options">
        <button 
          className="role-option clinician"
          onClick={() => onRoleSelect('clinician')}
          aria-label="Continue as Healthcare Professional"
        >
          <div className="role-icon">
            <HeartHandshake size={48} />
          </div>
          <div className="role-content">
            <h3>Healthcare Professional</h3>
            <p>
              Access clinical insights, patient records, evidence-based recommendations, 
              and advanced medical analytics.
            </p>
            <ul className="role-features">
              <li>Complete patient record access</li>
              <li>Clinical decision support</li>
              <li>Medical literature integration</li>
              <li>Advanced search capabilities</li>
            </ul>
          </div>
        </button>
        
        <button 
          className="role-option patient"
          onClick={() => onRoleSelect('patient')}
          aria-label="Continue as Patient"
        >
          <div className="role-icon">
            <UserIcon size={48} />
          </div>
          <div className="role-content">
            <h3>Patient</h3>
            <p>
              Get easy-to-understand explanations of your health data, 
              lab results, and personalized health insights.
            </p>
            <ul className="role-features">
              <li>Plain-language health explanations</li>
              <li>Personal health insights</li>
              <li>Lab result interpretations</li>
              <li>Educational resources</li>
            </ul>
          </div>
        </button>
      </div>
      
      <div className="role-selector-footer">
        <p className="disclaimer">
          This is a demonstration platform using synthetic medical data. 
          Not intended for actual clinical use.
        </p>
      </div>
    </div>
  );
};

export default RoleSelector;