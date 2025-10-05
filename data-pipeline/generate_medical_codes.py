"""
Generate sample medical codes data for MediQuery AI
"""

import json
from datetime import datetime
from elasticsearch import Elasticsearch

# Sample medical codes data
MEDICAL_CODES = [
    # ICD-10 Codes
    {"code": "E11.9", "codeSystem": "ICD-10", "description": "Type 2 diabetes mellitus without complications", "category": "Endocrine"},
    {"code": "I10", "codeSystem": "ICD-10", "description": "Essential (primary) hypertension", "category": "Circulatory"},
    {"code": "E78.5", "codeSystem": "ICD-10", "description": "Hyperlipidemia", "category": "Endocrine"},
    {"code": "I25.10", "codeSystem": "ICD-10", "description": "Atherosclerotic heart disease of native coronary artery without angina pectoris", "category": "Circulatory"},
    {"code": "J44.1", "codeSystem": "ICD-10", "description": "Chronic obstructive pulmonary disease with (acute) exacerbation", "category": "Respiratory"},
    {"code": "N18.6", "codeSystem": "ICD-10", "description": "End stage renal disease", "category": "Genitourinary"},
    {"code": "F33.1", "codeSystem": "ICD-10", "description": "Major depressive disorder, recurrent, moderate", "category": "Mental"},
    {"code": "I50.9", "codeSystem": "ICD-10", "description": "Heart failure, unspecified", "category": "Circulatory"},
    {"code": "K70.30", "codeSystem": "ICD-10", "description": "Alcoholic cirrhosis of liver without ascites", "category": "Digestive"},
    {"code": "J45.909", "codeSystem": "ICD-10", "description": "Unspecified asthma, uncomplicated", "category": "Respiratory"},
    
    # SNOMED-CT Codes
    {"code": "73211009", "codeSystem": "SNOMED-CT", "description": "Diabetes mellitus", "category": "Endocrine"},
    {"code": "38341003", "codeSystem": "SNOMED-CT", "description": "Hypertensive disorder, systemic arterial", "category": "Circulatory"},
    {"code": "59621000", "codeSystem": "SNOMED-CT", "description": "Essential hypertension", "category": "Circulatory"},
    {"code": "194828000", "codeSystem": "SNOMED-CT", "description": "Angina pectoris", "category": "Circulatory"},
    {"code": "13644009", "codeSystem": "SNOMED-CT", "description": "Hypercholesterolemia", "category": "Endocrine"},
    {"code": "195967001", "codeSystem": "SNOMED-CT", "description": "Asthma", "category": "Respiratory"},
    {"code": "84114007", "codeSystem": "SNOMED-CT", "description": "Heart failure", "category": "Circulatory"},
    {"code": "7200002", "codeSystem": "SNOMED-CT", "description": "Alcoholism", "category": "Mental"},
    {"code": "90708001", "codeSystem": "SNOMED-CT", "description": "Kidney failure syndrome", "category": "Genitourinary"},
    {"code": "35489007", "codeSystem": "SNOMED-CT", "description": "Depressive disorder", "category": "Mental"},
    
    # CPT Codes
    {"code": "99213", "codeSystem": "CPT", "description": "Office or other outpatient visit for the evaluation and management of an established patient", "category": "Evaluation and Management"},
    {"code": "99214", "codeSystem": "CPT", "description": "Office or other outpatient visit for the evaluation and management of an established patient, which requires at least 2 of these 3 key components", "category": "Evaluation and Management"},
    {"code": "99283", "codeSystem": "CPT", "description": "Emergency department visit for the evaluation and management of a patient", "category": "Evaluation and Management"},
    {"code": "80048", "codeSystem": "CPT", "description": "Basic metabolic panel", "category": "Pathology and Laboratory"},
    {"code": "80053", "codeSystem": "CPT", "description": "Comprehensive metabolic panel", "category": "Pathology and Laboratory"},
    {"code": "85025", "codeSystem": "CPT", "description": "Complete blood count (CBC), automated (Hgb, Hct, RBC, WBC and platelet count) and automated differential WBC count", "category": "Pathology and Laboratory"},
    {"code": "71045", "codeSystem": "CPT", "description": "Radiologic examination, chest, 1 view", "category": "Radiology"},
    {"code": "71046", "codeSystem": "CPT", "description": "Radiologic examination, chest, 2 views", "category": "Radiology"},
    {"code": "93000", "codeSystem": "CPT", "description": "Electrocardiogram, routine ECG with at least 12 leads", "category": "Medicine"},
    {"code": "36415", "codeSystem": "CPT", "description": "Collection of venous blood by venipuncture", "category": "Pathology and Laboratory"},
]

def get_medical_codes_mapping():
    """Medical codes index mapping"""
    return {
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 0
        },
        "mappings": {
            "properties": {
                "code": {"type": "keyword"},
                "codeSystem": {"type": "keyword"},
                "description": {
                    "type": "text",
                    "analyzer": "standard",
                    "fields": {
                        "keyword": {"type": "keyword"}
                    }
                },
                "category": {"type": "keyword"},
                "type": {"type": "keyword"},
                "source": {"type": "keyword"},
                "timestamp": {"type": "date"},
                "title": {
                    "type": "text",
                    "fields": {
                        "keyword": {"type": "keyword"}
                    }
                },
                "summary": {"type": "text"},
                "embedding": {
                    "type": "dense_vector",
                    "dims": 384
                }
            }
        }
    }

def index_medical_codes():
    """Index medical codes into Elasticsearch"""
    # Elasticsearch configuration
    es = Elasticsearch(
        hosts=['https://my-elasticsearch-project-b1c395.es.us-central1.gcp.elastic.cloud:443'],
        api_key='Yzlxa3Naa0JYMHEyN2RUZ2ptckg6TzB2dDNfc1ZxbVhlZEw5UFJNVFdiQQ==',
        verify_certs=True
    )
    
    # Create index with mapping
    index_name = 'medical-codes'
    
    try:
        # Check if index exists
        if es.indices.exists(index=index_name):
            print(f"Index {index_name} already exists")
        else:
            # Create index with mapping
            es.indices.create(
                index=index_name,
                body=get_medical_codes_mapping()
            )
            print(f"Created index {index_name}")
        
        # Index medical codes
        for i, code in enumerate(MEDICAL_CODES):
            doc = {
                "id": f"code_{i+1:03d}",
                "code": code["code"],
                "codeSystem": code["codeSystem"],
                "description": code["description"],
                "category": code["category"],
                "type": "medical-code",
                "source": "Demo Data",
                "timestamp": datetime.now().isoformat(),
                "title": f"{code['code']} - {code['description']}",
                "summary": f"Medical code {code['code']} from {code['codeSystem']}: {code['description']}"
            }
            
            es.index(
                index=index_name,
                id=doc["id"],
                document=doc,
                refresh=True
            )
        
        print(f"Indexed {len(MEDICAL_CODES)} medical codes")
        
        # Verify indexing
        result = es.search(index=index_name, body={"query": {"match_all": {}}, "size": 5})
        print(f"Verified {result['hits']['total']['value']} documents in index")
        
    except Exception as e:
        print(f"Error indexing medical codes: {e}")

if __name__ == "__main__":
    index_medical_codes()