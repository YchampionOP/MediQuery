import { logger } from '../utils/logger';
import { PatientModel } from '../models/Patient';
import { medicalOntologyService } from './medicalOntologies';

// Export interfaces
export interface ExportOptions {
  format: 'PDF' | 'CSV' | 'JSON' | 'XML' | 'HTML';
  includeSections: ExportSection[];
  dateRange?: {
    start: string;
    end: string;
  };
  userRole: 'clinician' | 'patient';
  patientId?: string;
  includeImages: boolean;
  includeCharts: boolean;
  confidentiality: 'full' | 'summarized' | 'redacted';
  purpose: 'clinical_summary' | 'patient_education' | 'research' | 'legal' | 'insurance';
}

export interface ExportSection {
  section: 'demographics' | 'conditions' | 'medications' | 'lab_results' | 'clinical_notes' | 
           'timeline' | 'charts' | 'recommendations' | 'educational_content';
  includeDetails: boolean;
  customFields?: string[];
}

export interface ExportResult {
  exportId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt: string;
  fileSize?: number;
  format: string;
  createdAt: string;
  requestedBy: string;
  patientId?: string;
  metadata: ExportMetadata;
}

export interface ExportMetadata {
  totalPages?: number;
  sections: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  confidentialityLevel: string;
  purpose: string;
  watermark?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'clinical' | 'patient' | 'research' | 'quality';
  sections: ExportSection[];
  defaultFormat: 'PDF' | 'CSV' | 'JSON';
  userRole: 'clinician' | 'patient' | 'both';
  customizable: boolean;
}

export class ExportService {
  private activeExports: Map<string, ExportResult> = new Map();
  private reportTemplates: Map<string, ReportTemplate> = new Map();

  constructor() {
    this.initializeReportTemplates();
    logger.info('Export service initialized');
  }

  private initializeReportTemplates(): void {
    const templates: ReportTemplate[] = [
      {
        id: 'comprehensive-clinical-summary',
        name: 'Comprehensive Clinical Summary',
        description: 'Complete patient summary for clinical handoffs and referrals',
        category: 'clinical',
        sections: [
          { section: 'demographics', includeDetails: true },
          { section: 'conditions', includeDetails: true },
          { section: 'medications', includeDetails: true },
          { section: 'lab_results', includeDetails: true },
          { section: 'clinical_notes', includeDetails: true },
          { section: 'timeline', includeDetails: true },
          { section: 'recommendations', includeDetails: true }
        ],
        defaultFormat: 'PDF',
        userRole: 'clinician',
        customizable: true
      },
      {
        id: 'patient-summary',
        name: 'Patient Health Summary',
        description: 'Patient-friendly health summary with educational content',
        category: 'patient',
        sections: [
          { section: 'demographics', includeDetails: false },
          { section: 'conditions', includeDetails: false },
          { section: 'medications', includeDetails: true },
          { section: 'lab_results', includeDetails: false },
          { section: 'educational_content', includeDetails: true }
        ],
        defaultFormat: 'PDF',
        userRole: 'patient',
        customizable: false
      },
      {
        id: 'medication-list',
        name: 'Current Medications Report',
        description: 'Detailed medication list with dosing and instructions',
        category: 'clinical',
        sections: [
          { section: 'demographics', includeDetails: false },
          { section: 'medications', includeDetails: true }
        ],
        defaultFormat: 'PDF',
        userRole: 'both',
        customizable: true
      },
      {
        id: 'lab-results-summary',
        name: 'Laboratory Results Summary',
        description: 'Comprehensive lab results with trends and interpretations',
        category: 'clinical',
        sections: [
          { section: 'demographics', includeDetails: false },
          { section: 'lab_results', includeDetails: true },
          { section: 'charts', includeDetails: true }
        ],
        defaultFormat: 'PDF',
        userRole: 'clinician',
        customizable: true
      },
      {
        id: 'quality-measures-report',
        name: 'Quality Measures Report',
        description: 'Quality indicators and performance metrics',
        category: 'quality',
        sections: [
          { section: 'demographics', includeDetails: false },
          { section: 'conditions', includeDetails: true },
          { section: 'medications', includeDetails: true },
          { section: 'lab_results', includeDetails: true }
        ],
        defaultFormat: 'CSV',
        userRole: 'clinician',
        customizable: true
      }
    ];

    templates.forEach(template => {
      this.reportTemplates.set(template.id, template);
    });
  }

  async generateExport(
    exportOptions: ExportOptions,
    requestedBy: string,
    patientData?: any
  ): Promise<ExportResult> {
    const exportId = this.generateExportId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const exportResult: ExportResult = {
      exportId,
      status: 'pending',
      expiresAt,
      format: exportOptions.format,
      createdAt: new Date().toISOString(),
      requestedBy,
      patientId: exportOptions.patientId,
      metadata: {
        sections: exportOptions.includeSections.map(s => s.section),
        dateRange: exportOptions.dateRange,
        confidentialityLevel: exportOptions.confidentiality,
        purpose: exportOptions.purpose,
        watermark: this.generateWatermark(exportOptions.userRole, requestedBy)
      }
    };

    this.activeExports.set(exportId, exportResult);

    // Start async processing
    this.processExport(exportId, exportOptions, patientData)
      .catch(error => {
        logger.error(`Export ${exportId} failed:`, error);
        const failedResult = { ...exportResult, status: 'failed' as const };
        this.activeExports.set(exportId, failedResult);
      });

    return exportResult;
  }

  private async processExport(
    exportId: string,
    options: ExportOptions,
    patientData?: any
  ): Promise<void> {
    try {
      // Update status to processing
      const exportResult = this.activeExports.get(exportId)!;
      exportResult.status = 'processing';
      this.activeExports.set(exportId, exportResult);

      // Generate the export based on format
      let exportContent: string | Buffer;
      let fileSize: number;

      switch (options.format) {
        case 'PDF':
          { const pdfResult = await this.generatePDF(options, patientData);
          exportContent = pdfResult.content;
          fileSize = pdfResult.size; }
          break;
        case 'CSV':
          { const csvResult = await this.generateCSV(options, patientData);
          exportContent = csvResult.content;
          fileSize = csvResult.size; }
          break;
        case 'JSON':
          { const jsonResult = await this.generateJSON(options, patientData);
          exportContent = jsonResult.content;
          fileSize = jsonResult.size; }
          break;
        case 'XML':
          { const xmlResult = await this.generateXML(options, patientData);
          exportContent = xmlResult.content;
          fileSize = xmlResult.size; }
          break;
        case 'HTML':
          { const htmlResult = await this.generateHTML(options, patientData);
          exportContent = htmlResult.content;
          fileSize = htmlResult.size; }
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      // In a real implementation, save to file storage and get download URL
      const downloadUrl = await this.saveExportFile(exportId, exportContent, options.format);

      // Update result with completion info
      exportResult.status = 'completed';
      exportResult.downloadUrl = downloadUrl;
      exportResult.fileSize = fileSize;
      this.activeExports.set(exportId, exportResult);

      logger.info(`Export ${exportId} completed successfully`);

    } catch (error) {
      logger.error(`Export processing failed for ${exportId}:`, error);
      throw error;
    }
  }

  private async generatePDF(options: ExportOptions, patientData?: any): Promise<{ content: Buffer; size: number }> {
    // In a real implementation, this would use a PDF generation library like PDFKit or Puppeteer
    const htmlContent = await this.generateHTML(options, patientData);
    
    // Simulate PDF generation
    const pdfContent = Buffer.from(`PDF VERSION:\n${htmlContent.content}`, 'utf-8');
    
    return {
      content: pdfContent,
      size: pdfContent.length
    };
  }

  private async generateHTML(options: ExportOptions, patientData?: any): Promise<{ content: string; size: number }> {
    let html = this.getHTMLHeader(options);
    
    // Add content based on included sections
    for (const section of options.includeSections) {
      html += await this.generateSectionHTML(section, options, patientData);
    }
    
    html += this.getHTMLFooter(options);
    
    return {
      content: html,
      size: Buffer.byteLength(html, 'utf8')
    };
  }

  private async generateCSV(options: ExportOptions, patientData?: any): Promise<{ content: string; size: number }> {
    const csvRows: string[] = [];
    
    // Add headers based on sections
    const headers = this.getCSVHeaders(options.includeSections);
    csvRows.push(headers.join(','));
    
    // Add data rows
    if (patientData) {
      const dataRows = await this.generateCSVData(options, patientData);
      csvRows.push(...dataRows);
    }
    
    const csvContent = csvRows.join('\n');
    
    return {
      content: csvContent,
      size: Buffer.byteLength(csvContent, 'utf8')
    };
  }

  private async generateJSON(options: ExportOptions, patientData?: any): Promise<{ content: string; size: number }> {
    const jsonData: any = {
      exportMetadata: {
        exportId: this.generateExportId(),
        generatedAt: new Date().toISOString(),
        requestedBy: options.userRole,
        format: 'JSON',
        confidentiality: options.confidentiality,
        purpose: options.purpose
      },
      patientData: {}
    };
    
    // Add data based on included sections
    for (const section of options.includeSections) {
      jsonData.patientData[section.section] = await this.extractSectionData(section, patientData, options);
    }
    
    const jsonContent = JSON.stringify(jsonData, null, 2);
    
    return {
      content: jsonContent,
      size: Buffer.byteLength(jsonContent, 'utf8')
    };
  }

  private async generateXML(options: ExportOptions, patientData?: any): Promise<{ content: string; size: number }> {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<clinical_report>\n';
    xml += `  <metadata>\n`;
    xml += `    <generated_at>${new Date().toISOString()}</generated_at>\n`;
    xml += `    <format>XML</format>\n`;
    xml += `    <confidentiality>${options.confidentiality}</confidentiality>\n`;
    xml += `    <purpose>${options.purpose}</purpose>\n`;
    xml += `  </metadata>\n`;
    
    // Add sections
    for (const section of options.includeSections) {
      xml += await this.generateSectionXML(section, options, patientData);
    }
    
    xml += '</clinical_report>\n';
    
    return {
      content: xml,
      size: Buffer.byteLength(xml, 'utf8')
    };
  }

  private getHTMLHeader(options: ExportOptions): string {
    const title = this.getReportTitle(options);
    const watermark = options.userRole === 'patient' ? 'PATIENT COPY' : 'CONFIDENTIAL';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); 
                    font-size: 72px; color: rgba(0,0,0,0.1); font-weight: bold; z-index: -1; }
        .section { margin-bottom: 30px; }
        .section-title { background: #f5f5f5; padding: 10px; font-weight: bold; border-left: 4px solid #007bff; }
        .patient-info { background: #e8f4fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="watermark">${watermark}</div>
    <div class="header">
        <h1>${title}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>Confidentiality Level: ${options.confidentiality.toUpperCase()}</p>
        <p>Purpose: ${options.purpose.replace('_', ' ').toUpperCase()}</p>
    </div>
`;
  }

  private getHTMLFooter(options: ExportOptions): string {
    return `
    <div class="footer">
        <p><strong>Important Notice:</strong> This report contains confidential medical information. 
        Unauthorized disclosure is prohibited by law.</p>
        <p>Generated by MediQuery AI Healthcare Search Platform</p>
        <p>Export ID: ${this.generateExportId()} | Generated for: ${options.userRole}</p>
    </div>
</body>
</html>
`;
  }

  private async generateSectionHTML(section: ExportSection, options: ExportOptions, patientData?: any): string {
    const sectionData = await this.extractSectionData(section, patientData, options);
    
    switch (section.section) {
      case 'demographics':
        return this.formatDemographicsHTML(sectionData, section.includeDetails);
      case 'conditions':
        return this.formatConditionsHTML(sectionData, section.includeDetails);
      case 'medications':
        return this.formatMedicationsHTML(sectionData, section.includeDetails);
      case 'lab_results':
        return this.formatLabResultsHTML(sectionData, section.includeDetails);
      case 'timeline':
        return this.formatTimelineHTML(sectionData, section.includeDetails);
      default:
        return `<div class="section"><div class="section-title">${section.section.replace('_', ' ').toUpperCase()}</div><p>Content not available</p></div>`;
    }
  }

  private formatDemographicsHTML(data: any, includeDetails: boolean): string {
    if (!data) return '';
    
    return `
<div class="section">
    <div class="section-title">Patient Demographics</div>
    <div class="patient-info">
        <table>
            <tr><td><strong>Name:</strong></td><td>${data.name || 'N/A'}</td></tr>
            <tr><td><strong>Date of Birth:</strong></td><td>${data.dateOfBirth || 'N/A'}</td></tr>
            <tr><td><strong>Gender:</strong></td><td>${data.gender || 'N/A'}</td></tr>
            ${includeDetails ? `
            <tr><td><strong>Race:</strong></td><td>${data.race || 'N/A'}</td></tr>
            <tr><td><strong>Ethnicity:</strong></td><td>${data.ethnicity || 'N/A'}</td></tr>
            <tr><td><strong>Language:</strong></td><td>${data.language || 'N/A'}</td></tr>
            ` : ''}
        </table>
    </div>
</div>
`;
  }

  private formatConditionsHTML(data: any[], includeDetails: boolean): string {
    if (!data || data.length === 0) return '<div class="section"><div class="section-title">Medical Conditions</div><p>No conditions recorded</p></div>';
    
    let html = '<div class="section"><div class="section-title">Medical Conditions</div><table>';
    html += '<tr><th>Condition</th><th>Status</th>';
    if (includeDetails) {
      html += '<th>Code</th><th>Severity</th><th>Date Diagnosed</th>';
    }
    html += '</tr>';
    
    data.forEach(condition => {
      html += `<tr>
        <td>${condition.description || 'N/A'}</td>
        <td>${condition.status || 'N/A'}</td>`;
      if (includeDetails) {
        html += `
        <td>${condition.code || 'N/A'}</td>
        <td>${condition.severity || 'N/A'}</td>
        <td>${condition.diagnosedDate || 'N/A'}</td>`;
      }
      html += '</tr>';
    });
    
    html += '</table></div>';
    return html;
  }

  private formatMedicationsHTML(data: any[], includeDetails: boolean): string {
    if (!data || data.length === 0) return '<div class="section"><div class="section-title">Current Medications</div><p>No medications recorded</p></div>';
    
    let html = '<div class="section"><div class="section-title">Current Medications</div><table>';
    html += '<tr><th>Medication</th><th>Dosage</th><th>Frequency</th>';
    if (includeDetails) {
      html += '<th>Route</th><th>Prescriber</th><th>Start Date</th>';
    }
    html += '</tr>';
    
    data.forEach(med => {
      html += `<tr>
        <td>${med.name || 'N/A'}</td>
        <td>${med.dosage || 'N/A'}</td>
        <td>${med.frequency || 'N/A'}</td>`;
      if (includeDetails) {
        html += `
        <td>${med.route || 'N/A'}</td>
        <td>${med.prescribingProvider || 'N/A'}</td>
        <td>${med.startDate || 'N/A'}</td>`;
      }
      html += '</tr>';
    });
    
    html += '</table></div>';
    return html;
  }

  private formatLabResultsHTML(data: any[], includeDetails: boolean): string {
    if (!data || data.length === 0) return '<div class="section"><div class="section-title">Laboratory Results</div><p>No lab results available</p></div>';
    
    let html = '<div class="section"><div class="section-title">Laboratory Results</div><table>';
    html += '<tr><th>Test</th><th>Result</th><th>Reference Range</th><th>Date</th>';
    if (includeDetails) {
      html += '<th>Status</th><th>Ordering Provider</th>';
    }
    html += '</tr>';
    
    data.forEach(lab => {
      html += `<tr>
        <td>${lab.testName || 'N/A'}</td>
        <td>${lab.value || 'N/A'} ${lab.unit || ''}</td>
        <td>${lab.referenceRange || 'N/A'}</td>
        <td>${lab.timestamp ? new Date(lab.timestamp).toLocaleDateString() : 'N/A'}</td>`;
      if (includeDetails) {
        html += `
        <td>${lab.status || 'N/A'}</td>
        <td>${lab.orderingProvider || 'N/A'}</td>`;
      }
      html += '</tr>';
    });
    
    html += '</table></div>';
    return html;
  }

  private formatTimelineHTML(data: any[], includeDetails: boolean): string {
    if (!data || data.length === 0) return '<div class="section"><div class="section-title">Timeline</div><p>No timeline events available</p></div>';
    
    let html = '<div class="section"><div class="section-title">Patient Timeline</div>';
    
    data.forEach(event => {
      html += `<div style="margin-bottom: 15px; padding: 10px; border-left: 3px solid #007bff; background: #f8f9fa;">
        <h4>${event.title || 'Event'}</h4>
        <p><strong>Date:</strong> ${event.timestamp ? new Date(event.timestamp).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Type:</strong> ${event.type || 'N/A'}</p>
        <p>${event.description || 'No description available'}</p>
        ${includeDetails && event.significance ? `<p><strong>Significance:</strong> ${event.significance}</p>` : ''}
      </div>`;
    });
    
    html += '</div>';
    return html;
  }

  private async extractSectionData(section: ExportSection, patientData: any, options: ExportOptions): Promise<any> {
    if (!patientData) return null;
    
    switch (section.section) {
      case 'demographics':
        return patientData.demographics || {};
      case 'conditions':
        return patientData.conditions || [];
      case 'medications':
        return patientData.medications || [];
      case 'lab_results':
        return patientData.labResults || [];
      case 'timeline':
        return patientData.timeline || [];
      default:
        return null;
    }
  }

  private getCSVHeaders(sections: ExportSection[]): string[] {
    const headers: string[] = ['Patient_ID', 'Export_Date'];
    
    sections.forEach(section => {
      switch (section.section) {
        case 'demographics':
          headers.push('Name', 'DOB', 'Gender', 'Race', 'Ethnicity');
          break;
        case 'conditions':
          headers.push('Conditions', 'Condition_Codes', 'Condition_Status');
          break;
        case 'medications':
          headers.push('Medications', 'Dosages', 'Frequencies');
          break;
      }
    });
    
    return headers;
  }

  private async generateCSVData(options: ExportOptions, patientData: any): Promise<string[]> {
    const rows: string[] = [];
    const baseData = [
      patientData.id || 'N/A',
      new Date().toISOString()
    ];
    
    // For CSV, we'll create one row per patient with aggregated data
    let rowData = [...baseData];
    
    options.includeSections.forEach(section => {
      const sectionData = this.extractSectionData(section, patientData, options);
      
      switch (section.section) {
        case 'demographics':
          rowData.push(
            sectionData?.name || 'N/A',
            sectionData?.dateOfBirth || 'N/A',
            sectionData?.gender || 'N/A',
            sectionData?.race || 'N/A',
            sectionData?.ethnicity || 'N/A'
          );
          break;
        case 'conditions':
          const conditions = (sectionData || []).map((c: any) => c.description).join('; ');
          const codes = (sectionData || []).map((c: any) => c.code).join('; ');
          const statuses = (sectionData || []).map((c: any) => c.status).join('; ');
          rowData.push(conditions || 'None', codes || 'None', statuses || 'None');
          break;
        case 'medications':
          const medications = (sectionData || []).map((m: any) => m.name).join('; ');
          const dosages = (sectionData || []).map((m: any) => m.dosage).join('; ');
          const frequencies = (sectionData || []).map((m: any) => m.frequency).join('; ');
          rowData.push(medications || 'None', dosages || 'None', frequencies || 'None');
          break;
      }
    });
    
    rows.push(rowData.join(','));
    return rows;
  }

  private async generateSectionXML(section: ExportSection, options: ExportOptions, patientData?: any): Promise<string> {
    const sectionData = await this.extractSectionData(section, patientData, options);
    let xml = `  <${section.section}>\n`;
    
    if (Array.isArray(sectionData)) {
      sectionData.forEach((item, index) => {
        xml += `    <item_${index}>\n`;
        Object.entries(item).forEach(([key, value]) => {
          xml += `      <${key}>${this.escapeXML(String(value))}</${key}>\n`;
        });
        xml += `    </item_${index}>\n`;
      });
    } else if (sectionData && typeof sectionData === 'object') {
      Object.entries(sectionData).forEach(([key, value]) => {
        xml += `    <${key}>${this.escapeXML(String(value))}</${key}>\n`;
      });
    }
    
    xml += `  </${section.section}>\n`;
    return xml;
  }

  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  private getReportTitle(options: ExportOptions): string {
    switch (options.purpose) {
      case 'clinical_summary': return 'Clinical Summary Report';
      case 'patient_education': return 'Patient Health Summary';
      case 'research': return 'Research Data Export';
      case 'legal': return 'Legal Medical Record Export';
      case 'insurance': return 'Insurance Documentation';
      default: return 'Medical Report';
    }
  }

  private generateExportId(): string {
    return 'export_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateWatermark(userRole: string, requestedBy: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${userRole.toUpperCase()} COPY - ${timestamp} - ${requestedBy}`;
  }

  private async saveExportFile(exportId: string, content: string | Buffer, format: string): Promise<string> {
    // In a real implementation, this would save to cloud storage (S3, Azure Blob, etc.)
    // and return the actual download URL
    const fileExtension = format.toLowerCase();
    const fileName = `${exportId}.${fileExtension}`;
    
    // Simulate file storage
    logger.info(`Saving export file: ${fileName}, size: ${Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content, 'utf8')} bytes`);
    
    // Return a mock URL (in production, this would be a real presigned URL)
    return `https://mediquery-exports.s3.amazonaws.com/${fileName}?expires=24h`;
  }

  async getExportStatus(exportId: string): Promise<ExportResult | null> {
    return this.activeExports.get(exportId) || null;
  }

  async getReportTemplates(userRole?: 'clinician' | 'patient'): Promise<ReportTemplate[]> {
    const templates = Array.from(this.reportTemplates.values());
    
    if (userRole) {
      return templates.filter(template => 
        template.userRole === userRole || template.userRole === 'both'
      );
    }
    
    return templates;
  }

  async getReportTemplate(templateId: string): Promise<ReportTemplate | null> {
    return this.reportTemplates.get(templateId) || null;
  }

  async deleteExport(exportId: string): Promise<boolean> {
    const exportResult = this.activeExports.get(exportId);
    if (!exportResult) return false;
    
    // In a real implementation, this would also delete the file from storage
    this.activeExports.delete(exportId);
    logger.info(`Export ${exportId} deleted`);
    
    return true;
  }

  async getUserExports(userId: string): Promise<ExportResult[]> {
    return Array.from(this.activeExports.values())
      .filter(exportResult => exportResult.requestedBy === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// Singleton instance
export const exportService = new ExportService();