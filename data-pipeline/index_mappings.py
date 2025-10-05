"""
Elasticsearch index mappings for MediQuery AI healthcare data
"""

def get_index_mappings():
    """Returns all index mappings for healthcare data"""
    
    return {
        'patients': get_patients_mapping(),
        'clinical-notes': get_clinical_notes_mapping(),
        'lab-results': get_lab_results_mapping(),
        'medications': get_medications_mapping(),
        'research-papers': get_research_papers_mapping(),
    }

def get_patients_mapping():
    """Patient records index mapping"""
    return {
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 0,
            "analysis": {
                "analyzer": {
                    "medical_analyzer": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": [
                            "lowercase",
                            "stop",
                            "medical_synonyms"
                        ]
                    }
                },
                "filter": {
                    "medical_synonyms": {
                        "type": "synonym",
                        "synonyms": [
                            "MI,myocardial infarction,heart attack",
                            "DM,diabetes mellitus,diabetes",
                            "HTN,hypertension,high blood pressure",
                            "COPD,chronic obstructive pulmonary disease",
                            "CHF,congestive heart failure,heart failure"
                        ]
                    }
                }
            }
        },
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "subject_id": {"type": "long"},
                "synthea_id": {"type": "keyword"},
                "demographics": {
                    "properties": {
                        "gender": {"type": "keyword"},
                        "date_of_birth": {"type": "date"},
                        "date_of_death": {"type": "date"},
                        "race": {"type": "keyword"},
                        "ethnicity": {"type": "keyword"},
                        "marital_status": {"type": "keyword"},
                        "language": {"type": "keyword"},
                        "insurance": {"type": "keyword"},
                        "birth_place": {"type": "text"},
                        "address": {"type": "text"},
                        "city": {"type": "keyword"},
                        "state": {"type": "keyword"},
                        "county": {"type": "keyword"},
                        "zip": {"type": "keyword"}
                    }
                },
                "conditions": {
                    "type": "nested",
                    "properties": {
                        "code": {"type": "keyword"},
                        "code_system": {"type": "keyword"},
                        "description": {
                            "type": "text",
                            "analyzer": "medical_analyzer"
                        },
                        "severity": {"type": "keyword"},
                        "status": {"type": "keyword"},
                        "onset_date": {"type": "date"},
                        "resolved_date": {"type": "date"}
                    }
                },
                "admissions_count": {"type": "integer"},
                "healthcare_expenses": {"type": "double"},
                "healthcare_coverage": {"type": "double"},
                "type": {"type": "keyword"},
                "source": {"type": "keyword"},
                "timestamp": {"type": "date"},
                "title": {
                    "type": "text",
                    "analyzer": "medical_analyzer",
                    "fields": {
                        "keyword": {"type": "keyword"}
                    }
                },
                "summary": {
                    "type": "text",
                    "analyzer": "medical_analyzer"
                },
                "embedding": {
                    "type": "dense_vector",
                    "dims": 384
                }
            }
        }
    }

def get_clinical_notes_mapping():
    """Clinical notes index mapping"""
    return {
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 0,
            "analysis": {
                "analyzer": {
                    "medical_analyzer": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": [
                            "lowercase",
                            "stop",
                            "medical_synonyms"
                        ]
                    }
                },
                "filter": {
                    "medical_synonyms": {
                        "type": "synonym",
                        "synonyms": [
                            "MI,myocardial infarction,heart attack",
                            "DM,diabetes mellitus,diabetes",
                            "HTN,hypertension,high blood pressure",
                            "COPD,chronic obstructive pulmonary disease",
                            "CHF,congestive heart failure,heart failure"
                        ]
                    }
                }
            }
        },
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "patient_id": {"type": "keyword"},
                "admission_id": {"type": "keyword"},
                "category": {"type": "keyword"},
                "description": {
                    "type": "text",
                    "analyzer": "medical_analyzer"
                },
                "content": {
                    "type": "text",
                    "analyzer": "medical_analyzer"
                },
                "author": {"type": "keyword"},
                "chart_date": {"type": "date"},
                "department": {"type": "keyword"},
                "tags": {"type": "keyword"},
                "related_conditions": {"type": "keyword"},
                "type": {"type": "keyword"},
                "source": {"type": "keyword"},
                "timestamp": {"type": "date"},
                "title": {
                    "type": "text",
                    "analyzer": "medical_analyzer",
                    "fields": {
                        "keyword": {"type": "keyword"}
                    }
                },
                "summary": {
                    "type": "text",
                    "analyzer": "medical_analyzer"
                },
                "embedding": {
                    "type": "dense_vector",
                    "dims": 384
                }
            }
        }
    }

def get_lab_results_mapping():
    """Laboratory results index mapping"""
    return {
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 0
        },
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "patient_id": {"type": "keyword"},
                "admission_id": {"type": "keyword"},
                "item_id": {"type": "long"},
                "test_name": {
                    "type": "text",
                    "analyzer": "standard",
                    "fields": {
                        "keyword": {"type": "keyword"}
                    }
                },
                "value": {"type": "text"},
                "value_num": {"type": "double"},
                "unit": {"type": "keyword"},
                "reference_range": {"type": "text"},
                "flag": {"type": "keyword"},
                "status": {"type": "keyword"},
                "chart_time": {"type": "date"},
                "ordering_provider": {"type": "keyword"},
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

def get_medications_mapping():
    """Medications index mapping"""
    return {
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 0,
            "analysis": {
                "analyzer": {
                    "drug_analyzer": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": [
                            "lowercase",
                            "stop",
                            "drug_synonyms"
                        ]
                    }
                },
                "filter": {
                    "drug_synonyms": {
                        "type": "synonym",
                        "synonyms": [
                            "acetaminophen,paracetamol,tylenol",
                            "ibuprofen,advil,motrin",
                            "aspirin,acetylsalicylic acid,ASA",
                            "metformin,glucophage",
                            "lisinopril,prinivil,zestril"
                        ]
                    }
                }
            }
        },
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "patient_id": {"type": "keyword"},
                "name": {
                    "type": "text",
                    "analyzer": "drug_analyzer",
                    "fields": {
                        "keyword": {"type": "keyword"}
                    }
                },
                "generic_name": {
                    "type": "text",
                    "analyzer": "drug_analyzer"
                },
                "dosage": {"type": "text"},
                "frequency": {"type": "text"},
                "route": {"type": "keyword"},
                "start_date": {"type": "date"},
                "end_date": {"type": "date"},
                "status": {"type": "keyword"},
                "prescribing_provider": {"type": "keyword"},
                "interactions": {
                    "type": "nested",
                    "properties": {
                        "drug_name": {"type": "text"},
                        "severity": {"type": "keyword"},
                        "description": {"type": "text"},
                        "recommendation": {"type": "text"}
                    }
                },
                "side_effects": {"type": "text"},
                "type": {"type": "keyword"},
                "source": {"type": "keyword"},
                "timestamp": {"type": "date"},
                "title": {
                    "type": "text",
                    "analyzer": "drug_analyzer",
                    "fields": {
                        "keyword": {"type": "keyword"}
                    }
                },
                "summary": {
                    "type": "text",
                    "analyzer": "drug_analyzer"
                },
                "embedding": {
                    "type": "dense_vector",
                    "dims": 384
                }
            }
        }
    }

def get_research_papers_mapping():
    """Medical research papers index mapping"""
    return {
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 0,
            "analysis": {
                "analyzer": {
                    "medical_research_analyzer": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": [
                            "lowercase",
                            "stop",
                            "medical_terms"
                        ]
                    }
                },
                "filter": {
                    "medical_terms": {
                        "type": "synonym",
                        "synonyms": [
                            "randomized controlled trial,RCT",
                            "systematic review,meta-analysis",
                            "confidence interval,CI",
                            "odds ratio,OR",
                            "relative risk,RR"
                        ]
                    }
                }
            }
        },
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "pmid": {"type": "keyword"},
                "doi": {"type": "keyword"},
                "title": {
                    "type": "text",
                    "analyzer": "medical_research_analyzer",
                    "fields": {
                        "keyword": {"type": "keyword"}
                    }
                },
                "abstract": {
                    "type": "text",
                    "analyzer": "medical_research_analyzer"
                },
                "authors": {
                    "type": "nested",
                    "properties": {
                        "name": {"type": "text"},
                        "affiliation": {"type": "text"}
                    }
                },
                "journal": {"type": "keyword"},
                "publication_date": {"type": "date"},
                "study_type": {"type": "keyword"},
                "keywords": {"type": "keyword"},
                "mesh_terms": {"type": "keyword"},
                "conclusions": {
                    "type": "text",
                    "analyzer": "medical_research_analyzer"
                },
                "evidence_level": {"type": "keyword"},
                "patient_population": {"type": "text"},
                "intervention": {"type": "text"},
                "outcomes": {"type": "text"},
                "citations_count": {"type": "integer"},
                "type": {"type": "keyword"},
                "source": {"type": "keyword"},
                "timestamp": {"type": "date"},
                "summary": {
                    "type": "text",
                    "analyzer": "medical_research_analyzer"
                },
                "embedding": {
                    "type": "dense_vector",
                    "dims": 384
                }
            }
        }
    }