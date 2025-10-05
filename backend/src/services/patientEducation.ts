import { logger } from '../utils/logger';
import { medicalOntologyService } from './medicalOntologies';
import { PubMedArticle, pubmedService } from './pubmed';

// Patient Education interfaces
export interface EducationalContent {
  id: string;
  title: string;
  topic: string;
  condition?: string;
  contentType: 'explanation' | 'prevention' | 'treatment' | 'lifestyle' | 'medication' | 'test' | 'research';
  readingLevel: number; // Grade level (6-12)
  plainLanguageText: string;
  medicalTerms: MedicalTermExplanation[];
  keyPoints: string[];
  whenToSeekHelp: string[];
  resources: EducationalResource[];
  lastUpdated: string;
  reviewedBy: string;
  language: string;
  relatedResearch?: PubMedArticle[]; // New field for PubMed integration
}

export interface MedicalTermExplanation {
  term: string;
  definition: string;
  pronunciation?: string;
  synonyms?: string[];
  example?: string;
}

export interface EducationalResource {
  title: string;
  url?: string;
  organization: string;
  type: 'website' | 'video' | 'brochure' | 'app' | 'support_group' | 'research_article';
  description: string;
  language: string;
  verified: boolean;
}

export interface PatientQuestionAnswer {
  question: string;
  answer: string;
  category: string;
  relatedTerms: string[];
  confidence: number;
  supportingResearch?: PubMedArticle[]; // New field for research support
}

export interface HealthLiteracyAssessment {
  userId: string;
  readingLevel: number;
  preferredLanguage: string;
  communicationStyle: 'visual' | 'auditory' | 'text' | 'mixed';
  topicsOfInterest: string[];
  knowledgeAreas: {
    medications: 'beginner' | 'intermediate' | 'advanced';
    conditions: 'beginner' | 'intermediate' | 'advanced';
    prevention: 'beginner' | 'intermediate' | 'advanced';
    navigation: 'beginner' | 'intermediate' | 'advanced';
  };
  completedAt: string;
}

export class PatientEducationService {
  private educationalContent: Map<string, EducationalContent> = new Map();
  private medicalTerms: Map<string, MedicalTermExplanation> = new Map();
  private commonQuestions: Map<string, PatientQuestionAnswer[]> = new Map();
  private healthLiteracyProfiles: Map<string, HealthLiteracyAssessment> = new Map();

  constructor() {
    this.initializeEducationalContent();
    this.initializeMedicalTerms();
    this.initializeCommonQuestions();
    
    logger.info('Patient education service initialized');
  }

  private initializeEducationalContent(): void {
    const content: EducationalContent[] = [
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
          },
          {
            title: 'Diabetes Support Groups',
            organization: 'Local Health System',
            type: 'support_group',
            description: 'Connect with others managing diabetes',
            language: 'English',
            verified: true
          }
        ],
        lastUpdated: '2023-12-01',
        reviewedBy: 'Dr. Sarah Johnson, Endocrinologist',
        language: 'English'
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
          },
          {
            term: 'arteries',
            definition: 'Blood vessels that carry blood from your heart to the rest of your body',
            example: 'Think of arteries like highways for your blood'
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
      },
      {
        id: 'medication-safety',
        title: 'Taking Your Medicines Safely',
        topic: 'medication',
        contentType: 'medication',
        readingLevel: 6,
        plainLanguageText: `Taking your medicines the right way is important for your health. Here are some key things to remember:

**Take as prescribed**: Take your medicine exactly as your doctor told you. Don't skip doses or take extra, even if you feel better or worse.

**Set up a routine**: Take your medicines at the same time each day. Use a pill organizer or phone reminders to help you remember.

**Know your medicines**: Know what each medicine is for, how to take it, and what side effects to watch for. Keep a list of all your medicines with you.

**Talk to your pharmacist**: Your pharmacist is a great resource for questions about your medicines. They can help you understand how to take them and what to expect.

**Store safely**: Keep medicines in a cool, dry place away from children. Don't store them in bathrooms or cars where it gets hot and humid.`,
        medicalTerms: [
          {
            term: 'side effects',
            definition: 'Unwanted effects that a medicine might cause',
            example: 'Some medicines might cause drowsiness or upset stomach'
          },
          {
            term: 'generic medicine',
            definition: 'A medicine that works the same as a brand-name medicine but costs less',
            example: 'Ibuprofen is the generic name for Advil'
          }
        ],
        keyPoints: [
          'Take medicines exactly as prescribed',
          'Use reminders to help you remember',
          'Know what each medicine does',
          'Ask questions if you don\'t understand',
          'Store medicines safely',
          'Tell all your doctors about all your medicines'
        ],
        whenToSeekHelp: [
          'You have side effects that worry you',
          'You want to stop taking a medicine',
          'You missed several doses',
          'You have questions about your medicines',
          'You can\'t afford your medicines'
        ],
        resources: [
          {
            title: 'FDA Medicine Safety',
            url: 'https://fda.gov/drugs',
            organization: 'FDA',
            type: 'website',
            description: 'Official medicine safety information',
            language: 'English',
            verified: true
          }
        ],
        lastUpdated: '2023-12-01',
        reviewedBy: 'Dr. Lisa Rodriguez, PharmD',
        language: 'English'
      }
    ];

    content.forEach(item => {
      this.educationalContent.set(item.id, item);
    });
  }

  private initializeMedicalTerms(): void {
    const terms: MedicalTermExplanation[] = [
      {
        term: 'blood pressure',
        definition: 'The force of blood pushing against artery walls',
        pronunciation: 'blud PRESH-er',
        synonyms: ['BP'],
        example: 'Your blood pressure is checked with a cuff around your arm'
      },
      {
        term: 'cholesterol',
        definition: 'A waxy substance in your blood that can clog arteries',
        pronunciation: 'kuh-LES-ter-ol',
        example: 'High cholesterol can increase your risk of heart disease'
      },
      {
        term: 'diabetes',
        definition: 'A condition where your body has trouble controlling blood sugar',
        pronunciation: 'dy-uh-BEE-teez',
        synonyms: ['diabetes mellitus'],
        example: 'People with diabetes need to monitor their blood sugar levels'
      },
      {
        term: 'hypertension',
        definition: 'The medical term for high blood pressure',
        pronunciation: 'hy-per-TEN-shun',
        synonyms: ['high blood pressure'],
        example: 'Hypertension is often called the silent killer'
      },
      {
        term: 'medication',
        definition: 'Medicine prescribed by a doctor to treat a condition',
        pronunciation: 'med-i-KAY-shun',
        synonyms: ['medicine', 'drug', 'prescription'],
        example: 'Take your medication as directed by your doctor'
      }
    ];

    terms.forEach(term => {
      this.medicalTerms.set(term.term.toLowerCase(), term);
    });
  }

  private initializeCommonQuestions(): void {
    const questions: { category: string; qa: PatientQuestionAnswer[] }[] = [
      {
        category: 'diabetes',
        qa: [
          {
            question: 'What can I eat if I have diabetes?',
            answer: 'You can eat most foods, but in the right amounts. Focus on vegetables, lean proteins, whole grains, and fruits. Limit sugary drinks and processed foods. A dietitian can help you create a meal plan that works for you.',
            category: 'diabetes',
            relatedTerms: ['carbohydrates', 'blood sugar', 'meal planning'],
            confidence: 0.95
          },
          {
            question: 'How often should I check my blood sugar?',
            answer: 'This depends on your type of diabetes and treatment plan. Your doctor will tell you how often to check. Many people with type 2 diabetes check once or twice a day, while others may check more often.',
            category: 'diabetes',
            relatedTerms: ['blood glucose monitoring', 'testing'],
            confidence: 0.92
          }
        ]
      },
      {
        category: 'hypertension',
        qa: [
          {
            question: 'What is normal blood pressure?',
            answer: 'Normal blood pressure is less than 120/80 mmHg. High blood pressure is 130/80 or higher. Your doctor will help you understand what target is best for you.',
            category: 'hypertension',
            relatedTerms: ['systolic', 'diastolic', 'blood pressure readings'],
            confidence: 0.98
          },
          {
            question: 'Can I stop taking blood pressure medicine if I feel better?',
            answer: 'No, don\'t stop taking your blood pressure medicine without talking to your doctor first. High blood pressure usually has no symptoms, so feeling good doesn\'t mean your blood pressure is controlled.',
            category: 'hypertension',
            relatedTerms: ['medication adherence', 'treatment'],
            confidence: 0.96
          }
        ]
      },
      {
        category: 'medication',
        qa: [
          {
            question: 'What should I do if I miss a dose of my medicine?',
            answer: 'If you miss a dose, take it as soon as you remember. If it\'s almost time for your next dose, skip the missed dose and take your next dose at the regular time. Don\'t take two doses at once unless your doctor tells you to.',
            category: 'medication',
            relatedTerms: ['dosing', 'missed dose'],
            confidence: 0.94
          }
        ]
      }
    ];

    questions.forEach(categoryData => {
      this.commonQuestions.set(categoryData.category, categoryData.qa);
    });
  }

  // Public methods for patient education
  async getEducationalContent(
    topic: string,
    userLiteracyLevel?: number,
    language: string = 'English'
  ): Promise<EducationalContent[]> {
    const content: EducationalContent[] = [];
    
    for (const item of this.educationalContent.values()) {
      const matchesTopic = item.topic.toLowerCase().includes(topic.toLowerCase()) ||
                          item.condition?.toLowerCase().includes(topic.toLowerCase()) ||
                          item.title.toLowerCase().includes(topic.toLowerCase());
      
      const matchesLanguage = item.language === language;
      const appropriateLevel = !userLiteracyLevel || item.readingLevel <= userLiteracyLevel + 2;
      
      if (matchesTopic && matchesLanguage && appropriateLevel) {
        // Add related research for educational content
        if (item.contentType === 'explanation' || item.contentType === 'treatment') {
          try {
            const researchResults = await pubmedService.search(topic, { maxResults: 3 });
            item.relatedResearch = researchResults.articles;
          } catch (error) {
            logger.warn(`Failed to fetch related research for ${topic}:`, error);
          }
        }
        
        content.push(item);
      }
    }
    
    return content.sort((a, b) => a.readingLevel - b.readingLevel);
  }

  async explainMedicalTerm(term: string, context?: string): Promise<MedicalTermExplanation | null> {
    const normalizedTerm = term.toLowerCase();
    const explanation = this.medicalTerms.get(normalizedTerm);
    
    if (explanation) {
      return explanation;
    }
    
    // Try to find by synonym
    for (const termExplanation of this.medicalTerms.values()) {
      if (termExplanation.synonyms?.some(synonym => 
        synonym.toLowerCase().includes(normalizedTerm) ||
        normalizedTerm.includes(synonym.toLowerCase())
      )) {
        return termExplanation;
      }
    }
    
    // If not found, try to use medical ontology service to get basic info
    const medicalCodes = medicalOntologyService.searchMedicalCodes(term);
    if (medicalCodes.length > 0) {
      const bestMatch = medicalCodes[0];
      return {
        term: term,
        definition: `Medical term: ${bestMatch.description}`,
        example: `This is a medical condition or procedure code: ${bestMatch.code}`
      };
    }
    
    return null;
  }

  async translateToPlainLanguage(
    medicalText: string,
    targetReadingLevel: number = 6,
    userContext?: HealthLiteracyAssessment
  ): Promise<{
    plainLanguageText: string;
    complexTermsExplained: MedicalTermExplanation[];
    readingLevel: number;
    confidence: number;
  }> {
    // Extract medical terms from the text
    const extractedCodes = medicalOntologyService.extractMedicalCodesFromText(medicalText);
    const complexTermsExplained: MedicalTermExplanation[] = [];
    
    // Find explanations for complex terms
    const medicalTermPattern = /\b(?:hypertension|diabetes|myocardial|cerebrovascular|cardiovascular|atherosclerosis|nephropathy|retinopathy|neuropathy)\b/gi;
    const complexTerms = medicalText.match(medicalTermPattern) || [];
    
    for (const term of complexTerms) {
      const explanation = await this.explainMedicalTerm(term);
      if (explanation) {
        complexTermsExplained.push(explanation);
      }
    }
    
    // Simplify the text (in a real implementation, this would use NLP)
    let simplifiedText = medicalText;
    
    // Replace complex terms with simpler explanations
    const replacements: { [key: string]: string } = {
      'hypertension': 'high blood pressure',
      'diabetes mellitus': 'diabetes',
      'myocardial infarction': 'heart attack',
      'cerebrovascular accident': 'stroke',
      'cardiovascular': 'heart and blood vessel',
      'atherosclerosis': 'hardening of the arteries',
      'nephropathy': 'kidney damage',
      'retinopathy': 'eye damage',
      'neuropathy': 'nerve damage',
      'administered': 'given',
      'demonstrate': 'show',
      'initiate': 'start',
      'terminate': 'stop',
      'utilize': 'use',
      'monitor': 'watch',
      'assess': 'check'
    };
    
    Object.entries(replacements).forEach(([complex, simple]) => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simplifiedText = simplifiedText.replace(regex, simple);
    });
    
    // Estimate reading level (simplified calculation)
    const words = simplifiedText.split(/\s+/).length;
    const sentences = simplifiedText.split(/[.!?]+/).length;
    const syllables = this.estimateSyllables(simplifiedText);
    
    // Flesch-Kincaid Grade Level formula (simplified)
    const readingLevel = Math.max(1, Math.round(
      0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
    ));
    
    return {
      plainLanguageText: simplifiedText,
      complexTermsExplained,
      readingLevel,
      confidence: 0.8 // Would be more sophisticated in real implementation
    };
  }

  private estimateSyllables(text: string): number {
    // Simplified syllable counting
    const vowelPattern = /[aeiouy]+/gi;
    const words = text.toLowerCase().split(/\s+/);
    let totalSyllables = 0;
    
    words.forEach(word => {
      const vowelMatches = word.match(vowelPattern);
      let syllables = vowelMatches ? vowelMatches.length : 1;
      
      // Adjust for silent e
      if (word.endsWith('e') && syllables > 1) {
        syllables--;
      }
      
      totalSyllables += Math.max(1, syllables);
    });
    
    return totalSyllables;
  }

  async answerPatientQuestion(
    question: string,
    userContext?: HealthLiteracyAssessment
  ): Promise<PatientQuestionAnswer | null> {
    const normalizedQuestion = question.toLowerCase();
    
    // Search through common questions
    for (const [category, questions] of this.commonQuestions.entries()) {
      for (const qa of questions) {
        const normalizedStoredQuestion = qa.question.toLowerCase();
        
        // Simple similarity check (in production, would use more sophisticated NLP)
        if (this.calculateSimilarity(normalizedQuestion, normalizedStoredQuestion) > 0.7) {
          // Add supporting research
          try {
            const researchResults = await pubmedService.search(question, { maxResults: 2 });
            qa.supportingResearch = researchResults.articles;
          } catch (error) {
            logger.warn(`Failed to fetch supporting research for question: ${question}`, error);
          }
          
          return qa;
        }
      }
    }
    
    // If no direct match, try to find relevant content
    const relevantContent = await this.getEducationalContent(
      question, 
      userContext?.readingLevel,
      userContext?.preferredLanguage
    );
    
    if (relevantContent.length > 0) {
      const content = relevantContent[0];
      
      // Get supporting research
      let supportingResearch: PubMedArticle[] = [];
      try {
        const researchResults = await pubmedService.search(question, { maxResults: 2 });
        supportingResearch = researchResults.articles;
      } catch (error) {
        logger.warn(`Failed to fetch supporting research for question: ${question}`, error);
      }
      
      return {
        question: question,
        answer: `Based on your question about ${content.topic}, here's what you should know: ${content.plainLanguageText.substring(0, 300)}...`,
        category: content.topic,
        relatedTerms: content.medicalTerms.map(t => t.term),
        confidence: 0.7,
        supportingResearch
      };
    }
    
    return null;
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  async createPersonalizedEducationPlan(
    userId: string,
    conditions: string[],
    literacyAssessment: HealthLiteracyAssessment
  ): Promise<{
    recommendedContent: EducationalContent[];
    learningGoals: string[];
    scheduledTopics: { week: number; topic: string; content: string[] }[];
  }> {
    const recommendedContent: EducationalContent[] = [];
    
    // Get content for each condition
    for (const condition of conditions) {
      const content = await this.getEducationalContent(
        condition,
        literacyAssessment.readingLevel,
        literacyAssessment.preferredLanguage
      );
      recommendedContent.push(...content);
    }
    
    // Create learning goals based on knowledge areas
    const learningGoals: string[] = [];
    Object.entries(literacyAssessment.knowledgeAreas).forEach(([area, level]) => {
      if (level === 'beginner') {
        learningGoals.push(`Learn the basics of ${area}`);
      } else if (level === 'intermediate') {
        learningGoals.push(`Deepen understanding of ${area}`);
      }
    });
    
    // Create a weekly schedule
    const scheduledTopics = this.createLearningSchedule(recommendedContent, literacyAssessment);
    
    return {
      recommendedContent,
      learningGoals,
      scheduledTopics
    };
  }

  private createLearningSchedule(
    content: EducationalContent[],
    assessment: HealthLiteracyAssessment
  ): { week: number; topic: string; content: string[] }[] {
    const schedule: { week: number; topic: string; content: string[] }[] = [];
    
    // Group content by topic
    const topicGroups = new Map<string, EducationalContent[]>();
    content.forEach(item => {
      if (!topicGroups.has(item.topic)) {
        topicGroups.set(item.topic, []);
      }
      topicGroups.get(item.topic)!.push(item);
    });
    
    // Create weekly schedule
    let week = 1;
    topicGroups.forEach((items, topic) => {
      schedule.push({
        week: week++,
        topic,
        content: items.map(item => item.title)
      });
    });
    
    return schedule;
  }

  async getHealthLiteracyAssessment(userId: string): Promise<HealthLiteracyAssessment | null> {
    return this.healthLiteracyProfiles.get(userId) || null;
  }

  async saveHealthLiteracyAssessment(assessment: HealthLiteracyAssessment): Promise<void> {
    this.healthLiteracyProfiles.set(assessment.userId, assessment);
    logger.info(`Health literacy assessment saved for user ${assessment.userId}`);
  }

  async getTopicResources(topic: string, verified: boolean = true): Promise<EducationalResource[]> {
    const resources: EducationalResource[] = [];
    
    for (const content of this.educationalContent.values()) {
      if (content.topic.toLowerCase().includes(topic.toLowerCase()) ||
          content.condition?.toLowerCase().includes(topic.toLowerCase())) {
        const filteredResources = verified ? 
          content.resources.filter(r => r.verified) : 
          content.resources;
        resources.push(...filteredResources);
      }
    }
    
    // Add research articles as resources
    try {
      const researchResults = await pubmedService.search(topic, { maxResults: 5 });
      const researchResources: EducationalResource[] = researchResults.articles.map(article => ({
        title: article.title,
        url: `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
        organization: article.journal,
        type: 'research_article',
        description: article.abstract.substring(0, 200) + '...',
        language: article.language,
        verified: true
      }));
      resources.push(...researchResources);
    } catch (error) {
      logger.warn(`Failed to fetch research resources for topic ${topic}:`, error);
    }
    
    // Remove duplicates
    const uniqueResources = resources.filter((resource, index, self) =>
      index === self.findIndex(r => r.url === resource.url && r.title === resource.title)
    );
    
    return uniqueResources;
  }
}

// Singleton instance
export const patientEducationService = new PatientEducationService();