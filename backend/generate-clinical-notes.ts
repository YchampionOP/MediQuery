import elasticsearchService from './src/services/elasticsearch';

// Generate realistic clinical notes data for existing patients
async function generateClinicalNotes() {
  console.log('🏥 Generating Clinical Notes Data...');
  
  try {
    // First, get the existing patients to create notes for
    const patientResults = await elasticsearchService.search({
      index: 'patients',
      query: { match_all: {} },
      size: 100
    });
    
    const patients = patientResults.hits.hits.map((hit: any) => hit._source);
    console.log(`Found ${patients.length} patients to create notes for`);
    
    const clinicalNotes: any[] = [];
    let noteId = 1;
    
    // Generate realistic clinical notes for each patient
    for (const patient of patients) {
      const patientId = patient.patient_id || patient.subject_id;
      
      // Generate multiple types of notes per patient
      const noteTypes = [
        {
          category: 'Discharge summary',
          description: 'Report',
          text: `Patient ${patientId} admitted with acute condition. Physical examination revealed stable vital signs. Laboratory results within normal limits. Patient responded well to treatment. Discharged home in stable condition with follow-up instructions.`
        },
        {
          category: 'Nursing',
          description: 'Nursing/other',
          text: `Nursing assessment for patient ${patientId}. Patient alert and oriented. Vital signs stable. Pain controlled with medication. Ambulating independently. No acute distress noted. Continue current treatment plan.`
        },
        {
          category: 'Physician',
          description: 'Physician Resident Progress Note',
          text: `Progress note for patient ${patientId}. Chief complaint: Follow-up visit. Patient reports feeling better with current treatment. Physical exam unremarkable. Assessment and plan: Continue current medications, follow up in 2 weeks.`
        },
        {
          category: 'Radiology',
          description: 'Radiology',
          text: `Chest X-ray for patient ${patientId}. Frontal and lateral views obtained. Heart size normal. Lungs clear bilaterally. No acute cardiopulmonary abnormalities. Impression: Normal chest radiograph.`
        },
        {
          category: 'Nursing',
          description: 'Nursing Progress Note',
          text: `Patient ${patientId} vital signs: BP 120/80, HR 75, RR 18, Temp 98.6F. Patient denies pain or discomfort. Medication administered as ordered. Patient education provided regarding discharge instructions.`
        },
        {
          category: 'Case Management',
          description: 'Case Management',
          text: `Case management note for patient ${patientId}. Discussed discharge planning with patient and family. Arranged home health services. Verified insurance coverage for prescribed medications. Patient verbalized understanding of follow-up care.`
        },
        {
          category: 'Consult',
          description: 'Consult',
          text: `Cardiology consultation for patient ${patientId}. Referred for evaluation of chest pain. Echo shows normal left ventricular function. EKG shows normal sinus rhythm. Recommend stress test as outpatient.`
        },
        {
          category: 'General',
          description: 'Progress note',
          text: `Daily progress note for patient ${patientId}. Patient continues to improve. Tolerating oral medications well. Ambulating without assistance. Laboratory values trending in right direction. Plan to discharge tomorrow if continues to improve.`
        }
      ];
      
      // Create 3-5 notes per patient
      const numNotes = Math.floor(Math.random() * 3) + 3; // 3-5 notes
      
      for (let i = 0; i < numNotes; i++) {
        const noteType = noteTypes[i % noteTypes.length];
        const chartDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        
        const note = {
          note_id: noteId.toString(),
          patient_id: patientId,
          hadm_id: `${patientId}_${i + 1}`,
          chartdate: chartDate.toISOString().split('T')[0],
          charttime: chartDate.toISOString(),
          storetime: chartDate.toISOString(),
          category: noteType.category,
          description: noteType.description,
          cgid: Math.floor(Math.random() * 1000) + 1,
          iserror: false,
          text: noteType.text,
          note_type: noteType.category,
          created_at: new Date().toISOString(),
          searchable_text: `${noteType.category} ${noteType.description} ${noteType.text}`.substring(0, 5000)
        };
        
        clinicalNotes.push(note);
        noteId++;
      }
    }
    
    // Add some additional general clinical notes
    const additionalNotes = [
      {
        category: 'Emergency Department',
        description: 'ED Physician Note',
        text: 'Patient presents to ED with chest pain. Vital signs stable. EKG shows normal sinus rhythm. Troponins negative. Patient discharged home with cardiology follow-up.'
      },
      {
        category: 'ICU',
        description: 'ICU Progress Note',
        text: 'Patient in ICU for monitoring. Hemodynamically stable on minimal vasopressor support. Respiratory status improving. Sedation weaned successfully. Family updated on progress.'
      },
      {
        category: 'Surgery',
        description: 'Operative Report',
        text: 'Pre-operative diagnosis: Appendicitis. Post-operative diagnosis: Acute appendicitis. Procedure: Laparoscopic appendectomy. Patient tolerated procedure well. No complications.'
      }
    ];
    
    // Add 50 additional general notes
    for (let i = 0; i < 50; i++) {
      const noteType = additionalNotes[i % additionalNotes.length];
      const patientId = patients[i % patients.length]?.patient_id || patients[i % patients.length]?.subject_id || '10000';
      const chartDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      
      const note = {
        note_id: noteId.toString(),
        patient_id: patientId,
        hadm_id: `${patientId}_gen_${i}`,
        chartdate: chartDate.toISOString().split('T')[0],
        charttime: chartDate.toISOString(),
        storetime: chartDate.toISOString(),
        category: noteType.category,
        description: noteType.description,
        cgid: Math.floor(Math.random() * 1000) + 1,
        iserror: false,
        text: noteType.text,
        note_type: noteType.category,
        created_at: new Date().toISOString(),
        searchable_text: `${noteType.category} ${noteType.description} ${noteType.text}`.substring(0, 5000)
      };
      
      clinicalNotes.push(note);
      noteId++;
    }
    
    console.log(`Generated ${clinicalNotes.length} clinical notes`);
    
    // Bulk upload clinical notes
    await bulkUploadNotes(clinicalNotes);
    
    // Verify upload
    const finalCount = await elasticsearchService.search({
      index: 'clinical-notes',
      size: 0,
      query: { match_all: {} }
    });
    
    const totalNotes = finalCount.hits.total.value || finalCount.hits.total;
    console.log(`✅ Total clinical notes in index: ${totalNotes}`);
    
    // Test search
    console.log('\n🔍 Testing clinical notes search...');
    const searchResult = await elasticsearchService.hybridSearch({
      query: 'chest pain',
      indices: ['clinical-notes'],
      size: 3
    });
    
    console.log(`Found ${searchResult.hits.length} results for \"chest pain\":`);
    searchResult.hits.forEach((hit: any, index: number) => {
      console.log(`  ${index + 1}. [${hit.index}] ${hit.source.category} - Score: ${hit.score.toFixed(2)}`);
      console.log(`     Text: ${hit.source.text.substring(0, 100)}...`);
    });
    
  } catch (error) {
    console.error('❌ Failed to generate clinical notes:', error);
  }
}

async function bulkUploadNotes(notes: any[]): Promise<void> {
  const batchSize = 100;
  
  for (let i = 0; i < notes.length; i += batchSize) {
    const batch = notes.slice(i, i + batchSize);
    const operations: any[] = [];
    
    batch.forEach(note => {
      operations.push({ index: { _index: 'clinical-notes', _id: note.note_id } });
      operations.push(note);
    });
    
    try {
      await elasticsearchService.bulkIndex(operations);
      console.log(`✅ Uploaded batch ${Math.floor(i / batchSize) + 1} (${batch.length} notes)`);
    } catch (error) {
      console.error(`❌ Failed to upload batch:`, error);
      throw error;
    }
  }
}

generateClinicalNotes().catch(console.error);