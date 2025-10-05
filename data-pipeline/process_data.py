#!/usr/bin/env python3
"""
MediQuery AI Data Pipeline
ETL pipeline for processing healthcare datasets and indexing to Elasticsearch
"""

import os
import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Any, Optional, Generator
from pathlib import Path
import argparse

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
import csv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ElasticsearchConnector:
    """Handles Elasticsearch connection and operations"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.client = self._create_client()
        
    def _create_client(self) -> Elasticsearch:
        """Create Elasticsearch client with authentication"""
        es_config = {
            'hosts': [self.config['elasticsearch']['node']],
            'timeout': 30,
            'max_retries': 3,
            'retry_on_timeout': True
        }
        
        # Add authentication
        if self.config['elasticsearch'].get('api_key'):
            es_config['api_key'] = self.config['elasticsearch']['api_key']
        elif (self.config['elasticsearch'].get('username') and 
              self.config['elasticsearch'].get('password')):
            es_config['basic_auth'] = (
                self.config['elasticsearch']['username'],
                self.config['elasticsearch']['password']
            )
        
        return Elasticsearch(**es_config)
    
    def test_connection(self) -> bool:
        """Test Elasticsearch connection"""
        try:
            info = self.client.info()
            logger.info(f"Connected to Elasticsearch cluster: {info['cluster_name']}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Elasticsearch: {e}")
            return False
    
    def create_index(self, index_name: str, mapping: Dict[str, Any]) -> bool:
        """Create index with mapping"""
        try:
            if self.client.indices.exists(index=index_name):
                logger.info(f"Index {index_name} already exists")
                return True
                
            self.client.indices.create(index=index_name, body=mapping)
            logger.info(f"Created index: {index_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to create index {index_name}: {e}")
            return False
    
    def bulk_index(self, index_name: str, documents: List[Dict[str, Any]]) -> bool:
        """Bulk index documents"""
        try:
            actions = []
            for doc in documents:
                action = {
                    '_index': index_name,
                    '_source': doc
                }
                if 'id' in doc:
                    action['_id'] = doc['id']
                actions.append(action)
            
            success, failed = bulk(self.client, actions, chunk_size=1000)
            logger.info(f"Indexed {success} documents to {index_name}")
            
            if failed:
                logger.warning(f"Failed to index {len(failed)} documents")
            
            return True
        except Exception as e:
            logger.error(f"Bulk indexing failed: {e}")
            return False

class MIMICProcessor:
    """Processes MIMIC-III clinical database data"""
    
    def __init__(self, data_path: str):
        self.data_path = Path(data_path)
        self.logger = logging.getLogger(__name__ + '.MIMICProcessor')
        
    def process_patients(self) -> Generator[Dict[str, Any], None, None]:
        """Process patient demographics from MIMIC-III"""
        patients_file = self.data_path / 'PATIENTS.csv'
        admissions_file = self.data_path / 'ADMISSIONS.csv'
        
        if not patients_file.exists():
            self.logger.warning(f"PATIENTS.csv not found in {self.data_path}")
            return
        
        # Read patients data
        try:
            patients_df = pd.read_csv(patients_file)
            admissions_df = pd.read_csv(admissions_file) if admissions_file.exists() else pd.DataFrame()
            
            for _, patient in patients_df.iterrows():
                # Calculate age (anonymized in MIMIC)
                dob = pd.to_datetime(patient['DOB']) if 'DOB' in patient else None
                
                # Get admission history
                patient_admissions = admissions_df[
                    admissions_df['SUBJECT_ID'] == patient['SUBJECT_ID']
                ] if not admissions_df.empty else pd.DataFrame()
                
                processed_patient = {
                    'id': f"patient_{patient['SUBJECT_ID']}",
                    'subject_id': int(patient['SUBJECT_ID']),
                    'demographics': {
                        'gender': patient.get('GENDER', 'Unknown'),
                        'date_of_birth': dob.isoformat() if dob else None,
                        'date_of_death': pd.to_datetime(patient['DOD']).isoformat() 
                                       if pd.notna(patient.get('DOD')) else None,
                    },
                    'admissions_count': len(patient_admissions),
                    'type': 'patient',
                    'source': 'MIMIC-III',
                    'timestamp': datetime.now().isoformat(),
                    'title': f"Patient {patient['SUBJECT_ID']} - {patient.get('GENDER', 'Unknown')}",
                    'summary': f"MIMIC-III patient record with {len(patient_admissions)} admission(s)",
                }
                
                yield processed_patient
                
        except Exception as e:
            self.logger.error(f"Error processing patients: {e}")
    
    def process_clinical_notes(self) -> Generator[Dict[str, Any], None, None]:
        """Process clinical notes from MIMIC-III"""
        notes_file = self.data_path / 'NOTEEVENTS.csv'
        
        if not notes_file.exists():
            self.logger.warning(f"NOTEEVENTS.csv not found in {self.data_path}")
            return
        
        try:
            # Process in chunks to handle large files
            chunk_size = 1000
            for chunk in pd.read_csv(notes_file, chunksize=chunk_size):
                for _, note in chunk.iterrows():
                    if pd.isna(note.get('TEXT')) or note.get('TEXT', '').strip() == '':
                        continue
                    
                    processed_note = {
                        'id': f"note_{note['ROW_ID']}",
                        'patient_id': f"patient_{note['SUBJECT_ID']}",
                        'admission_id': f"admission_{note['HADM_ID']}" if pd.notna(note.get('HADM_ID')) else None,
                        'category': note.get('CATEGORY', 'Unknown'),
                        'description': note.get('DESCRIPTION', ''),
                        'content': note.get('TEXT', '')[:5000],  # Limit content length
                        'chart_date': pd.to_datetime(note['CHARTDATE']).isoformat() 
                                    if pd.notna(note.get('CHARTDATE')) else None,
                        'type': 'clinical-note',
                        'source': 'MIMIC-III',
                        'timestamp': datetime.now().isoformat(),
                        'title': f"{note.get('CATEGORY', 'Clinical Note')} - {note.get('DESCRIPTION', 'Unknown')}",
                        'summary': note.get('TEXT', '')[:200] + '...' if len(note.get('TEXT', '')) > 200 else note.get('TEXT', ''),
                    }
                    
                    yield processed_note
                    
        except Exception as e:
            self.logger.error(f"Error processing clinical notes: {e}")
    
    def process_lab_events(self) -> Generator[Dict[str, Any], None, None]:
        """Process laboratory events from MIMIC-III"""
        lab_file = self.data_path / 'LABEVENTS.csv'
        items_file = self.data_path / 'D_LABITEMS.csv'
        
        if not lab_file.exists():
            self.logger.warning(f"LABEVENTS.csv not found in {self.data_path}")
            return
        
        # Load lab items for descriptions
        lab_items = {}
        if items_file.exists():
            items_df = pd.read_csv(items_file)
            lab_items = dict(zip(items_df['ITEMID'], items_df['LABEL']))
        
        try:
            # Process in chunks
            chunk_size = 5000
            for chunk in pd.read_csv(lab_file, chunksize=chunk_size):
                for _, lab in chunk.iterrows():
                    if pd.isna(lab.get('VALUE')):
                        continue
                    
                    lab_name = lab_items.get(lab['ITEMID'], f"Lab Item {lab['ITEMID']}")
                    
                    processed_lab = {
                        'id': f"lab_{lab['ROW_ID']}",
                        'patient_id': f"patient_{lab['SUBJECT_ID']}",
                        'admission_id': f"admission_{lab['HADM_ID']}" if pd.notna(lab.get('HADM_ID')) else None,
                        'item_id': int(lab['ITEMID']),
                        'test_name': lab_name,
                        'value': lab['VALUE'],
                        'value_num': lab.get('VALUENUM'),
                        'unit': lab.get('VALUEUOM', ''),
                        'flag': lab.get('FLAG', ''),
                        'chart_time': pd.to_datetime(lab['CHARTTIME']).isoformat() 
                                    if pd.notna(lab.get('CHARTTIME')) else None,
                        'type': 'lab-result',
                        'source': 'MIMIC-III',
                        'timestamp': datetime.now().isoformat(),
                        'title': f"{lab_name} - {lab['VALUE']}",
                        'summary': f"Lab result: {lab_name} = {lab['VALUE']} {lab.get('VALUEUOM', '')}",
                    }
                    
                    yield processed_lab
                    
        except Exception as e:
            self.logger.error(f"Error processing lab events: {e}")

class SyntheaProcessor:
    """Processes Synthea synthetic patient data"""
    
    def __init__(self, data_path: str):
        self.data_path = Path(data_path)
        self.logger = logging.getLogger(__name__ + '.SyntheaProcessor')
    
    def process_patients(self) -> Generator[Dict[str, Any], None, None]:
        """Process Synthea patient data"""
        patients_file = self.data_path / 'patients.csv'
        
        if not patients_file.exists():
            self.logger.warning(f"patients.csv not found in {self.data_path}")
            return
        
        try:
            patients_df = pd.read_csv(patients_file)
            
            for _, patient in patients_df.iterrows():
                processed_patient = {
                    'id': f"synthea_patient_{patient['Id']}",
                    'synthea_id': patient['Id'],
                    'demographics': {
                        'birth_date': patient.get('BIRTHDATE'),
                        'death_date': patient.get('DEATHDATE') if pd.notna(patient.get('DEATHDATE')) else None,
                        'ssn': patient.get('SSN'),
                        'drivers': patient.get('DRIVERS'),
                        'passport': patient.get('PASSPORT'),
                        'prefix': patient.get('PREFIX'),
                        'first_name': patient.get('FIRST'),
                        'last_name': patient.get('LAST'),
                        'suffix': patient.get('SUFFIX'),
                        'maiden': patient.get('MAIDEN'),
                        'marital_status': patient.get('MARITAL'),
                        'race': patient.get('RACE'),
                        'ethnicity': patient.get('ETHNICITY'),
                        'gender': patient.get('GENDER'),
                        'birth_place': patient.get('BIRTHPLACE'),
                        'address': patient.get('ADDRESS'),
                        'city': patient.get('CITY'),
                        'state': patient.get('STATE'),
                        'county': patient.get('COUNTY'),
                        'zip': patient.get('ZIP'),
                    },
                    'healthcare_expenses': patient.get('HEALTHCARE_EXPENSES'),
                    'healthcare_coverage': patient.get('HEALTHCARE_COVERAGE'),
                    'type': 'patient',
                    'source': 'Synthea',
                    'timestamp': datetime.now().isoformat(),
                    'title': f"Patient {patient.get('FIRST', '')} {patient.get('LAST', '')} - {patient.get('GENDER', 'Unknown')}",
                    'summary': f"Synthea synthetic patient - {patient.get('RACE', 'Unknown')} {patient.get('GENDER', 'Unknown')}",
                }
                
                yield processed_patient
                
        except Exception as e:
            self.logger.error(f"Error processing Synthea patients: {e}")

def load_config() -> Dict[str, Any]:
    """Load configuration from environment and files"""
    config = {
        'elasticsearch': {
            'node': os.getenv('ELASTICSEARCH_NODE', 'http://localhost:9200'),
            'api_key': os.getenv('ELASTICSEARCH_API_KEY'),
            'username': os.getenv('ELASTICSEARCH_USERNAME'),
            'password': os.getenv('ELASTICSEARCH_PASSWORD'),
        },
        'data_paths': {
            'mimic': os.getenv('MIMIC_DATA_PATH', './mimic-iii-clinical-database-demo-1.4'),
            'synthea': os.getenv('SYNTHEA_DATA_PATH', './synthea-master/output'),
        },
        'batch_size': int(os.getenv('BATCH_SIZE', '1000')),
    }
    
    return config

def main():
    """Main ETL pipeline execution"""
    parser = argparse.ArgumentParser(description='MediQuery AI Data Pipeline')
    parser.add_argument('--dataset', choices=['mimic', 'synthea', 'all'], 
                       default='all', help='Dataset to process')
    parser.add_argument('--create-indices', action='store_true', 
                       help='Create Elasticsearch indices')
    parser.add_argument('--batch-size', type=int, default=1000,
                       help='Batch size for processing')
    
    args = parser.parse_args()
    
    # Load configuration
    config = load_config()
    config['batch_size'] = args.batch_size
    
    # Initialize Elasticsearch connector
    es_connector = ElasticsearchConnector(config)
    
    if not es_connector.test_connection():
        logger.error("Cannot connect to Elasticsearch. Exiting.")
        sys.exit(1)
    
    # Create indices if requested
    if args.create_indices:
        from index_mappings import get_index_mappings
        mappings = get_index_mappings()
        
        for index_name, mapping in mappings.items():
            es_connector.create_index(index_name, mapping)
    
    # Process datasets
    if args.dataset in ['mimic', 'all']:
        logger.info("Processing MIMIC-III dataset...")
        mimic_processor = MIMICProcessor(config['data_paths']['mimic'])
        
        # Process patients
        batch = []
        for patient in mimic_processor.process_patients():
            batch.append(patient)
            
            if len(batch) >= config['batch_size']:
                es_connector.bulk_index('patients', batch)
                batch = []
        
        if batch:
            es_connector.bulk_index('patients', batch)
        
        # Process clinical notes
        batch = []
        for note in mimic_processor.process_clinical_notes():
            batch.append(note)
            
            if len(batch) >= config['batch_size']:
                es_connector.bulk_index('clinical-notes', batch)
                batch = []
        
        if batch:
            es_connector.bulk_index('clinical-notes', batch)
        
        # Process lab results
        batch = []
        for lab in mimic_processor.process_lab_events():
            batch.append(lab)
            
            if len(batch) >= config['batch_size']:
                es_connector.bulk_index('lab-results', batch)
                batch = []
        
        if batch:
            es_connector.bulk_index('lab-results', batch)
    
    if args.dataset in ['synthea', 'all']:
        logger.info("Processing Synthea dataset...")
        synthea_processor = SyntheaProcessor(config['data_paths']['synthea'])
        
        # Process patients
        batch = []
        for patient in synthea_processor.process_patients():
            batch.append(patient)
            
            if len(batch) >= config['batch_size']:
                es_connector.bulk_index('patients', batch)
                batch = []
        
        if batch:
            es_connector.bulk_index('patients', batch)
    
    logger.info("Data pipeline completed successfully!")

if __name__ == '__main__':
    main()