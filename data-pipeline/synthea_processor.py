"""
Synthea synthetic patient data processor
Processes Synthea-generated patient data for realistic healthcare scenarios
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Any, Optional, Generator
from pathlib import Path
import hashlib
import json
from collections import defaultdict

logger = logging.getLogger(__name__)

class SyntheaDataProcessor:
    """Processes Synthea synthetic patient data with comprehensive medical information"""
    
    def __init__(self, data_path: str, anonymize: bool = False):
        self.data_path = Path(data_path)
        self.anonymize = anonymize  # Synthea data is already synthetic
        self.processed_count = 0
        self.error_count = 0
        
        # Data file mappings
        self.data_files = {
            'patients': 'patients.csv',
            'encounters': 'encounters.csv',
            'conditions': 'conditions.csv',
            'medications': 'medications.csv',
            'observations': 'observations.csv',
            'procedures': 'procedures.csv',
            'immunizations': 'immunizations.csv',
            'allergies': 'allergies.csv',
            'careplans': 'careplans.csv'
        }
        
        # SNOMED CT to ICD-10 common mappings
        self.snomed_to_icd10 = {
            '44054006': 'E11.9',    # Type 2 diabetes
            '38341003': 'I10',      # Hypertension
            '55822004': 'E78.5',    # Hyperlipidemia
            '233604007': 'J18.9',   # Pneumonia
            '195967001': 'J44.1',   # COPD
            '49436004': 'F41.9',    # Anxiety disorder
            '35489007': 'F33.9',    # Depression
        }
        
        # Medication class mappings
        self.med_classes = {
            'metformin': 'Antidiabetic',
            'insulin': 'Antidiabetic',
            'lisinopril': 'ACE Inhibitor',
            'amlodipine': 'Calcium Channel Blocker',
            'atorvastatin': 'Statin',
            'aspirin': 'Antiplatelet',
            'ibuprofen': 'NSAID',
        }
        
        self.stats = defaultdict(int)
    
    def process_all_synthea_data(self) -> Dict[str, Generator]:
        """Process all Synthea data types"""
        return {
            'patients': self.process_synthea_patients(),
            'encounters': self.process_synthea_encounters(),
            'medications': self.process_synthea_medications(),
            'observations': self.process_synthea_observations(),
            'conditions': self.process_synthea_conditions(),
        }
    
    def process_synthea_patients(self) -> Generator[Dict[str, Any], None, None]:
        """Process Synthea patient data with comprehensive demographics"""
        patients_file = self.data_path / self.data_files['patients']
        
        if not patients_file.exists():
            logger.warning(f"patients.csv not found in {self.data_path}")
            return
        
        try:
            patients_df = pd.read_csv(patients_file)
            
            # Load related data for enrichment
            conditions_df = self._load_csv_safe('conditions')
            medications_df = self._load_csv_safe('medications')
            encounters_df = self._load_csv_safe('encounters')
            observations_df = self._load_csv_safe('observations')
            
            logger.info(f"Processing {len(patients_df)} Synthea patients")
            
            for idx, patient in patients_df.iterrows():
                try:
                    processed_patient = self._process_synthea_patient(
                        patient, conditions_df, medications_df, encounters_df, observations_df
                    )
                    
                    if processed_patient:
                        yield processed_patient
                        self.stats['patients_processed'] += 1
                        
                        if self.stats['patients_processed'] % 50 == 0:
                            logger.info(f"Processed {self.stats['patients_processed']} Synthea patients")
                
                except Exception as e:
                    self.error_count += 1
                    self.stats['patient_processing_errors'] += 1
                    logger.error(f"Error processing Synthea patient {patient.get('Id', 'unknown')}: {e}")
                    continue
        
        except Exception as e:
            logger.error(f"Error in Synthea patient processing: {e}")
            raise
    
    def _load_csv_safe(self, file_key: str) -> pd.DataFrame:
        """Safely load CSV file, return empty DataFrame if not found"""
        file_path = self.data_path / self.data_files[file_key]
        if file_path.exists():
            return pd.read_csv(file_path)
        return pd.DataFrame()
    
    def _process_synthea_patient(
        self, 
        patient: pd.Series,
        conditions_df: pd.DataFrame,
        medications_df: pd.DataFrame,
        encounters_df: pd.DataFrame,
        observations_df: pd.DataFrame
    ) -> Optional[Dict[str, Any]]:
        """Process individual Synthea patient with all related data"""
        
        patient_id = patient['Id']
        
        # Calculate age
        birth_date = pd.to_datetime(patient['BIRTHDATE'])
        death_date = pd.to_datetime(patient['DEATHDATE']) if pd.notna(patient.get('DEATHDATE')) else None
        reference_date = death_date or datetime.now()
        age = (reference_date - birth_date).days // 365
        
        # Get patient-specific data
        patient_conditions = self._get_patient_conditions(patient_id, conditions_df)
        patient_medications = self._get_patient_medications(patient_id, medications_df)
        patient_encounters = self._get_patient_encounters(patient_id, encounters_df)
        patient_observations = self._get_patient_observations(patient_id, observations_df)
        
        # Build comprehensive patient record
        processed_patient = {
            'id': f"synthea_patient_{patient_id}",
            'synthea_id': patient_id,
            'demographics': self._process_synthea_demographics(patient, age),
            'conditions': patient_conditions,
            'medications': patient_medications,
            'encounters_summary': self._summarize_encounters(patient_encounters),
            'vital_signs': self._extract_vital_signs(patient_observations),
            'lab_results': self._extract_lab_results(patient_observations),
            'healthcare_utilization': self._calculate_utilization(patient_encounters),
            'social_determinants': self._extract_social_determinants(patient),
            'risk_profile': self._assess_risk_profile(patient_conditions, age, patient.get('GENDER')),
            'care_gaps': self._identify_care_gaps(patient_conditions, patient_medications),
            'type': 'patient',
            'source': 'Synthea',
            'timestamp': datetime.now().isoformat(),
            'title': f"Patient {patient.get('FIRST', '')} {patient.get('LAST', '')} - {age}yr {patient.get('GENDER', 'Unknown')}",
            'summary': self._generate_synthea_summary(patient, age, patient_conditions),
            'data_completeness': self._assess_data_completeness(patient, patient_conditions, patient_medications),
        }
        
        return processed_patient
    
    def _process_synthea_demographics(self, patient: pd.Series, age: int) -> Dict[str, Any]:
        """Process comprehensive Synthea demographics"""
        return {
            'age': age,
            'birth_date': patient.get('BIRTHDATE'),
            'death_date': patient.get('DEATHDATE') if pd.notna(patient.get('DEATHDATE')) else None,
            'is_deceased': pd.notna(patient.get('DEATHDATE')),
            'ssn': patient.get('SSN') if not self.anonymize else None,
            'drivers_license': patient.get('DRIVERS') if not self.anonymize else None,
            'passport': patient.get('PASSPORT') if not self.anonymize else None,
            'name': {
                'prefix': patient.get('PREFIX'),
                'first': patient.get('FIRST'),
                'last': patient.get('LAST'),
                'suffix': patient.get('SUFFIX'),
                'maiden': patient.get('MAIDEN'),
            },
            'personal': {
                'marital_status': patient.get('MARITAL'),
                'gender': patient.get('GENDER'),
                'race': patient.get('RACE'),
                'ethnicity': patient.get('ETHNICITY'),
                'language': 'English',  # Default for Synthea
            },
            'location': {
                'birthplace': patient.get('BIRTHPLACE'),
                'address': patient.get('ADDRESS'),
                'city': patient.get('CITY'),
                'state': patient.get('STATE'),
                'county': patient.get('COUNTY'),
                'zip': patient.get('ZIP'),
                'latitude': patient.get('LAT'),
                'longitude': patient.get('LON'),
            },
            'financial': {
                'healthcare_expenses': patient.get('HEALTHCARE_EXPENSES'),
                'healthcare_coverage': patient.get('HEALTHCARE_COVERAGE'),
                'income': patient.get('INCOME') if 'INCOME' in patient else None,
            }
        }
    
    def _get_patient_conditions(self, patient_id: str, conditions_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get patient conditions with SNOMED to ICD-10 mapping"""
        if conditions_df.empty:
            return []
        
        patient_conditions = conditions_df[conditions_df['PATIENT'] == patient_id]
        conditions = []
        
        for _, condition in patient_conditions.iterrows():
            snomed_code = condition.get('CODE', '')
            icd10_code = self.snomed_to_icd10.get(snomed_code, snomed_code)
            
            processed_condition = {
                'id': f"condition_{len(conditions) + 1}",
                'snomed_code': snomed_code,
                'icd10_code': icd10_code,
                'code_system': 'SNOMED-CT',
                'description': condition.get('DESCRIPTION', ''),
                'start_date': condition.get('START'),
                'stop_date': condition.get('STOP') if pd.notna(condition.get('STOP')) else None,
                'status': 'resolved' if pd.notna(condition.get('STOP')) else 'active',
                'encounter_id': condition.get('ENCOUNTER'),
                'severity': self._determine_condition_severity(condition.get('DESCRIPTION', '')),
                'category': self._categorize_synthea_condition(condition.get('DESCRIPTION', '')),
            }
            
            conditions.append(processed_condition)
        
        return conditions
    
    def _get_patient_medications(self, patient_id: str, medications_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get patient medications with enhanced information"""
        if medications_df.empty:
            return []
        
        patient_meds = medications_df[medications_df['PATIENT'] == patient_id]
        medications = []
        
        for _, med in patient_meds.iterrows():
            med_description = med.get('DESCRIPTION', '')
            med_name = self._extract_medication_name(med_description)
            
            processed_medication = {
                'id': f"medication_{len(medications) + 1}",
                'code': med.get('CODE'),
                'name': med_name,
                'description': med_description,
                'start_date': med.get('START'),
                'stop_date': med.get('STOP') if pd.notna(med.get('STOP')) else None,
                'status': 'discontinued' if pd.notna(med.get('STOP')) else 'active',
                'encounter_id': med.get('ENCOUNTER'),
                'dispenses': med.get('DISPENSES', 0),
                'total_cost': med.get('TOTALCOST', 0),
                'payer_coverage': med.get('PAYER_COVERAGE', 0),
                'medication_class': self._get_medication_class(med_name),
                'route': self._determine_route(med_description),
                'frequency': self._extract_frequency(med_description),
            }
            
            medications.append(processed_medication)
        
        return medications
    
    def _get_patient_encounters(self, patient_id: str, encounters_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get patient encounters (visits)"""
        if encounters_df.empty:
            return []
        
        patient_encounters = encounters_df[encounters_df['PATIENT'] == patient_id]
        return patient_encounters.to_dict('records')
    
    def _get_patient_observations(self, patient_id: str, observations_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get patient observations (vital signs, lab results)"""
        if observations_df.empty:
            return []
        
        patient_obs = observations_df[observations_df['PATIENT'] == patient_id]
        return patient_obs.to_dict('records')
    
    def _extract_medication_name(self, description: str) -> str:
        """Extract medication name from description"""
        # Simple extraction - in production would use proper parsing
        if not description:
            return 'Unknown medication'
        
        # Common patterns in Synthea medication descriptions
        name_patterns = ['mg', 'ml', 'tablet', 'capsule']
        words = description.split()
        
        # Take first word that's likely the medication name
        for word in words:
            if not any(pattern in word.lower() for pattern in name_patterns):
                return word
        
        return words[0] if words else 'Unknown medication'
    
    def _get_medication_class(self, med_name: str) -> str:
        """Get medication therapeutic class"""
        med_lower = med_name.lower()
        
        for med, med_class in self.med_classes.items():
            if med in med_lower:
                return med_class
        
        return 'Unknown'
    
    def _determine_route(self, description: str) -> str:
        """Determine medication route from description"""
        description_lower = description.lower()
        
        if 'injection' in description_lower or 'subcutaneous' in description_lower:
            return 'injection'
        elif 'tablet' in description_lower or 'capsule' in description_lower:
            return 'oral'
        elif 'topical' in description_lower or 'cream' in description_lower:
            return 'topical'
        else:
            return 'oral'  # Default
    
    def _extract_frequency(self, description: str) -> str:
        """Extract dosing frequency from description"""
        # Simple pattern matching - could be enhanced
        if 'daily' in description.lower():
            return 'once daily'
        elif 'twice' in description.lower():
            return 'twice daily'
        else:
            return 'as directed'
    
    def _summarize_encounters(self, encounters: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Summarize patient encounter history"""
        if not encounters:
            return {'total_encounters': 0, 'encounter_types': {}}
        
        encounter_types = defaultdict(int)
        total_cost = 0
        
        for encounter in encounters:
            enc_class = encounter.get('ENCOUNTERCLASS', 'unknown')
            encounter_types[enc_class] += 1
            total_cost += encounter.get('TOTAL_CLAIM_COST', 0)
        
        return {
            'total_encounters': len(encounters),
            'encounter_types': dict(encounter_types),
            'total_healthcare_cost': total_cost,
            'avg_cost_per_encounter': total_cost / len(encounters) if encounters else 0,
        }
    
    def _extract_vital_signs(self, observations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract vital signs from observations"""
        vital_codes = {
            '8462-4': 'diastolic_bp',
            '8480-6': 'systolic_bp',
            '8867-4': 'heart_rate',
            '8310-5': 'body_temperature',
            '8302-2': 'height',
            '29463-7': 'weight',
            '39156-5': 'bmi',
        }
        
        vitals = []
        for obs in observations:
            code = obs.get('CODE')
            if code in vital_codes:
                vitals.append({
                    'type': vital_codes[code],
                    'value': obs.get('VALUE'),
                    'unit': obs.get('UNITS'),
                    'date': obs.get('DATE'),
                })
        
        return vitals
    
    def _extract_lab_results(self, observations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract laboratory results from observations"""
        lab_codes = {
            '33747-0': 'hemoglobin_a1c',
            '2339-0': 'glucose',
            '2093-3': 'cholesterol_total',
            '18262-6': 'cholesterol_ldl',
            '2085-9': 'cholesterol_hdl',
        }
        
        labs = []
        for obs in observations:
            code = obs.get('CODE')
            if code in lab_codes:
                labs.append({
                    'test_name': lab_codes[code],
                    'value': obs.get('VALUE'),
                    'unit': obs.get('UNITS'),
                    'date': obs.get('DATE'),
                })
        
        return labs
    
    def _calculate_utilization(self, encounters: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate healthcare utilization metrics"""
        if not encounters:
            return {'utilization_score': 0, 'risk_level': 'low'}
        
        # Count encounters by type
        inpatient = sum(1 for e in encounters if e.get('ENCOUNTERCLASS') == 'inpatient')
        emergency = sum(1 for e in encounters if e.get('ENCOUNTERCLASS') == 'emergency')
        outpatient = sum(1 for e in encounters if e.get('ENCOUNTERCLASS') == 'ambulatory')
        
        # Simple utilization scoring
        utilization_score = inpatient * 3 + emergency * 2 + outpatient * 1
        
        if utilization_score > 10:
            risk_level = 'high'
        elif utilization_score > 5:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'utilization_score': utilization_score,
            'risk_level': risk_level,
            'inpatient_visits': inpatient,
            'emergency_visits': emergency,
            'outpatient_visits': outpatient,
        }
    
    def _extract_social_determinants(self, patient: pd.Series) -> Dict[str, Any]:
        """Extract social determinants of health"""
        return {
            'income_level': self._categorize_income(patient.get('INCOME', 0)),
            'education_level': 'Unknown',  # Not in standard Synthea output
            'employment_status': 'Unknown',  # Not in standard Synthea output
            'housing_status': 'Stable',  # Assumed for Synthea patients
            'insurance_status': 'Insured' if patient.get('HEALTHCARE_COVERAGE', 0) > 0 else 'Uninsured',
            'geographic_access': self._assess_geographic_access(patient.get('ZIP')),
        }
    
    def _categorize_income(self, income: float) -> str:
        """Categorize income level"""
        if income > 75000:
            return 'high'
        elif income > 40000:
            return 'medium'
        else:
            return 'low'
    
    def _assess_geographic_access(self, zip_code: str) -> str:
        """Assess geographic access to healthcare"""
        # Simplified assessment - could be enhanced with real geographic data
        return 'adequate'  # Default for Synthea data
    
    def _assess_risk_profile(self, conditions: List[Dict[str, Any]], age: int, gender: str) -> Dict[str, Any]:
        """Assess overall patient risk profile"""
        risk_score = 0
        risk_factors = []
        
        # Age-based risk
        if age > 65:
            risk_score += 2
            risk_factors.append('advanced_age')
        elif age > 45:
            risk_score += 1
            risk_factors.append('middle_age')
        
        # Condition-based risk
        high_risk_conditions = ['diabetes', 'hypertension', 'heart', 'stroke', 'cancer']
        
        for condition in conditions:
            desc_lower = condition['description'].lower()
            if any(risk_cond in desc_lower for risk_cond in high_risk_conditions):
                risk_score += 1
                risk_factors.append(condition['description'])
        
        # Determine overall risk level
        if risk_score >= 4:
            risk_level = 'high'
        elif risk_score >= 2:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'overall_risk_score': risk_score,
            'risk_level': risk_level,
            'risk_factors': risk_factors,
        }
    
    def _identify_care_gaps(self, conditions: List[Dict[str, Any]], medications: List[Dict[str, Any]]) -> List[str]:
        """Identify potential care gaps"""
        care_gaps = []
        
        # Check for diabetes without diabetes medication
        has_diabetes = any('diabetes' in c['description'].lower() for c in conditions)
        has_diabetes_med = any('antidiabetic' in m.get('medication_class', '').lower() for m in medications)
        
        if has_diabetes and not has_diabetes_med:
            care_gaps.append('diabetes_without_medication')
        
        # Check for hypertension without antihypertensive
        has_hypertension = any('hypertension' in c['description'].lower() for c in conditions)
        has_bp_med = any(mc in ['ACE Inhibitor', 'Calcium Channel Blocker', 'Beta Blocker'] 
                        for m in medications for mc in [m.get('medication_class', '')])
        
        if has_hypertension and not has_bp_med:
            care_gaps.append('hypertension_without_medication')
        
        return care_gaps
    
    def _determine_condition_severity(self, description: str) -> str:
        """Determine condition severity from description"""
        desc_lower = description.lower()
        
        if any(term in desc_lower for term in ['severe', 'acute', 'crisis', 'emergency']):
            return 'severe'
        elif any(term in desc_lower for term in ['moderate', 'chronic']):
            return 'moderate'
        else:
            return 'mild'
    
    def _categorize_synthea_condition(self, description: str) -> str:
        """Categorize Synthea condition by medical specialty"""
        categories = {
            'cardiovascular': ['hypertension', 'heart', 'cardiac', 'stroke', 'coronary'],
            'endocrine': ['diabetes', 'thyroid', 'obesity', 'metabolic'],
            'respiratory': ['asthma', 'copd', 'pneumonia', 'bronchitis'],
            'mental_health': ['depression', 'anxiety', 'bipolar', 'schizophrenia'],
            'musculoskeletal': ['arthritis', 'osteoporosis', 'fracture'],
            'infectious': ['infection', 'sepsis', 'pneumonia', 'influenza'],
        }
        
        desc_lower = description.lower()
        
        for category, keywords in categories.items():
            if any(keyword in desc_lower for keyword in keywords):
                return category
        
        return 'general'
    
    def _generate_synthea_summary(self, patient: pd.Series, age: int, conditions: List[Dict[str, Any]]) -> str:
        """Generate comprehensive patient summary"""
        name = f"{patient.get('FIRST', '')} {patient.get('LAST', '')}"
        gender = patient.get('GENDER', 'unknown gender').lower()
        
        if not conditions:
            return f"{name} - {age}-year-old {gender} patient with no recorded conditions"
        
        active_conditions = [c for c in conditions if c['status'] == 'active']
        
        if active_conditions:
            condition_names = [c['description'] for c in active_conditions[:3]]
            condition_text = ', '.join(condition_names)
            
            summary = f"{name} - {age}-year-old {gender} with {condition_text}"
            
            if len(active_conditions) > 3:
                summary += f" and {len(active_conditions) - 3} additional active condition(s)"
        else:
            resolved_conditions = [c['description'] for c in conditions[:2]]
            summary = f"{name} - {age}-year-old {gender} with history of {', '.join(resolved_conditions)}"
        
        return summary
    
    def _assess_data_completeness(self, patient: pd.Series, conditions: List[Dict[str, Any]], medications: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Assess data completeness for Synthea patient"""
        completeness_score = 100.0
        
        # Synthea data is generally complete, but check key fields
        required_fields = ['BIRTHDATE', 'GENDER', 'RACE', 'ETHNICITY', 'FIRST', 'LAST']
        missing_fields = [field for field in required_fields if pd.isna(patient.get(field))]
        
        completeness_score -= len(missing_fields) * 10
        
        return {
            'completeness_score': max(completeness_score, 0.0),
            'missing_fields': missing_fields,
            'has_conditions': len(conditions) > 0,
            'has_medications': len(medications) > 0,
        }
    
    def get_processing_stats(self) -> Dict[str, int]:
        """Get processing statistics"""
        return dict(self.stats)