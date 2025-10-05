import { logger } from '../utils/logger';
import { UserRole } from '../types/index';
import { medicalOntologyService } from './medicalOntologies';

// LLM Configuration interfaces
export interface LLMConfig {
  modelPath: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  contextLength: number;
}

export interface MedicalPromptTemplate {
  role: UserRole;
  intent: string;
  template: string;
  systemPrompt: string;
  maxResponseLength: number;
}

export interface LLMResponse {
  text: string;
  confidence: number;
  tokens: number;
  processingTime: number;
  medicalEntities: any[];
  suggestions: string[];
  educationalContent?: string;
}

export interface ConversationContext {
  userId: string;
  userRole: UserRole;
  previousQueries: string[];
  medicalHistory?: any;
  currentSymptoms?: string[];
  medications?: string[];
}

export class LocalLLMService {
  private config: LLMConfig;
  private promptTemplates: Map<string, MedicalPromptTemplate> = new Map();
  private conversationContexts: Map<string, ConversationContext> = new Map();
  private modelLoaded: boolean = false;

  constructor(config: LLMConfig) {
    this.config = config;
    this.initializePromptTemplates();
  }

  private initializePromptTemplates(): void {
    // System prompts for different user roles and intents
    const templates: MedicalPromptTemplate[] = [
      {
        role: 'clinician',
        intent: 'diagnosis_support',
        systemPrompt: `You are an AI medical assistant helping clinicians with diagnostic support. Provide evidence-based insights, differential diagnoses, and clinical recommendations. Always emphasize the need for clinical judgment and proper examination. Include relevant medical codes when appropriate.`,
        template: `Based on the following clinical information: {query}

Please provide:
1. Differential diagnosis considerations
2. Recommended diagnostic workup
3. Clinical decision-making insights
4. Relevant medical codes (ICD-10, CPT)
5. Evidence-based treatment considerations

Clinical Context: {context}`,
        maxResponseLength: 1000
      },
      {
        role: 'clinician',
        intent: 'search_patients',
        systemPrompt: `You are an AI assistant helping clinicians search and analyze patient data. Provide structured insights about patient populations, risk factors, and clinical patterns.`,
        template: `Analyze this patient search query: {query}

Provide insights on:
1. Patient population characteristics
2. Risk stratification factors
3. Clinical pattern analysis
4. Quality measures and outcomes
5. Recommended follow-up actions

Search Context: {context}`,
        maxResponseLength: 800
      },
      {
        role: 'clinician',
        intent: 'medication_review',
        systemPrompt: `You are a clinical pharmacist AI assistant. Provide drug interaction checks, dosing recommendations, and medication optimization insights for clinicians.`,
        template: `Review the following medication information: {query}

Provide analysis on:
1. Drug interactions and contraindications
2. Dosing appropriateness
3. Therapeutic alternatives
4. Monitoring requirements
5. Cost-effectiveness considerations

Patient Context: {context}`,
        maxResponseLength: 900
      },
      {
        role: 'patient',
        intent: 'explain_results',
        systemPrompt: `You are a patient education AI assistant. Explain medical information in simple, clear language that patients can understand. Focus on reassurance, education, and actionable guidance while encouraging communication with healthcare providers.`,
        template: `Explain the following medical information in patient-friendly language: {query}

Please provide:
1. Simple explanation of what this means
2. Why this test/result is important
3. What patients should know or do
4. When to contact their healthcare provider
5. Reassuring context and next steps

Keep language at a 6th-grade reading level and avoid medical jargon.

Patient Context: {context}`,
        maxResponseLength: 600
      },
      {
        role: 'patient',
        intent: 'medication_info',
        systemPrompt: `You are a patient education assistant specializing in medication information. Provide clear, accurate information about medications in language patients can understand.`,
        template: `Provide patient-friendly information about: {query}

Include:
1. What this medication does (in simple terms)
2. Common side effects to watch for
3. Important things to remember when taking it
4. When to call the doctor
5. Lifestyle considerations

Use simple language and focus on practical guidance.

Patient Context: {context}`,
        maxResponseLength: 500
      },
      {
        role: 'patient',
        intent: 'symptom_guidance',
        systemPrompt: `You are a patient triage and education assistant. Provide helpful guidance about symptoms while emphasizing the importance of professional medical evaluation when appropriate.`,
        template: `Provide guidance about these symptoms or concerns: {query}

Please include:
1. General information about these symptoms
2. Common causes (in simple terms)
3. Self-care measures that may help
4. Warning signs that require immediate medical attention
5. When to schedule an appointment with a healthcare provider

Always emphasize that this is educational information and not a substitute for professional medical advice.

Patient History: {context}`,
        maxResponseLength: 700
      }
    ];

    templates.forEach(template => {
      const key = `${template.role}_${template.intent}`;
      this.promptTemplates.set(key, template);
    });

    logger.info('LLM prompt templates initialized');
  }

  async loadModel(): Promise<boolean> {
    try {
      // In a real implementation, this would load the actual LLM model
      // For now, we'll simulate model loading
      logger.info(`Loading LLM model from ${this.config.modelPath}`);
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.modelLoaded = true;
      logger.info('LLM model loaded successfully');
      return true;
    } catch (error) {
      logger.error('Failed to load LLM model:', error);
      return false;
    }
  }

  async generateResponse(
    query: string,
    userRole: UserRole,
    intent: string,
    context: ConversationContext
  ): Promise<LLMResponse> {
    if (!this.modelLoaded) {
      await this.loadModel();
    }

    const startTime = Date.now();
    
    try {
      const templateKey = `${userRole}_${intent}`;
      const template = this.promptTemplates.get(templateKey);
      
      if (!template) {
        throw new Error(`No template found for role: ${userRole}, intent: ${intent}`);
      }

      // Build the prompt
      const prompt = this.buildPrompt(template, query, context);
      
      // Extract medical entities from the query
      const medicalEntities = medicalOntologyService.extractMedicalCodesFromText(query);
      
      // Generate response (simulated for now)
      const response = await this.callLLMModel(prompt, template);
      
      // Generate suggestions based on role and intent
      const suggestions = this.generateSuggestions(query, userRole, intent, context);
      
      // Add educational content for patients
      const educationalContent = userRole === 'patient' ? 
        this.generateEducationalContent(query, medicalEntities.codes) : undefined;

      const processingTime = Date.now() - startTime;

      return {
        text: response.text,
        confidence: response.confidence,
        tokens: response.tokens,
        processingTime,
        medicalEntities: medicalEntities.codes,
        suggestions,
        educationalContent
      };

    } catch (error) {
      logger.error('LLM response generation failed:', error);
      
      // Fallback response
      return {
        text: this.generateFallbackResponse(userRole, intent),
        confidence: 0.5,
        tokens: 0,
        processingTime: Date.now() - startTime,
        medicalEntities: [],
        suggestions: []
      };
    }
  }

  private buildPrompt(
    template: MedicalPromptTemplate,
    query: string,
    context: ConversationContext
  ): string {
    const contextString = JSON.stringify({
      previousQueries: context.previousQueries.slice(-3), // Last 3 queries
      medicalHistory: context.medicalHistory,
      medications: context.medications,
      symptoms: context.currentSymptoms
    });

    return template.systemPrompt + '\n\n' + 
           template.template
             .replace('{query}', query)
             .replace('{context}', contextString);
  }

  private async callLLMModel(prompt: string, template: MedicalPromptTemplate): Promise<{
    text: string;
    confidence: number;
    tokens: number;
  }> {
    // Simulate LLM model call - in production this would call the actual model
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Generate a simulated response based on the template and role
    const simulatedResponse = this.generateSimulatedResponse(prompt, template);
    
    return {
      text: simulatedResponse,
      confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95
      tokens: Math.floor(simulatedResponse.length / 4) // Rough token estimation
    };
  }

  private generateSimulatedResponse(prompt: string, template: MedicalPromptTemplate): string {
    const role = template.role;
    const intent = template.intent;
    
    // Generate contextually appropriate responses based on role and intent
    if (role === 'clinician') {
      if (intent === 'diagnosis_support') {
        return `Based on the clinical presentation, key differential diagnoses to consider include:

1. **Primary considerations**: Common conditions matching the symptom pattern
2. **Diagnostic workup**: Recommended laboratory tests, imaging, and clinical assessments
3. **Clinical decision points**: Key factors to guide next steps
4. **Evidence base**: Current guidelines and research supporting these recommendations

**Recommended actions**: 
- Complete focused history and physical examination
- Consider appropriate diagnostic testing based on clinical judgment
- Reassess based on objective findings
- Consider specialist consultation if indicated

**Medical codes for documentation**:
- Relevant ICD-10 codes for suspected conditions
- Appropriate CPT codes for procedures/tests

This assessment supports clinical decision-making but requires professional medical judgment for final diagnosis and treatment decisions.`;
      } else if (intent === 'search_patients') {
        return `Patient population analysis reveals several important patterns:

**Demographics and Risk Factors**:
- Age distribution and gender patterns
- Comorbidity clustering
- Risk stratification insights

**Clinical Patterns**:
- Common presentation characteristics
- Outcome trends and quality measures
- Treatment response patterns

**Recommendations**:
- Targeted screening protocols
- Population health interventions
- Quality improvement opportunities
- Care coordination strategies

These insights can inform clinical protocols and population health management strategies.`;
      }
    } else if (role === 'patient') {
      if (intent === 'explain_results') {
        return `Here's what your results mean in simple terms:

**What this shows**: Your test results give us important information about your health. Think of medical tests like checking the engine in your car - they help us see how well everything is working.

**What's important to know**:
- Normal ranges and what your numbers mean
- Why your doctor ordered this test
- What the results tell us about your health

**What you should do**:
- Follow up with your healthcare provider as recommended
- Ask questions if anything is unclear
- Continue taking medications as prescribed
- Make any lifestyle changes discussed

**When to call your doctor**:
- If you have new or worsening symptoms
- If you have questions about your results
- Before making any changes to your medications

Remember, your healthcare team is here to help you understand and manage your health. Never hesitate to ask questions!`;
      } else if (intent === 'medication_info') {
        return `Here's helpful information about your medication:

**What it does**: This medication works by helping your body in a specific way to improve your health condition.

**Taking your medication**:
- Take exactly as prescribed by your doctor
- Don't skip doses or stop without talking to your healthcare provider
- Take with or without food as directed

**What to watch for**:
- Common side effects are usually mild and temporary
- Most people tolerate this medication well
- Report any concerning symptoms to your doctor

**Important reminders**:
- Keep taking it even if you feel better
- Don't share with others
- Store properly as directed

**Questions for your doctor**:
- How long will I need to take this?
- What should I do if I miss a dose?
- Are there any foods or other medications to avoid?

Your pharmacist and doctor are great resources for any questions about your medications.`;
      }
    }
    
    return `Thank you for your question. Based on the information provided, I can offer some general guidance. However, it's important to discuss your specific situation with your healthcare provider for personalized advice and recommendations.`;
  }

  private generateSuggestions(
    query: string,
    userRole: UserRole,
    intent: string,
    context: ConversationContext
  ): string[] {
    const suggestions: string[] = [];
    
    if (userRole === 'clinician') {
      switch (intent) {
        case 'diagnosis_support':
          suggestions.push(
            'Review recent lab results and imaging',
            'Check for medication interactions',
            'Consider specialist referral',
            'Update clinical documentation',
            'Review evidence-based guidelines'
          );
          break;
        case 'search_patients':
          suggestions.push(
            'Filter by age group or demographics',
            'Search by specific conditions',
            'Review quality metrics',
            'Export patient list for analysis',
            'Set up care coordination protocols'
          );
          break;
        default:
          suggestions.push(
            'Search similar cases',
            'Review clinical guidelines',
            'Check drug interactions',
            'Access medical references'
          );
      }
    } else if (userRole === 'patient') {
      switch (intent) {
        case 'explain_results':
          suggestions.push(
            'Schedule follow-up appointment',
            'Ask about lifestyle changes',
            'Learn about your condition',
            'Find support resources',
            'Understand next steps'
          );
          break;
        case 'medication_info':
          suggestions.push(
            'Set medication reminders',
            'Learn about side effects',
            'Ask about generic options',
            'Understand drug interactions',
            'Find patient assistance programs'
          );
          break;
        default:
          suggestions.push(
            'Schedule an appointment',
            'Learn about your condition',
            'Find support resources',
            'Get second opinion information'
          );
      }
    }
    
    return suggestions;
  }

  private generateEducationalContent(query: string, medicalCodes: any[]): string {
    if (medicalCodes.length === 0) {
      return 'For more information about your health, consider reliable sources like your healthcare provider, reputable medical websites, or patient education materials provided by your care team.';
    }

    const conditions = medicalCodes
      .filter(code => code.system === 'ICD10')
      .map(code => code.description)
      .slice(0, 2); // Limit to top 2 conditions

    if (conditions.length > 0) {
      return `**Learn More About Your Health**: 
Understanding ${conditions.join(' and ')} can help you take better care of yourself. Ask your healthcare provider for educational materials, reliable websites, or support group information. Knowledge about your health conditions empowers you to make informed decisions and actively participate in your care.`;
    }

    return 'Your healthcare team can provide educational resources tailored to your specific health needs. Don\'t hesitate to ask for materials that can help you understand and manage your health better.';
  }

  private generateFallbackResponse(userRole: UserRole, intent: string): string {
    if (userRole === 'clinician') {
      return 'I apologize, but I\'m unable to provide a complete response at this time. Please consult clinical guidelines, medical references, or consider specialist consultation for this case.';
    } else {
      return 'I\'m sorry, but I\'m unable to provide a complete answer right now. Please contact your healthcare provider for personalized guidance about your health concerns.';
    }
  }

  updateConversationContext(
    userId: string,
    query: string,
    userRole: UserRole,
    additionalContext?: Partial<ConversationContext>
  ): void {
    const existingContext = this.conversationContexts.get(userId) || {
      userId,
      userRole,
      previousQueries: []
    };

    existingContext.previousQueries.push(query);
    
    // Keep only last 10 queries
    if (existingContext.previousQueries.length > 10) {
      existingContext.previousQueries = existingContext.previousQueries.slice(-10);
    }

    // Update with additional context if provided
    if (additionalContext) {
      Object.assign(existingContext, additionalContext);
    }

    this.conversationContexts.set(userId, existingContext);
  }

  getConversationContext(userId: string): ConversationContext | null {
    return this.conversationContexts.get(userId) || null;
  }

  clearConversationContext(userId: string): void {
    this.conversationContexts.delete(userId);
  }

  async healthCheck(): Promise<boolean> {
    return this.modelLoaded;
  }

  getModelInfo(): any {
    return {
      modelPath: this.config.modelPath,
      loaded: this.modelLoaded,
      contextLength: this.config.contextLength,
      availableTemplates: Array.from(this.promptTemplates.keys())
    };
  }
}

// Initialize with default configuration
const defaultConfig: LLMConfig = {
  modelPath: process.env.LLM_MODEL_PATH || '/models/medical-llm',
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0.1,
  presencePenalty: 0.1,
  contextLength: 4096
};

export const localLLMService = new LocalLLMService(defaultConfig);