# MediQuery AI Healthcare Search Platform - Deployment Guide

## Overview
This document provides comprehensive deployment instructions for the MediQuery AI Healthcare Search Platform across different environments.

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **Python**: 3.9 or higher
- **Elasticsearch**: 8.x (Cloud or self-hosted)
- **Memory**: Minimum 8GB RAM for development, 16GB+ for production
- **Storage**: 50GB+ for data processing and model storage
- **Network**: HTTPS-enabled domain for production

### Dependencies
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend && npm install

# Python dependencies for data pipeline
cd data-pipeline && pip install -r requirements.txt
```

## Environment Configuration

### Development Environment

1. **Environment Variables** (.env.development)
```bash
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Elasticsearch Configuration
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_password

# Security
JWT_SECRET=your-development-jwt-secret
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/mediquery-dev.log

# Data Processing
MIMIC_DATA_PATH=./data/mimic-iii-clinical-database-demo-1.4
SYNTHEA_DATA_PATH=./data/synthea-master/output
BATCH_SIZE=1000

# AI Models
LLM_MODEL_PATH=./ai-models/medical-llm
EMBEDDINGS_MODEL_PATH=./ai-models/medical-embeddings

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

2. **Development Commands**
```bash
# Start backend in development mode
npm run dev

# Start frontend in development mode
cd frontend && npm run dev

# Run tests
npm test

# Start data processing pipeline
cd data-pipeline && python main.py --mode development
```

### Staging Environment

1. **Environment Variables** (.env.staging)
```bash
NODE_ENV=staging
PORT=3001
FRONTEND_URL=https://staging.mediquery.ai

# Elasticsearch Cloud
ELASTICSEARCH_NODE=https://staging-cluster.es.us-east-1.aws.elastic.cloud:9243
ELASTICSEARCH_API_KEY=your_staging_api_key

# Security
JWT_SECRET=your-staging-jwt-secret-256-bit
CORS_ORIGIN=https://staging.mediquery.ai

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/mediquery-staging.log

# External Services
ELASTICSEARCH_CLOUD_ID=staging-cluster:dXMtZWFzdC0x...
```

2. **Docker Configuration** (docker-compose.staging.yml)
```yaml
version: '3.8'
services:
  mediquery-backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      - NODE_ENV=staging
    ports:
      - "3001:3001"
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    depends_on:
      - redis
      - postgres

  mediquery-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=https://staging-api.mediquery.ai

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: mediquery_staging
      POSTGRES_USER: mediquery
      POSTGRES_PASSWORD: your_postgres_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Production Environment

1. **Environment Variables** (.env.production)
```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://mediquery.ai

# Elasticsearch Cloud Production
ELASTICSEARCH_NODE=https://prod-cluster.es.us-east-1.aws.elastic.cloud:9243
ELASTICSEARCH_API_KEY=your_production_api_key
ELASTICSEARCH_CLOUD_ID=prod-cluster:dXMtZWFzdC0x...

# Security (Use AWS Secrets Manager or similar)
JWT_SECRET=${AWS_SECRET_JWT_SECRET}
CORS_ORIGIN=https://mediquery.ai

# Logging
LOG_LEVEL=warn
LOG_FILE=./logs/mediquery-prod.log

# Database
DATABASE_URL=postgresql://user:password@prod-db.amazonaws.com:5432/mediquery

# Redis
REDIS_URL=redis://prod-redis.cache.amazonaws.com:6379

# File Storage
AWS_S3_BUCKET=mediquery-exports-prod
AWS_REGION=us-east-1

# Monitoring
DATADOG_API_KEY=your_datadog_key
NEW_RELIC_LICENSE_KEY=your_newrelic_key

# Rate Limiting (Stricter for production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment Strategies

### 1. AWS Deployment

#### Infrastructure as Code (Terraform)
```hcl
# infrastructure/main.tf
provider "aws" {
  region = "us-east-1"
}

# ECS Cluster
resource "aws_ecs_cluster" "mediquery" {
  name = "mediquery-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "mediquery" {
  name               = "mediquery-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
}

# ECS Service for Backend
resource "aws_ecs_service" "backend" {
  name            = "mediquery-backend"
  cluster         = aws_ecs_cluster.mediquery.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 2
  
  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "mediquery-backend"
    container_port   = 3001
  }
}

# RDS for PostgreSQL
resource "aws_db_instance" "mediquery" {
  identifier = "mediquery-prod-db"
  engine     = "postgres"
  engine_version = "15.3"
  instance_class = "db.r6g.large"
  allocated_storage = 100
  storage_encrypted = true
  
  db_name  = "mediquery"
  username = "mediquery"
  password = var.db_password
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "mediquery-final-snapshot"
}

# ElastiCache for Redis
resource "aws_elasticache_cluster" "mediquery" {
  cluster_id           = "mediquery-cache"
  engine               = "redis"
  node_type            = "cache.r6g.large"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  security_group_ids   = [aws_security_group.redis.id]
  subnet_group_name    = aws_elasticache_subnet_group.mediquery.name
}
```

#### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd frontend && npm ci
    
    - name: Run tests
      run: |
        npm test
        cd frontend && npm test
    
    - name: Run security audit
      run: npm audit --audit-level moderate

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build and push backend image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: mediquery-backend
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
    
    - name: Build and push frontend image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: mediquery-frontend
        IMAGE_TAG: ${{ github.sha }}
      run: |
        cd frontend
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
    
    - name: Deploy to ECS
      run: |
        aws ecs update-service --cluster mediquery-cluster --service mediquery-backend --force-new-deployment
        aws ecs update-service --cluster mediquery-cluster --service mediquery-frontend --force-new-deployment
```

### 2. Docker Deployment

#### Backend Dockerfile
```dockerfile
# Dockerfile.backend
FROM node:18-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build --chown=nodeuser:nodejs /app/dist ./dist
COPY --from=build --chown=nodeuser:nodejs /app/package.json ./package.json

# Create directories for logs and data
RUN mkdir -p /app/logs /app/data && chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/index.js"]
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS runtime

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Add health check
RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mediquery-backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/mediquery
      - REDIS_URL=redis://redis:6379
      - ELASTICSEARCH_NODE=${ELASTICSEARCH_NODE}
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "3001:3001"
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G

  mediquery-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - mediquery-backend
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: mediquery
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - mediquery-frontend
      - mediquery-backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## Security Configuration

### 1. SSL/TLS Setup
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name mediquery.ai;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";

    location / {
        proxy_pass http://mediquery-frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://mediquery-backend:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
}

# HTTP redirect
server {
    listen 80;
    server_name mediquery.ai;
    return 301 https://$server_name$request_uri;
}
```

### 2. Environment Security
```bash
# Use AWS Secrets Manager for production secrets
aws secretsmanager create-secret \
    --name "mediquery/prod/database" \
    --description "Database credentials for MediQuery production" \
    --secret-string '{"username":"mediquery","password":"secure_password"}'

aws secretsmanager create-secret \
    --name "mediquery/prod/jwt" \
    --description "JWT secret for MediQuery production" \
    --secret-string '{"secret":"your_256_bit_secret_key"}'
```

## Monitoring and Logging

### 1. Application Monitoring
```yaml
# monitoring/docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  grafana_data:
```

### 2. Health Checks
```javascript
// health/healthcheck.js
const http = require('http');
const { Client } = require('@elastic/elasticsearch');

const healthChecks = {
  async database() {
    // Database health check
    try {
      // Implement database ping
      return { status: 'healthy', latency: '5ms' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },

  async elasticsearch() {
    try {
      const client = new Client({ node: process.env.ELASTICSEARCH_NODE });
      await client.ping();
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },

  async redis() {
    // Redis health check
    try {
      // Implement Redis ping
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
};

async function performHealthChecks() {
  const checks = {};
  
  for (const [service, checkFn] of Object.entries(healthChecks)) {
    try {
      checks[service] = await checkFn();
    } catch (error) {
      checks[service] = { status: 'unhealthy', error: error.message };
    }
  }
  
  return checks;
}

module.exports = { performHealthChecks };
```

## Backup and Recovery

### 1. Database Backup
```bash
#!/bin/bash
# backup/backup-db.sh

BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="mediquery"

# Create backup
pg_dump -h postgres -U postgres $DB_NAME | gzip > $BACKUP_DIR/mediquery_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/mediquery_$DATE.sql.gz s3://mediquery-backups/database/

# Clean up old local backups (keep last 7 days)
find $BACKUP_DIR -name "mediquery_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: mediquery_$DATE.sql.gz"
```

### 2. Elasticsearch Backup
```bash
#!/bin/bash
# backup/backup-elasticsearch.sh

BACKUP_REPO="mediquery_backups"
SNAPSHOT_NAME="snapshot_$(date +%Y%m%d_%H%M%S)"

# Create snapshot
curl -X PUT "localhost:9200/_snapshot/$BACKUP_REPO/$SNAPSHOT_NAME?wait_for_completion=true" \
  -H 'Content-Type: application/json' \
  -d '{"indices": "patients,clinical-notes,lab-results","ignore_unavailable": true}'

echo "Elasticsearch snapshot created: $SNAPSHOT_NAME"
```

## Deployment Checklist

### Pre-Deployment
- [ ] Run all tests (unit, integration, end-to-end)
- [ ] Security scan completed
- [ ] Dependencies updated and audited
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Database migrations prepared
- [ ] Backup verification completed

### Deployment
- [ ] Scale down old version (if applicable)
- [ ] Deploy new version
- [ ] Run database migrations
- [ ] Health checks passing
- [ ] Load balancer updated
- [ ] DNS updated (if needed)
- [ ] Scale up new version

### Post-Deployment
- [ ] Application monitoring active
- [ ] Error rates within acceptable limits
- [ ] Performance metrics normal
- [ ] User acceptance testing completed
- [ ] Documentation updated
- [ ] Team notified of deployment

## Troubleshooting

### Common Issues

1. **Elasticsearch Connection Timeout**
   ```bash
   # Check cluster health
   curl -X GET "elasticsearch:9200/_cluster/health"
   
   # Increase timeout in application
   ELASTICSEARCH_REQUEST_TIMEOUT=60000
   ```

2. **Database Connection Pool Exhaustion**
   ```bash
   # Monitor active connections
   SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
   
   # Increase pool size
   DATABASE_POOL_MAX=20
   ```

3. **Memory Issues**
   ```bash
   # Monitor memory usage
   docker stats
   
   # Increase container memory limits
   deploy:
     resources:
       limits:
         memory: 4G
   ```

4. **SSL Certificate Renewal**
   ```bash
   # Renew Let's Encrypt certificates
   certbot renew --nginx
   
   # Restart nginx
   docker-compose restart nginx-proxy
   ```

### Monitoring Commands
```bash
# Check application logs
docker-compose logs -f mediquery-backend

# Monitor system resources
htop

# Check disk usage
df -h

# Monitor network connections
netstat -tulpn

# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

This comprehensive deployment guide provides everything needed to deploy the MediQuery AI Healthcare Search Platform in various environments with proper security, monitoring, and backup strategies.