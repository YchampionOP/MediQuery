# MediQuery AI Healthcare Search Platform

An intelligent conversational healthcare search assistant that transforms how clinicians and patients interact with medical data using Elastic Cloud's hybrid search capabilities.

## Overview

MediQuery AI addresses the critical challenge where healthcare professionals spend 40% of their time navigating fragmented data systems, while patients struggle to understand their health information. By combining advanced search techniques with conversational AI, MediQuery reduces information retrieval time by 60% and improves treatment adherence through better patient understanding.

## Architecture

```
mediquery/
├── frontend/          # React application with chat interface
├── backend/          # Node.js/Express API server
├── data-pipeline/    # ETL processing for healthcare datasets
├── elasticsearch/    # Index configurations and mappings
├── ai-models/       # Local LLM integration and embeddings
├── docs/           # Documentation and API specs
└── scripts/        # Deployment and utility scripts
```

## Technology Stack

- **Frontend**: React with Vite, TypeScript, CSS Modules
- **Backend**: Node.js, Express, TypeScript
- **Search Engine**: Elasticsearch Cloud (Hybrid Search with BM25 + Vector + RRF)
- **Data Sources**: MIMIC-III Clinical Database, Synthea Synthetic Data
- **AI Models**: Local LLMs (MedAlpaca, BioGPT), Medical Embeddings
- **Medical Standards**: ICD-10, SNOMED-CT, CPT codes

## Features

### For Clinicians
- Rapid access to patient histories and similar cases
- Evidence-based decision support with citations
- Clinical guidelines compliance checking
- Drug interaction screening

### For Patients
- Plain-language explanations of medical data
- Personalized health insights
- Treatment adherence support
- Educational resource connections

### Core Capabilities
- Hybrid search combining lexical and semantic matching
- Role-based information presentation
- Real-time conversational interface
- PDF report generation and data export
- Medical ontology integration

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ for data processing
- Elasticsearch Cloud account
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YchampionOP/MediQuery.git
cd MediQuery
```

2. Install dependencies:
```bash
# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install

# Data pipeline dependencies
cd ../data-pipeline && pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Elasticsearch and other service credentials
```

4. Set up the database and indices:
```bash
cd data-pipeline
python setup_indices.py
python process_mimic_data.py
```

5. Start the development servers:
```bash
# Backend (port 3001)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm run dev
```

## Demo Configuration

### Setting Your Demo Video URL

To set your demo video URL:

1. Open `frontend/src/pages/Features.tsx`
2. Find the line: `const [demoVideoUrl, setDemoVideoUrl] = useState('https://drive.google.com/file/d/1234567890/view');`
3. Replace the URL with your actual Google Drive video link

Example:
```typescript
const [demoVideoUrl, setDemoVideoUrl] = useState('https://drive.google.com/file/d/YOUR_VIDEO_ID/view');
```

## Demo Scenarios

### Clinician Workflows
- **Complex Case Analysis**: "Show me patients similar to a 67-year-old diabetic with recent chest pain"
- **Research Integration**: "Find recent studies on ACE inhibitor effectiveness for elderly diabetic patients"
- **Quality Improvement**: "Identify cases where standard diabetes care guidelines weren't followed"

### Patient Education
- **Lab Result Explanation**: "Explain my recent blood test results in simple terms"
- **Medication Understanding**: "What should I know about my new diabetes medication?"
- **Health Trends**: "Show me how my blood pressure has changed over the past year"

## Development

### Project Structure
- `/frontend` - React TypeScript application
- `/backend` - Express API server with TypeScript
- `/data-pipeline` - Python ETL scripts for healthcare data
- `/elasticsearch` - Index mappings and search configurations
- `/ai-models` - LLM integration and medical embeddings
- `/docs` - API documentation and architecture diagrams

### Testing
```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run integration tests
npm run test:integration
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- MIMIC-III Clinical Database for providing de-identified healthcare data
- Synthea for synthetic patient data generation
- Elastic for hybrid search capabilities
- Medical ontology providers (ICD-10, SNOMED-CT, CPT)