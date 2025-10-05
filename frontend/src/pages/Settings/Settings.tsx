import {
    Bell,
    Calendar,
    Check,
    Database,
    Download,
    Eye,
    Key,
    Lock,
    Mail,
    MapPin,
    Palette,
    Phone,
    RefreshCw,
    Save,
    Shield,
    Trash2,
    Upload,
    User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import './Settings.css';

// Define types directly since we can't import from @types
type UserRole = 'clinician' | 'patient';

interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
}

interface SettingsProps {
  userRole: UserRole;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  department?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface SystemSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    screenReader: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    passwordLastChanged: string;
    sessionTimeout: number;
  };
}

const Settings: React.FC<SettingsProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user-123',
    email: 'user@example.com',
    name: 'John Doe',
    department: userRole === 'clinician' ? 'Cardiology' : undefined,
    licenseNumber: userRole === 'clinician' ? 'MD123456' : undefined,
    dateOfBirth: userRole === 'patient' ? '1980-01-15' : undefined,
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
    emergencyContact: userRole === 'patient' ? {
      name: 'Jane Smith',
      phone: '+1 (555) 987-6543',
      relationship: 'Spouse'
    } : undefined
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    theme: 'light',
    notificationsEnabled: true,
    detailLevel: 'detailed'
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      marketing: false
    },
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      screenReader: false
    },
    security: {
      twoFactorAuth: true,
      passwordLastChanged: '2024-01-15',
      sessionTimeout: 30
    }
  });

  // Load settings from localStorage or API on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (e) {
        console.error('Failed to parse saved preferences');
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // In a real app, this would save to an API
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleEmergencyContactChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      emergencyContact: prev.emergencyContact ? { 
        ...prev.emergencyContact, 
        [field]: value 
      } : undefined
    }));
  };

  const handlePreferenceChange = (field: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleSystemSettingChange = (category: keyof SystemSettings, field: string, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as any),
        [field]: value
      }
    }));
  };

  const renderProfileTab = () => (
    <div className="settings-section">
      <h2>Profile Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <div className="input-with-icon">
            <User size={18} />
            <input
              id="name"
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-with-icon">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <div className="input-with-icon">
            <Phone size={18} />
            <input
              id="phone"
              type="tel"
              value={profile.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
            />
          </div>
        </div>

        {userRole === 'clinician' && (
          <>
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <div className="input-with-icon">
                <MapPin size={18} />
                <input
                  id="department"
                  type="text"
                  value={profile.department}
                  onChange={(e) => handleProfileChange('department', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="license">License Number</label>
              <div className="input-with-icon">
                <Key size={18} />
                <input
                  id="license"
                  type="text"
                  value={profile.licenseNumber}
                  onChange={(e) => handleProfileChange('licenseNumber', e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {userRole === 'patient' && (
          <>
            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <div className="input-with-icon">
                <Calendar size={18} />
                <input
                  id="dob"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Emergency Contact</label>
              <div className="sub-form">
                <div className="form-group">
                  <label htmlFor="emergency-name">Name</label>
                  <input
                    id="emergency-name"
                    type="text"
                    value={profile.emergencyContact?.name || ''}
                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emergency-phone">Phone</label>
                  <input
                    id="emergency-phone"
                    type="tel"
                    value={profile.emergencyContact?.phone || ''}
                    onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emergency-relationship">Relationship</label>
                  <input
                    id="emergency-relationship"
                    type="text"
                    value={profile.emergencyContact?.relationship || ''}
                    onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="form-group full-width">
          <label htmlFor="address">Address</label>
          <div className="input-with-icon">
            <MapPin size={18} />
            <input
              id="address"
              type="text"
              value={profile.address}
              onChange={(e) => handleProfileChange('address', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="settings-section">
      <h2>User Preferences</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="language">Language</label>
          <select
            id="language"
            value={preferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={preferences.theme}
            onChange={(e) => handlePreferenceChange('theme', e.target.value as any)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="detail-level">Detail Level</label>
          <select
            id="detail-level"
            value={preferences.detailLevel}
            onChange={(e) => handlePreferenceChange('detailLevel', e.target.value as any)}
          >
            <option value="basic">Basic</option>
            <option value="detailed">Detailed</option>
            <option value="comprehensive">Comprehensive</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={preferences.notificationsEnabled}
              onChange={(e) => handlePreferenceChange('notificationsEnabled', e.target.checked)}
            />
            <span>Enable Notifications</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="settings-section">
      <h2>Notification Settings</h2>
      <div className="form-grid">
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={systemSettings.notifications.email}
              onChange={(e) => handleSystemSettingChange('notifications', 'email', e.target.checked)}
            />
            <span>Email Notifications</span>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={systemSettings.notifications.push}
              onChange={(e) => handleSystemSettingChange('notifications', 'push', e.target.checked)}
            />
            <span>Push Notifications</span>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={systemSettings.notifications.sms}
              onChange={(e) => handleSystemSettingChange('notifications', 'sms', e.target.checked)}
            />
            <span>SMS Notifications</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="settings-section">
      <h2>Privacy Settings</h2>
      <div className="form-grid">
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={systemSettings.privacy.dataSharing}
              onChange={(e) => handleSystemSettingChange('privacy', 'dataSharing', e.target.checked)}
            />
            <span>Allow Data Sharing for Research</span>
          </label>
          <p className="help-text">Share anonymized data to help improve healthcare research</p>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={systemSettings.privacy.analytics}
              onChange={(e) => handleSystemSettingChange('privacy', 'analytics', e.target.checked)}
            />
            <span>Allow Analytics</span>
          </label>
          <p className="help-text">Help us improve the application by sharing usage data</p>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={systemSettings.privacy.marketing}
              onChange={(e) => handleSystemSettingChange('privacy', 'marketing', e.target.checked)}
            />
            <span>Marketing Communications</span>
          </label>
          <p className="help-text">Receive updates about new features and services</p>
        </div>
      </div>
    </div>
  );

  const renderAccessibilityTab = () => (
    <div className="settings-section">
      <h2>Accessibility Settings</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="font-size">Font Size</label>
          <select
            id="font-size"
            value={systemSettings.accessibility.fontSize}
            onChange={(e) => handleSystemSettingChange('accessibility', 'fontSize', e.target.value as any)}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={systemSettings.accessibility.highContrast}
              onChange={(e) => handleSystemSettingChange('accessibility', 'highContrast', e.target.checked)}
            />
            <span>High Contrast Mode</span>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={systemSettings.accessibility.screenReader}
              onChange={(e) => handleSystemSettingChange('accessibility', 'screenReader', e.target.checked)}
            />
            <span>Screen Reader Support</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="settings-section">
      <h2>Security Settings</h2>
      <div className="form-grid">
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={systemSettings.security.twoFactorAuth}
              onChange={(e) => handleSystemSettingChange('security', 'twoFactorAuth', e.target.checked)}
            />
            <span>Two-Factor Authentication</span>
          </label>
          <p className="help-text">Add an extra layer of security to your account</p>
        </div>

        <div className="form-group">
          <label>Password Last Changed</label>
          <div className="readonly-field">
            {new Date(systemSettings.security.passwordLastChanged).toLocaleDateString()}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="session-timeout">Session Timeout (minutes)</label>
          <input
            id="session-timeout"
            type="number"
            min="1"
            max="120"
            value={systemSettings.security.sessionTimeout}
            onChange={(e) => handleSystemSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
          />
        </div>

        <div className="form-group full-width">
          <button className="secondary-button">
            <RefreshCw size={16} />
            Change Password
          </button>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="settings-section">
      <h2>Data Management</h2>
      <div className="data-actions">
        <div className="action-card">
          <h3>Export Data</h3>
          <p>Download a copy of your personal health information</p>
          <button className="secondary-button">
            <Download size={16} />
            Export Health Records
          </button>
        </div>

        <div className="action-card">
          <h3>Import Data</h3>
          <p>Import health records from other systems</p>
          <button className="secondary-button">
            <Upload size={16} />
            Import Health Records
          </button>
        </div>

        <div className="action-card danger">
          <h3>Delete Account</h3>
          <p>Permanently delete your account and all associated data</p>
          <button className="danger-button">
            <Trash2 size={16} />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and system configuration</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              Profile
            </button>
            
            <button 
              className={activeTab === 'preferences' ? 'active' : ''}
              onClick={() => setActiveTab('preferences')}
            >
              <Palette size={18} />
              Preferences
            </button>
            
            <button 
              className={activeTab === 'notifications' ? 'active' : ''}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={18} />
              Notifications
            </button>
            
            <button 
              className={activeTab === 'privacy' ? 'active' : ''}
              onClick={() => setActiveTab('privacy')}
            >
              <Shield size={18} />
              Privacy
            </button>
            
            <button 
              className={activeTab === 'accessibility' ? 'active' : ''}
              onClick={() => setActiveTab('accessibility')}
            >
              <Eye size={18} />
              Accessibility
            </button>
            
            <button 
              className={activeTab === 'security' ? 'active' : ''}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={18} />
              Security
            </button>
            
            <button 
              className={activeTab === 'data' ? 'active' : ''}
              onClick={() => setActiveTab('data')}
            >
              <Database size={18} />
              Data Management
            </button>
          </nav>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}
          {activeTab === 'accessibility' && renderAccessibilityTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'data' && renderDataTab()}

          <div className="settings-footer">
            <button 
              className="primary-button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
            
            {saveSuccess && (
              <div className="save-success">
                <Check size={16} />
                Settings saved successfully!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;