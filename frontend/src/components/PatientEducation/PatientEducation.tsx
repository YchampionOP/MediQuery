import {
    Book,
    BookOpen,
    ChevronRight,
    Clock,
    ExternalLink,
    FileText,
    GraduationCap,
    Lightbulb,
    Search
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import './PatientEducation.css';

interface EducationalContent {
  id: string;
  title: string;
  topic: string;
  condition?: string;
  contentType: string;
  readingLevel: number;
  plainLanguageText: string;
  medicalTerms: MedicalTermExplanation[];
  keyPoints: string[];
  whenToSeekHelp: string[];
  resources: EducationalResource[];
  lastUpdated: string;
  reviewedBy: string;
  language: string;
  relatedResearch?: PubMedArticle[];
}

interface MedicalTermExplanation {
  term: string;
  definition: string;
  pronunciation?: string;
  synonyms?: string[];
  example?: string;
}

interface EducationalResource {
  title: string;
  url?: string;
  organization: string;
  type: string;
  description: string;
  language: string;
  verified: boolean;
}

interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  meshTerms: string[];
  keywords: string[];
  doi?: string;
  pii?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  language: string;
  publicationType: string[];
}

interface PatientEducationProps {
  userRole: 'patient' | 'clinician';
  conditions?: string[];
}

const PatientEducation: React.FC<PatientEducationProps> = ({ userRole, conditions = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [educationalContent, setEducationalContent] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('topics');
  const [literacyLevel, setLiteracyLevel] = useState(6);

  // Mock data for demonstration
  const mockContent: EducationalContent[] = [
    {
      id: 'diabetes-basics',
      title: 'Understanding Your Type 2 Diabetes',
      topic: 'diabetes',
      condition: 'Type 2 Diabetes',
      contentType: 'explanation',
      readingLevel: 6,
      plainLanguageText: `Type 2 diabetes means your body has trouble using sugar (glucose) the right way. Think of insulin like a key that helps sugar get into your cells for energy. When you have diabetes, either your body doesn't make enough insulin, or the insulin doesn't work as well as it should.

This causes sugar to build up in your blood instead of getting into your cells. Over time, too much sugar in your blood can hurt different parts of your body like your eyes, kidneys, nerves, and heart.

The good news is that you can manage diabetes and live a healthy life. With the right food choices, exercise, and medicine (if needed), you can keep your blood sugar levels in a healthy range.`,
      medicalTerms: [
        {
          term: 'glucose',
          definition: 'A type of sugar that gives your body energy',
          example: 'Glucose comes from the food you eat, especially carbohydrates'
        },
        {
          term: 'insulin',
          definition: 'A hormone that helps sugar get from your blood into your cells',
          example: 'Your pancreas makes insulin naturally'
        }
      ],
      keyPoints: [
        'Diabetes affects how your body uses sugar for energy',
        'High blood sugar can cause health problems over time',
        'You can manage diabetes with lifestyle changes and medicine',
        'Regular check-ups with your healthcare team are important',
        'Small changes can make a big difference in your health'
      ],
      whenToSeekHelp: [
        'Blood sugar levels are often above 250 mg/dL',
        'You feel very thirsty or urinate frequently',
        'You have blurred vision or dizziness',
        'Cuts or sores heal slowly',
        'You feel very tired or weak',
        'You have numbness or tingling in hands or feet'
      ],
      resources: [
        {
          title: 'American Diabetes Association',
          url: 'https://diabetes.org',
          organization: 'ADA',
          type: 'website',
          description: 'Comprehensive diabetes information and support',
          language: 'English',
          verified: true
        }
      ],
      lastUpdated: '2023-12-01',
      reviewedBy: 'Dr. Sarah Johnson, Endocrinologist',
      language: 'English',
      relatedResearch: [
        {
          pmid: '12345678',
          title: 'Long-term outcomes of intensive glucose control in type 2 diabetes',
          abstract: 'This study examined the effects of intensive glucose control on cardiovascular outcomes in patients with type 2 diabetes over a 10-year period.',
          authors: ['Smith J', 'Johnson M', 'Brown K'],
          journal: 'New England Journal of Medicine',
          publicationDate: '2023-05-15',
          meshTerms: ['Diabetes Mellitus, Type 2', 'Blood Glucose', 'Cardiovascular Diseases'],
          keywords: ['diabetes', 'glucose control', 'cardiovascular'],
          language: 'English',
          publicationType: ['Journal Article']
        }
      ]
    },
    {
      id: 'blood-pressure-basics',
      title: 'Understanding Your Blood Pressure',
      topic: 'hypertension',
      condition: 'High Blood Pressure',
      contentType: 'explanation',
      readingLevel: 6,
      plainLanguageText: `Blood pressure is the force of blood pushing against the walls of your arteries as your heart pumps blood. Think of it like water pressure in a garden hose.

Blood pressure is written as two numbers, like 120/80. The top number (systolic) is the pressure when your heart beats. The bottom number (diastolic) is the pressure when your heart rests between beats.

High blood pressure means the force against your artery walls is too strong. This makes your heart work harder and can damage your arteries over time. Most people with high blood pressure don't feel sick, which is why it's called the "silent killer."

The good news is that you can control high blood pressure with healthy lifestyle choices and medicine if needed.`,
      medicalTerms: [
        {
          term: 'systolic',
          definition: 'The top number in blood pressure - pressure when your heart beats',
          example: 'In 120/80, the 120 is the systolic pressure'
        },
        {
          term: 'diastolic',
          definition: 'The bottom number in blood pressure - pressure when your heart rests',
          example: 'In 120/80, the 80 is the diastolic pressure'
        }
      ],
      keyPoints: [
        'Normal blood pressure is less than 120/80',
        'High blood pressure usually has no symptoms',
        'It can damage your heart, brain, kidneys, and eyes',
        'Lifestyle changes can help lower blood pressure',
        'Medicine may be needed to reach your target',
        'Regular monitoring is important'
      ],
      whenToSeekHelp: [
        'Blood pressure is 180/120 or higher',
        'You have severe headache with high blood pressure',
        'You have chest pain or trouble breathing',
        'You feel dizzy or have vision changes',
        'You have questions about your medicine'
      ],
      resources: [
        {
          title: 'American Heart Association',
          url: 'https://heart.org',
          organization: 'AHA',
          type: 'website',
          description: 'Heart health and blood pressure information',
          language: 'English',
          verified: true
        }
      ],
      lastUpdated: '2023-12-01',
      reviewedBy: 'Dr. Michael Chen, Cardiologist',
      language: 'English'
    }
  ];

  useEffect(() => {
    // In a real app, this would fetch from the API
    setEducationalContent(mockContent);
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const filteredContent = mockContent.filter(content => 
        content.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.condition?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setEducationalContent(filteredContent);
      setLoading(false);
    }, 500);
  };

  const getContentByTopic = (topic: string) => {
    return educationalContent.filter(content => content.topic === topic);
  };

  const getUniqueTopics = () => {
    return Array.from(new Set(educationalContent.map(content => content.topic)));
  };

  const renderTopics = () => (
    <div className="topics-grid">
      {getUniqueTopics().map(topic => (
        <div key={topic} className="topic-card" onClick={() => setSelectedTopic(topic)}>
          <div className="topic-icon">
            <BookOpen size={24} />
          </div>
          <div className="topic-content">
            <h3>{topic.charAt(0).toUpperCase() + topic.slice(1)}</h3>
            <p>{getContentByTopic(topic).length} educational resources</p>
          </div>
          <ChevronRight size={20} className="topic-arrow" />
        </div>
      ))}
    </div>
  );

  const renderTopicDetail = () => {
    if (!selectedTopic) return null;
    
    const topicContent = getContentByTopic(selectedTopic);
    if (topicContent.length === 0) return null;
    
    const content = topicContent[0];
    
    return (
      <div className="topic-detail">
        <div className="detail-header">
          <button className="back-button" onClick={() => setSelectedTopic(null)}>
            ← Back to Topics
          </button>
          <h2>{content.title}</h2>
          <div className="content-meta">
            <span className="reading-level">Grade {content.readingLevel} reading level</span>
            <span className="last-updated">Updated {content.lastUpdated}</span>
            <span className="reviewed-by">Reviewed by {content.reviewedBy}</span>
          </div>
        </div>
        
        <div className="content-section">
          <h3>About {content.condition || content.topic}</h3>
          <p>{content.plainLanguageText}</p>
        </div>
        
        {content.keyPoints.length > 0 && (
          <div className="content-section">
            <h3>Key Points</h3>
            <ul className="key-points">
              {content.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}
        
        {content.medicalTerms.length > 0 && (
          <div className="content-section">
            <h3>Medical Terms Explained</h3>
            <div className="terms-grid">
              {content.medicalTerms.map((term, index) => (
                <div key={index} className="term-card">
                  <h4>{term.term}</h4>
                  <p>{term.definition}</p>
                  {term.example && <p className="term-example"><em>Example:</em> {term.example}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {content.whenToSeekHelp.length > 0 && (
          <div className="content-section">
            <h3>When to Seek Help</h3>
            <ul className="help-list">
              {content.whenToSeekHelp.map((item, index) => (
                <li key={index} className="help-item">
                  <Lightbulb size={16} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {content.relatedResearch && content.relatedResearch.length > 0 && (
          <div className="content-section">
            <h3>Related Research</h3>
            <div className="research-grid">
              {content.relatedResearch.map((article, index) => (
                <div key={index} className="research-card">
                  <h4>{article.title}</h4>
                  <p className="research-authors">{article.authors.join(', ')}</p>
                  <p className="research-journal">{article.journal} • {article.publicationDate}</p>
                  <p className="research-abstract">{article.abstract.substring(0, 200)}...</p>
                  <a 
                    href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="research-link"
                  >
                    Read full article <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {content.resources.length > 0 && (
          <div className="content-section">
            <h3>Additional Resources</h3>
            <div className="resources-grid">
              {content.resources.map((resource, index) => (
                <div key={index} className="resource-card">
                  <div className="resource-icon">
                    {resource.type === 'website' && <ExternalLink size={20} />}
                    {resource.type === 'video' && <FileText size={20} />}
                    {resource.type === 'research_article' && <Book size={20} />}
                  </div>
                  <div className="resource-content">
                    <h4>{resource.title}</h4>
                    <p className="resource-org">{resource.organization}</p>
                    <p>{resource.description}</p>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      Visit resource <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPersonalizedPlan = () => (
    <div className="personalized-plan">
      <h2>Your Personalized Education Plan</h2>
      <div className="plan-overview">
        <div className="plan-card">
          <GraduationCap size={32} />
          <h3>Learning Goals</h3>
          <ul>
            <li>Learn the basics of diabetes management</li>
            <li>Understand medication safety</li>
            <li>Improve nutrition knowledge</li>
          </ul>
        </div>
        
        <div className="plan-card">
          <Clock size={32} />
          <h3>Weekly Schedule</h3>
          <div className="schedule">
            <div className="schedule-item">
              <span className="week">Week 1</span>
              <span className="topic">Diabetes Basics</span>
            </div>
            <div className="schedule-item">
              <span className="week">Week 2</span>
              <span className="topic">Blood Sugar Monitoring</span>
            </div>
            <div className="schedule-item">
              <span className="week">Week 3</span>
              <span className="topic">Healthy Eating</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="plan-actions">
        <button className="primary-button">Start Learning</button>
        <button className="secondary-button">Customize Plan</button>
      </div>
    </div>
  );

  return (
    <div className="patient-education">
      <div className="education-header">
        <h1>
          {userRole === 'patient' ? 'Patient Education' : 'Educational Resources'}
        </h1>
        <p>
          {userRole === 'patient' 
            ? 'Learn about your conditions and how to manage your health'
            : 'Educational materials for patient care and health literacy'}
        </p>
      </div>
      
      <div className="education-controls">
        <div className="search-container">
          <div className="search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search for topics, conditions, or symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button 
            className="search-button"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="literacy-level">Reading Level:</label>
            <select 
              id="literacy-level"
              value={literacyLevel}
              onChange={(e) => setLiteracyLevel(parseInt(e.target.value))}
            >
              <option value="6">Grade 6 and below</option>
              <option value="8">Grade 8 and below</option>
              <option value="10">Grade 10 and below</option>
              <option value="12">Grade 12 and below</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="content-type">Content Type:</label>
            <select id="content-type">
              <option value="all">All Types</option>
              <option value="explanation">Explanations</option>
              <option value="treatment">Treatment Guides</option>
              <option value="prevention">Prevention Tips</option>
              <option value="lifestyle">Lifestyle Advice</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="education-tabs">
        <button 
          className={activeTab === 'topics' ? 'active' : ''}
          onClick={() => setActiveTab('topics')}
        >
          <BookOpen size={18} />
          Topics
        </button>
        <button 
          className={activeTab === 'personalized' ? 'active' : ''}
          onClick={() => setActiveTab('personalized')}
        >
          <GraduationCap size={18} />
          My Plan
        </button>
        <button 
          className={activeTab === 'resources' ? 'active' : ''}
          onClick={() => setActiveTab('resources')}
        >
          <FileText size={18} />
          Resources
        </button>
      </div>
      
      <div className="education-content">
        {activeTab === 'topics' && !selectedTopic && renderTopics()}
        {activeTab === 'topics' && selectedTopic && renderTopicDetail()}
        {activeTab === 'personalized' && renderPersonalizedPlan()}
        {activeTab === 'resources' && (
          <div className="resources-view">
            <h2>Additional Educational Resources</h2>
            <p>Coming soon: Comprehensive library of educational materials</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientEducation;