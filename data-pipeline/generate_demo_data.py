"""
Demo data generator for MediQuery AI
Creates realistic sample data for demonstration purposes
"""

import json
import uuid
from datetime import datetime, timedelta
import random
from typing import List, Dict, Any

class DemoDataGenerator:
    """Generates realistic demo data for healthcare scenarios"""
    
    def __init__(self):
        self.conditions = [
            {"code": "E11.9", "system": "ICD-10", "description": "Type 2 diabetes mellitus without complications"},
            {"code": "I10", "system": "ICD-10", "description": "Essential hypertension"},
            {"code": "E78.5", "system": "ICD-10", "description": "Hyperlipidemia"},
            {"code": "I25.10", "system": "ICD-10", "description": "Atherosclerotic heart disease"},
            {"code": "J44.1", "system": "ICD-10", "description": "Chronic obstructive pulmonary disease with exacerbation"},
            {"code": "N18.6", "system": "ICD-10", "description": "End stage renal disease"},
            {"code": "F33.1", "system": "ICD-10", "description": "Major depressive disorder, recurrent, moderate"},
        ]
        
        self.medications = [
            {"name": "Metformin", "generic": "metformin", "class": "Antidiabetic"},
            {"name": "Lisinopril", "generic": "lisinopril", "class": "ACE Inhibitor"},
            {"name": "Atorvastatin", "generic": "atorvastatin", "class": "Statin"},
            {"name": "Aspirin", "generic": "aspirin", "class": "Antiplatelet"},
            {"name": "Metoprolol", "generic": "metoprolol", "class": "Beta Blocker"},
            {"name": "Furosemide", "generic": "furosemide", "class": "Diuretic"},
            {"name": "Insulin glargine", "generic": "insulin glargine", "class": "Long-acting insulin"},
        ]
        
        self.lab_tests = [
            {"name": "Hemoglobin A1c", "unit": "%", "normal_range": "4.0-5.6"},
            {"name": "Glucose", "unit": "mg/dL", "normal_range": "70-99"},
            {"name": "Total Cholesterol", "unit": "mg/dL", "normal_range": "<200"},
            {"name": "LDL Cholesterol", "unit": "mg/dL", "normal_range": "<100"},
            {"name": "HDL Cholesterol", "unit": "mg/dL", "normal_range": ">40"},
            {"name": "Triglycerides", "unit": "mg/dL", "normal_range": "<150"},
            {"name": "Creatinine", "unit": "mg/dL", "normal_range": "0.7-1.3"},
            {"name": "eGFR", "unit": "mL/min/1.73m²", "normal_range": ">60"},
            {"name": "Hemoglobin", "unit": "g/dL", "normal_range": "12.0-15.5"},
            {"name": "White Blood Cell Count", "unit": "K/uL", "normal_range": "4.5-11.0"},
        ]

    def generate_demo_patients(self, count: int = 10) -> List[Dict[str, Any]]:
        """Generate demo patient records"""
        patients = []
        
        for i in range(count):
            patient_id = f"demo_patient_{i+1:03d}"
            age = random.randint(35, 85)
            gender = random.choice(["Male", "Female"])
            
            # Generate conditions (1-3 per patient)
            patient_conditions = random.sample(self.conditions, random.randint(1, 3))
            
            # Generate medications based on conditions
            patient_medications = self._generate_patient_medications(patient_conditions)
            
            # Generate lab results
            lab_results = self._generate_lab_results(patient_id, patient_conditions)
            
            # Generate clinical notes
            clinical_notes = self._generate_clinical_notes(patient_id, patient_conditions)
            
            patient = {
                "id": patient_id,
                "demographics": {
                    "age": age,
                    "gender": gender,
                    "race": random.choice(["White", "Black or African American", "Asian", "Hispanic or Latino"]),
                    "date_of_birth": (datetime.now() - timedelta(days=age*365)).strftime("%Y-%m-%d"),
                },
                "conditions": patient_conditions,
                "medications": patient_medications,
                "lab_results": lab_results,
                "clinical_notes": clinical_notes,
                "type": "patient",
                "source": "Demo Data",
                "timestamp": datetime.now().isoformat(),
                "title": f"Patient {patient_id} - {age}yr {gender}",
                "summary": self._generate_patient_summary(age, gender, patient_conditions),
            }
            
            patients.append(patient)
        
        return patients

    def _generate_patient_medications(self, conditions: List[Dict]) -> List[Dict[str, Any]]:
        """Generate realistic medications based on patient conditions"""
        medications = []
        
        for condition in conditions:
            if "diabetes" in condition["description"].lower():
                medications.extend([
                    {
                        "id": str(uuid.uuid4()),
                        "name": "Metformin",
                        "dosage": "500mg",
                        "frequency": "twice daily",
                        "status": "active",
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "name": "Insulin glargine",
                        "dosage": "20 units",
                        "frequency": "once daily at bedtime",
                        "status": "active",
                    }
                ])
            
            if "hypertension" in condition["description"].lower():
                medications.append({
                    "id": str(uuid.uuid4()),
                    "name": "Lisinopril",
                    "dosage": "10mg",
                    "frequency": "once daily",
                    "status": "active",
                })
            
            if "hyperlipidemia" in condition["description"].lower():
                medications.append({
                    "id": str(uuid.uuid4()),
                    "name": "Atorvastatin",
                    "dosage": "20mg",
                    "frequency": "once daily at bedtime",
                    "status": "active",
                })
        
        # Add aspirin for cardiovascular protection
        if any("heart" in cond["description"].lower() or "hypertension" in cond["description"].lower() 
               for cond in conditions):
            medications.append({
                "id": str(uuid.uuid4()),
                "name": "Aspirin",
                "dosage": "81mg",
                "frequency": "once daily",
                "status": "active",
            })
        
        return medications

    def _generate_lab_results(self, patient_id: str, conditions: List[Dict]) -> List[Dict[str, Any]]:
        """Generate realistic lab results"""
        results = []
        
        for test in self.lab_tests:
            # Generate values based on conditions
            if "diabetes" in str(conditions).lower() and test["name"] == "Hemoglobin A1c":
                value = round(random.uniform(7.5, 9.2), 1)  # Elevated for diabetes
                status = "abnormal" if value > 7.0 else "normal"
            elif "diabetes" in str(conditions).lower() and test["name"] == "Glucose":
                value = random.randint(140, 220)  # Elevated for diabetes
                status = "abnormal"
            elif test["name"] == "Total Cholesterol" and "hyperlipidemia" in str(conditions).lower():
                value = random.randint(220, 280)  # Elevated
                status = "abnormal"
            elif test["name"] == "Creatinine" and "renal" in str(conditions).lower():
                value = round(random.uniform(1.8, 3.2), 1)  # Elevated
                status = "abnormal"
            else:
                # Generate normal or slightly abnormal values
                value = self._generate_normal_lab_value(test["name"])
                status = random.choice(["normal", "normal", "normal", "abnormal"])  # 75% normal
            
            result = {
                "id": str(uuid.uuid4()),
                "patient_id": patient_id,
                "test_name": test["name"],
                "value": value,
                "unit": test["unit"],
                "reference_range": test["normal_range"],
                "status": status,
                "timestamp": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
                "ordering_provider": "Dr. Johnson",
                "category": "Laboratory",
            }
            
            results.append(result)
        
        return results

    def _generate_normal_lab_value(self, test_name: str) -> float:
        """Generate normal lab values with some variation"""
        normal_values = {
            "Hemoglobin A1c": random.uniform(5.0, 6.5),
            "Glucose": random.randint(80, 110),
            "Total Cholesterol": random.randint(150, 200),
            "LDL Cholesterol": random.randint(60, 120),
            "HDL Cholesterol": random.randint(45, 70),
            "Triglycerides": random.randint(70, 140),
            "Creatinine": random.uniform(0.8, 1.2),
            "eGFR": random.randint(70, 120),
            "Hemoglobin": random.uniform(12.5, 15.0),
            "White Blood Cell Count": random.uniform(5.0, 9.0),
        }
        
        return round(normal_values.get(test_name, 100), 1)

    def _generate_clinical_notes(self, patient_id: str, conditions: List[Dict]) -> List[Dict[str, Any]]:
        """Generate realistic clinical notes"""
        notes = []
        
        # Progress note
        condition_text = ", ".join([cond["description"] for cond in conditions])
        
        progress_note = {
            "id": str(uuid.uuid4()),
            "patient_id": patient_id,
            "type": "progress",
            "title": "Follow-up Visit",
            "content": f"""
Patient returns for routine follow-up of {condition_text}.

ASSESSMENT AND PLAN:
- {conditions[0]["description"]}: Patient reports good adherence to medications. Recent labs show some elevation in relevant markers. Will continue current regimen and recheck in 3 months.
- Blood pressure: Well controlled on current medications
- Will continue current medication regimen
- Patient counseled on diet and exercise
- Follow-up in 3 months or sooner if concerns

Patient tolerated visit well and understands plan of care.
            """.strip(),
            "author": "Dr. Sarah Johnson",
            "timestamp": (datetime.now() - timedelta(days=7)).isoformat(),
            "department": "Internal Medicine",
        }
        
        notes.append(progress_note)
        
        return notes

    def _generate_patient_summary(self, age: int, gender: str, conditions: List[Dict]) -> str:
        """Generate patient summary for search"""
        condition_names = [cond["description"] for cond in conditions]
        summary = f"{age}-year-old {gender.lower()} with {', '.join(condition_names[:2])}"
        if len(condition_names) > 2:
            summary += f" and {len(condition_names) - 2} other condition(s)"
        return summary

    def generate_research_papers(self, count: int = 5) -> List[Dict[str, Any]]:
        """Generate demo research papers"""
        papers = [
            {
                "id": "research_001",
                "title": "Effectiveness of ACE Inhibitors in Elderly Diabetic Patients: A Meta-Analysis",
                "abstract": "This systematic review and meta-analysis examines the cardiovascular benefits of ACE inhibitors in elderly patients with type 2 diabetes mellitus. Analysis of 15 randomized controlled trials involving 8,247 patients showed a 23% reduction in major adverse cardiovascular events (MACE) with ACE inhibitor therapy compared to placebo (RR 0.77, 95% CI 0.68-0.87, p<0.001). The number needed to treat was 18 patients to prevent one MACE over 3 years. Subgroup analysis revealed consistent benefits across age groups >65 years.",
                "authors": ["Johnson M", "Smith R", "Davis L", "Chen K"],
                "journal": "Cardiovascular Research",
                "publication_date": "2023-11-15",
                "pmid": "37852641",
                "study_type": "Meta-analysis",
                "evidence_level": "Level 1A",
                "conclusions": "ACE inhibitors provide significant cardiovascular protection in elderly diabetic patients with an acceptable safety profile.",
                "type": "research",
                "source": "PubMed",
                "timestamp": "2023-11-15T00:00:00Z",
                "summary": "Meta-analysis showing 23% reduction in cardiovascular events with ACE inhibitors in elderly diabetic patients",
            },
            {
                "id": "research_002", 
                "title": "HbA1c Targets in Type 2 Diabetes: Individualized vs. Standardized Approach",
                "abstract": "Objective: To compare cardiovascular outcomes between individualized HbA1c targets versus standard <7% targets in patients with type 2 diabetes and multiple comorbidities. Methods: Retrospective cohort study of 12,450 patients followed for median 5.2 years. Results: Individualized targets (7-8.5% based on age, comorbidities, and life expectancy) showed non-inferiority for cardiovascular events (HR 1.04, 95% CI 0.91-1.18) with 31% fewer severe hypoglycemic episodes.",
                "authors": ["Williams A", "Brown T", "Garcia M"],
                "journal": "Diabetes Care",
                "publication_date": "2024-01-10",
                "pmid": "38195432",
                "study_type": "Cohort Study",
                "evidence_level": "Level 2B",
                "conclusions": "Individualized HbA1c targets appear safe and reduce hypoglycemia risk in complex diabetic patients.",
                "type": "research",
                "source": "PubMed",
                "timestamp": "2024-01-10T00:00:00Z",
                "summary": "Study supporting individualized HbA1c targets in complex diabetic patients to reduce hypoglycemia",
            }
        ]
        
        return papers

    def generate_demo_scenarios(self) -> Dict[str, Any]:
        """Generate complete demo scenarios for testing"""
        
        # Generate demo data
        patients = self.generate_demo_patients(10)
        research_papers = self.generate_research_papers(5)
        
        # Create demo queries for each user role
        clinician_queries = [
            "Show me patients with diabetes and recent chest pain",
            "Find research on ACE inhibitor effectiveness for elderly patients",
            "What are the drug interactions for metformin and contrast agents?",
            "Patients with HbA1c above 8% in the last 3 months",
            "Compare outcomes for individualized vs standard diabetes targets",
        ]
        
        patient_queries = [
            "Explain my recent blood test results",
            "What should I know about my diabetes medication?",
            "Why is my blood sugar still high?",
            "What foods should I avoid with my condition?",
            "When should I call my doctor about my symptoms?",
        ]
        
        # Create expected search results for demo queries
        demo_scenarios = {
            "patients": patients,
            "research_papers": research_papers,
            "clinician_demo_queries": clinician_queries,
            "patient_demo_queries": patient_queries,
            "demo_interactions": [
                {
                    "role": "clinician",
                    "query": "Show me patients with diabetes and elevated HbA1c",
                    "expected_results": [p for p in patients if any("diabetes" in c["description"].lower() for c in p["conditions"])],
                },
                {
                    "role": "patient", 
                    "query": "Explain my HbA1c result of 8.2%",
                    "expected_response": "Your HbA1c of 8.2% indicates that your average blood sugar over the past 2-3 months has been higher than the recommended target of less than 7%. This suggests your diabetes management plan may need adjustment.",
                }
            ]
        }
        
        return demo_scenarios

def main():
    """Generate and save demo data"""
    generator = DemoDataGenerator()
    demo_data = generator.generate_demo_scenarios()
    
    # Save to JSON file
    with open('demo_data.json', 'w') as f:
        json.dump(demo_data, f, indent=2, default=str)
    
    print(f"✅ Generated demo data:")
    print(f"   - {len(demo_data['patients'])} patients")
    print(f"   - {len(demo_data['research_papers'])} research papers")
    print(f"   - {len(demo_data['clinician_demo_queries'])} clinician queries")
    print(f"   - {len(demo_data['patient_demo_queries'])} patient queries")
    print(f"   - {len(demo_data['demo_interactions'])} demo interactions")
    print("📁 Saved to demo_data.json")

if __name__ == "__main__":
    main()