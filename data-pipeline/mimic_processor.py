"""
Enhanced MIMIC-III data processor with advanced features
"""

import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Any, Optional, Generator
from pathlib import Path
import re
import hashlib
from collections import defaultdict

logger = logging.getLogger(__name__)

class MIMICDataProcessor:
    """Enhanced MIMIC-III data processor with medical knowledge integration"""
    
    def __init__(self, data_path: str, anonymize: bool = True):
        self.data_path = Path(data_path)
        self.anonymize = anonymize
        self.processed_count = 0
        self.error_count = 0
        
        # Medical coding mappings
        self.icd9_to_icd10_map = {
            '250.00': 'E11.9',  # Diabetes mellitus
            '401.9': 'I10',     # Essential hypertension
            '272.4': 'E78.5',   # Hyperlipidemia
            '414.01': 'I25.10', # Coronary atherosclerosis
            '496': 'J44.1',     # COPD
            '585.6': 'N18.6',   # End stage renal disease
        }
        
        self.lab_ranges = {
            'GLUCOSE': {'normal': (70, 99), 'unit': 'mg/dL', 'critical_high': 400},
            'CREATININE': {'normal': (0.7, 1.3), 'unit': 'mg/dL', 'critical_high': 5.0},
            'HEMOGLOBIN': {'normal': (12.0, 15.5), 'unit': 'g/dL', 'critical_low': 7.0},
        }
        
        self.stats = defaultdict(int)
    
    def process_patients_enhanced(self) -> Generator[Dict[str, Any], None, None]:
        """Enhanced patient processing with validation"""
        patients_file = self.data_path / 'PATIENTS.csv'
        admissions_file = self.data_path / 'ADMISSIONS.csv'
        diagnoses_file = self.data_path / 'DIAGNOSES_ICD.csv'
        
        if not patients_file.exists():
            logger.warning(f"PATIENTS.csv not found")
            return
        
        try:
            patients_df = pd.read_csv(patients_file)
            admissions_df = pd.read_csv(admissions_file) if admissions_file.exists() else pd.DataFrame()
            diagnoses_df = pd.read_csv(diagnoses_file) if diagnoses_file.exists() else pd.DataFrame()
            
            for idx, patient in patients_df.iterrows():
                try:
                    processed_patient = self._process_single_patient(patient, admissions_df, diagnoses_df)
                    if processed_patient:
                        yield processed_patient
                        self.stats['patients_processed'] += 1
                
                except Exception as e:
                    self.stats['processing_errors'] += 1
                    logger.error(f"Error processing patient: {e}")
                    continue
        
        except Exception as e:
            logger.error(f"Error in patient processing: {e}")
            raise
    
    def _process_single_patient(self, patient: pd.Series, admissions_df: pd.DataFrame, diagnoses_df: pd.DataFrame) -> Optional[Dict[str, Any]]:
        """Process individual patient with validation"""
        subject_id = patient['SUBJECT_ID']
        
        # Calculate age
        age = self._calculate_age(patient)
        if age is None or not (0 <= age <= 120):
            self.stats['invalid_age'] += 1
            return None
        
        # Get diagnoses with ICD conversion
        diagnoses = self._get_patient_diagnoses(subject_id, diagnoses_df)
        
        # Process admissions
        patient_admissions = admissions_df[admissions_df['SUBJECT_ID'] == subject_id] if not admissions_df.empty else pd.DataFrame()
        admissions_summary = self._process_admissions(patient_admissions)
        
        patient_id = self._generate_patient_id(subject_id) if self.anonymize else f"patient_{subject_id}"
        
        return {
            'id': patient_id,
            'demographics': {
                'age': age,
                'gender': patient.get('GENDER', 'Unknown'),
                'date_of_birth': patient.get('DOB') if not self.anonymize else None,
                'is_deceased': pd.notna(patient.get('DOD')),
            },
            'conditions': diagnoses,
            'admissions_summary': admissions_summary,
            'risk_factors': self._identify_risk_factors(diagnoses),
            'complexity_score': self._calculate_complexity(diagnoses, patient_admissions),
            'type': 'patient',
            'source': 'MIMIC-III',
            'timestamp': datetime.now().isoformat(),
            'title': f"Patient {patient_id} - {age}yr {patient.get('GENDER', 'Unknown')}",
            'summary': self._generate_summary(age, patient.get('GENDER'), diagnoses),
        }
    
    def _calculate_age(self, patient: pd.Series) -> Optional[int]:
        """Calculate patient age"""
        try:
            if pd.isna(patient.get('DOB')):
                return None
            
            dob = pd.to_datetime(patient['DOB'])
            reference_date = pd.to_datetime(patient['DOD']) if pd.notna(patient.get('DOD')) else datetime.now()
            return (reference_date - dob).days // 365
        except:
            return None
    
    def _get_patient_diagnoses(self, subject_id: int, diagnoses_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get and convert patient diagnoses"""
        if diagnoses_df.empty:
            return []
        
        patient_diagnoses = diagnoses_df[diagnoses_df['SUBJECT_ID'] == subject_id]
        conditions = []
        
        for _, diagnosis in patient_diagnoses.iterrows():
            icd9_code = diagnosis.get('ICD9_CODE', '').strip()
            if not icd9_code:
                continue
            
            icd10_code = self.icd9_to_icd10_map.get(icd9_code, icd9_code)
            description = self._get_condition_description(icd9_code)
            
            conditions.append({
                'id': f"condition_{len(conditions) + 1}",
                'icd9_code': icd9_code,
                'icd10_code': icd10_code,
                'description': description,
                'status': 'active',
                'severity': self._determine_severity(description),
                'category': self._categorize_condition(description)
            })
        
        return conditions
    
    def _get_condition_description(self, icd9_code: str) -> str:
        """Get condition description"""
        descriptions = {
            '250.00': 'Type 2 diabetes mellitus without complications',
            '401.9': 'Essential hypertension',
            '272.4': 'Hyperlipidemia, unspecified',
            '414.01': 'Coronary atherosclerosis',
            '496': 'Chronic obstructive pulmonary disease',
            '585.6': 'End stage renal disease',
        }
        return descriptions.get(icd9_code, f"Medical condition (ICD: {icd9_code})")
    
    def _determine_severity(self, description: str) -> str:
        """Determine condition severity"""
        desc_lower = description.lower()
        if any(term in desc_lower for term in ['end stage', 'severe', 'acute']):
            return 'severe'
        elif any(term in desc_lower for term in ['chronic', 'moderate']):
            return 'moderate'
        return 'mild'
    
    def _categorize_condition(self, description: str) -> str:
        """Categorize medical condition"""
        categories = {
            'cardiovascular': ['heart', 'cardiac', 'hypertension'],
            'endocrine': ['diabetes', 'thyroid'],
            'respiratory': ['lung', 'pulmonary', 'copd'],
            'renal': ['kidney', 'renal'],
        }
        
        desc_lower = description.lower()
        for category, keywords in categories.items():
            if any(keyword in desc_lower for keyword in keywords):
                return category
        return 'general'
    
    def _process_admissions(self, admissions_df: pd.DataFrame) -> Dict[str, Any]:
        """Process admission summary"""
        if admissions_df.empty:
            return {'total_admissions': 0, 'avg_length_of_stay': 0}
        
        admissions_df = admissions_df.copy()
        admissions_df['ADMITTIME'] = pd.to_datetime(admissions_df['ADMITTIME'])
        admissions_df['DISCHTIME'] = pd.to_datetime(admissions_df['DISCHTIME'])
        admissions_df['LOS'] = (admissions_df['DISCHTIME'] - admissions_df['ADMITTIME']).dt.days
        
        return {
            'total_admissions': len(admissions_df),
            'avg_length_of_stay': float(admissions_df['LOS'].mean()),
            'admission_types': admissions_df['ADMISSION_TYPE'].value_counts().to_dict(),
        }
    
    def _identify_risk_factors(self, conditions: List[Dict[str, Any]]) -> List[str]:
        """Identify clinical risk factors"""
        risk_factors = []
        descriptions = [c['description'].lower() for c in conditions]
        
        if any('diabetes' in desc for desc in descriptions):
            risk_factors.append('diabetes_mellitus')
        if any('hypertension' in desc for desc in descriptions):
            risk_factors.append('hypertension')
        if any('renal' in desc for desc in descriptions):
            risk_factors.append('chronic_kidney_disease')
        
        return risk_factors
    
    def _calculate_complexity(self, conditions: List[Dict[str, Any]], admissions_df: pd.DataFrame) -> float:
        """Calculate patient complexity score"""
        score = 0.0
        score += len(conditions) * 0.5
        score += sum(2.0 for c in conditions if c.get('severity') == 'severe')
        score += len(admissions_df) * 0.3 if not admissions_df.empty else 0
        return min(score, 20.0)
    
    def _generate_summary(self, age: Optional[int], gender: str, conditions: List[Dict[str, Any]]) -> str:
        """Generate patient summary"""
        age_str = f"{age}-year-old" if age else "adult"
        gender_str = gender.lower() if gender else "unknown gender"
        
        if not conditions:
            return f"{age_str} {gender_str} patient"
        
        primary_conditions = [c['description'] for c in conditions[:2]]
        condition_text = ', '.join(primary_conditions)
        
        summary = f"{age_str} {gender_str} patient with {condition_text}"
        if len(conditions) > 2:
            summary += f" and {len(conditions) - 2} additional condition(s)"
        
        return summary
    
    def _generate_patient_id(self, subject_id: int) -> str:
        """Generate anonymized patient ID"""
        hash_input = f"patient_{subject_id}_mimic".encode()
        hash_hex = hashlib.md5(hash_input).hexdigest()[:8]
        return f"pat_{hash_hex}"
    
    def process_lab_events_enhanced(self) -> Generator[Dict[str, Any], None, None]:
        """Process lab events with interpretation"""
        lab_file = self.data_path / 'LABEVENTS.csv'
        items_file = self.data_path / 'D_LABITEMS.csv'
        
        if not lab_file.exists():
            logger.warning("LABEVENTS.csv not found")
            return
        
        # Load lab items
        lab_items = {}
        if items_file.exists():
            items_df = pd.read_csv(items_file)
            lab_items = dict(zip(items_df['ITEMID'], items_df['LABEL']))
        
        try:
            chunk_size = 5000
            for chunk in pd.read_csv(lab_file, chunksize=chunk_size):
                for _, lab in chunk.iterrows():
                    if pd.isna(lab.get('VALUE')):
                        continue
                    
                    lab_name = lab_items.get(lab['ITEMID'], f"Lab Item {lab['ITEMID']}")
                    patient_id = self._generate_patient_id(lab['SUBJECT_ID']) if self.anonymize else f"patient_{lab['SUBJECT_ID']}"
                    
                    # Interpret lab result
                    interpretation = self._interpret_lab_result(lab_name, lab['VALUE'])
                    
                    processed_lab = {
                        'id': f"lab_{lab['ROW_ID']}",
                        'patient_id': patient_id,
                        'test_name': lab_name,
                        'value': lab['VALUE'],
                        'value_num': lab.get('VALUENUM'),
                        'unit': lab.get('VALUEUOM', ''),
                        'flag': lab.get('FLAG', ''),
                        'timestamp': pd.to_datetime(lab['CHARTTIME']).isoformat() if pd.notna(lab.get('CHARTTIME')) else None,
                        'type': 'lab-result',
                        'source': 'MIMIC-III',
                        'title': f"{lab_name} - {lab['VALUE']}",
                        'summary': f"Lab result: {lab_name} = {lab['VALUE']} {lab.get('VALUEUOM', '')}",
                        'interpretation': interpretation,
                    }
                    
                    yield processed_lab
                    self.stats['labs_processed'] += 1
        
        except Exception as e:
            logger.error(f"Error processing lab events: {e}")
    
    def _interpret_lab_result(self, test_name: str, value: Any) -> Dict[str, Any]:
        """Interpret lab result with clinical context"""
        test_key = test_name.upper()
        
        if test_key not in self.lab_ranges:
            return {'status': 'unknown', 'interpretation': 'Reference range not available'}
        
        try:
            numeric_value = float(value)
        except (ValueError, TypeError):
            return {'status': 'invalid', 'interpretation': 'Non-numeric value'}
        
        range_info = self.lab_ranges[test_key]
        normal_min, normal_max = range_info['normal']
        
        if normal_min <= numeric_value <= normal_max:
            status = 'normal'
            interpretation = f"{test_name} is within normal range"
        elif numeric_value < normal_min:
            status = 'low'
            interpretation = f"{test_name} is below normal range"
        else:
            status = 'high'
            interpretation = f"{test_name} is above normal range"
        
        # Check for critical values
        if 'critical_high' in range_info and numeric_value > range_info['critical_high']:
            status = 'critical_high'
            interpretation = f"CRITICAL: {test_name} is critically elevated"
        elif 'critical_low' in range_info and numeric_value < range_info['critical_low']:
            status = 'critical_low'
            interpretation = f"CRITICAL: {test_name} is critically low"
        
        return {
            'status': status,
            'interpretation': interpretation,
            'reference_range': f"{normal_min}-{normal_max} {range_info['unit']}"
        }
    
    def get_processing_stats(self) -> Dict[str, int]:
        """Get processing statistics"""
        return dict(self.stats)