#!/usr/bin/env python3
"""
Elasticsearch Index Setup for MediQuery AI
Creates and configures all medical data indices with optimized mappings
"""

import os
import sys
import json
import logging
from typing import Dict, Any, List
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from elasticsearch import Elasticsearch
from index_mappings import get_index_mappings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ElasticsearchIndexManager:
    """Manages Elasticsearch indices for MediQuery AI"""
    
    def __init__(self, es_config: Dict[str, Any]):
        self.client = self._create_client(es_config)
        self.indices_created = []
        self.indices_failed = []
    
    def _create_client(self, config: Dict[str, Any]) -> Elasticsearch:
        """Create Elasticsearch client with authentication"""
        client_config = {
            'hosts': [config['node']],
            'timeout': 30,
            'max_retries': 3,
            'retry_on_timeout': True
        }
        
        # Add authentication
        if config.get('api_key'):
            client_config['api_key'] = config['api_key']
        elif config.get('username') and config.get('password'):
            client_config['basic_auth'] = (config['username'], config['password'])
        
        return Elasticsearch(**client_config)
    
    def test_connection(self) -> bool:
        """Test Elasticsearch connection"""
        try:
            info = self.client.info()
            logger.info(f"✅ Connected to Elasticsearch cluster: {info['cluster_name']}")
            logger.info(f"   Version: {info['version']['number']}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to Elasticsearch: {e}")
            return False
    
    def create_all_indices(self, force_recreate: bool = False) -> bool:
        """Create all MediQuery indices"""
        logger.info("🏗️  Creating MediQuery AI indices...")
        
        mappings = get_index_mappings()
        
        for index_name, mapping in mappings.items():
            try:
                success = self.create_index(index_name, mapping, force_recreate)
                if success:
                    self.indices_created.append(index_name)
                else:
                    self.indices_failed.append(index_name)
            except Exception as e:
                logger.error(f"❌ Failed to create index {index_name}: {e}")
                self.indices_failed.append(index_name)
        
        # Report results
        logger.info(f"\n📊 Index Creation Summary:")
        logger.info(f"   ✅ Created: {len(self.indices_created)} indices")
        logger.info(f"   ❌ Failed: {len(self.indices_failed)} indices")
        
        if self.indices_created:
            logger.info(f"   Created indices: {', '.join(self.indices_created)}")
        
        if self.indices_failed:
            logger.error(f"   Failed indices: {', '.join(self.indices_failed)}")
        
        return len(self.indices_failed) == 0
    
    def create_index(self, index_name: str, mapping: Dict[str, Any], force_recreate: bool = False) -> bool:
        """Create individual index with mapping"""
        try:
            # Check if index exists
            if self.client.indices.exists(index=index_name):
                if force_recreate:
                    logger.info(f"🗑️  Deleting existing index: {index_name}")
                    self.client.indices.delete(index=index_name)
                else:
                    logger.info(f"⚠️  Index {index_name} already exists (use --force to recreate)")
                    return True
            
            # Create index
            logger.info(f"🔨 Creating index: {index_name}")
            self.client.indices.create(index=index_name, body=mapping)
            
            # Verify creation
            if self.client.indices.exists(index=index_name):
                logger.info(f"✅ Successfully created index: {index_name}")
                
                # Log index stats
                stats = self.client.indices.stats(index=index_name)
                shards = stats['indices'][index_name]['total']['docs']['count']
                logger.info(f"   📈 Index stats - Documents: {shards}")
                
                return True
            else:
                logger.error(f"❌ Index creation verification failed: {index_name}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error creating index {index_name}: {e}")
            return False
    
    def delete_index(self, index_name: str) -> bool:
        """Delete an index"""
        try:
            if not self.client.indices.exists(index=index_name):
                logger.warning(f"⚠️  Index {index_name} does not exist")
                return True
            
            self.client.indices.delete(index=index_name)
            logger.info(f"🗑️  Deleted index: {index_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error deleting index {index_name}: {e}")
            return False
    
    def list_indices(self) -> List[str]:
        """List all MediQuery indices"""
        try:
            all_indices = list(self.client.indices.get_alias().keys())
            mediquery_indices = [idx for idx in all_indices if any(
                pattern in idx for pattern in ['patients', 'clinical-notes', 'lab-results', 'medications', 'research']
            )]
            return mediquery_indices
        except Exception as e:
            logger.error(f"❌ Error listing indices: {e}")
            return []
    
    def get_index_info(self, index_name: str) -> Dict[str, Any]:
        """Get detailed information about an index"""
        try:
            if not self.client.indices.exists(index=index_name):
                return {'error': 'Index does not exist'}
            
            # Get index settings and mappings
            settings = self.client.indices.get_settings(index=index_name)
            mappings = self.client.indices.get_mapping(index=index_name)
            stats = self.client.indices.stats(index=index_name)
            
            return {
                'name': index_name,
                'settings': settings[index_name]['settings'],
                'mappings': mappings[index_name]['mappings'],
                'stats': {
                    'documents': stats['indices'][index_name]['total']['docs']['count'],
                    'size': stats['indices'][index_name]['total']['store']['size_in_bytes'],
                    'shards': stats['indices'][index_name]['total']['segments']['count']
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting index info for {index_name}: {e}")
            return {'error': str(e)}
    
    def validate_mappings(self) -> bool:
        """Validate all index mappings"""
        logger.info("🔍 Validating index mappings...")
        
        mappings = get_index_mappings()
        validation_errors = []
        
        for index_name, mapping in mappings.items():
            try:
                # Validate mapping structure
                if 'mappings' not in mapping:
                    validation_errors.append(f"{index_name}: Missing 'mappings' section")
                    continue
                
                if 'properties' not in mapping['mappings']:
                    validation_errors.append(f"{index_name}: Missing 'properties' in mappings")
                    continue
                
                # Check required fields
                required_fields = ['id', 'type', 'source', 'timestamp', 'title', 'summary']
                properties = mapping['mappings']['properties']
                
                for field in required_fields:
                    if field not in properties:
                        validation_errors.append(f"{index_name}: Missing required field '{field}'")
                
                # Validate analyzers
                if 'settings' in mapping and 'analysis' in mapping['settings']:
                    analyzers = mapping['settings']['analysis'].get('analyzer', {})
                    for analyzer_name, analyzer_config in analyzers.items():
                        if 'tokenizer' not in analyzer_config:
                            validation_errors.append(f"{index_name}: Analyzer '{analyzer_name}' missing tokenizer")
                
                logger.info(f"✅ Mapping validation passed: {index_name}")
                
            except Exception as e:
                validation_errors.append(f"{index_name}: Validation error - {e}")
        
        if validation_errors:
            logger.error(f"❌ Mapping validation failed:")
            for error in validation_errors:
                logger.error(f"   {error}")
            return False
        
        logger.info("✅ All mapping validations passed")
        return True
    
    def optimize_indices(self) -> bool:
        """Optimize all MediQuery indices"""
        logger.info("⚡ Optimizing indices...")
        
        indices = self.list_indices()
        optimization_results = []
        
        for index_name in indices:
            try:
                # Force merge to optimize segments
                logger.info(f"🔧 Optimizing index: {index_name}")
                self.client.indices.forcemerge(index=index_name, max_num_segments=1)
                
                # Refresh index
                self.client.indices.refresh(index=index_name)
                
                optimization_results.append((index_name, True))
                logger.info(f"✅ Optimized: {index_name}")
                
            except Exception as e:
                optimization_results.append((index_name, False))
                logger.error(f"❌ Failed to optimize {index_name}: {e}")
        
        successful = sum(1 for _, success in optimization_results if success)
        logger.info(f"📊 Optimization complete: {successful}/{len(indices)} indices optimized")
        
        return successful == len(indices)
    
    def backup_index_config(self, output_dir: str = "backups") -> bool:
        """Backup index configurations"""
        logger.info("💾 Backing up index configurations...")
        
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        indices = self.list_indices()
        backup_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        for index_name in indices:
            try:
                info = self.get_index_info(index_name)
                if 'error' not in info:
                    backup_file = output_path / f"{index_name}_{backup_timestamp}.json"
                    with open(backup_file, 'w') as f:
                        json.dump(info, f, indent=2, default=str)
                    logger.info(f"💾 Backed up: {index_name}")
                else:
                    logger.error(f"❌ Failed to backup {index_name}: {info['error']}")
                    
            except Exception as e:
                logger.error(f"❌ Backup error for {index_name}: {e}")
        
        logger.info(f"✅ Backup complete: {output_dir}")
        return True

def load_config() -> Dict[str, Any]:
    """Load Elasticsearch configuration"""
    return {
        'node': os.getenv('ELASTICSEARCH_NODE', 'http://localhost:9200'),
        'api_key': os.getenv('ELASTICSEARCH_API_KEY'),
        'username': os.getenv('ELASTICSEARCH_USERNAME'),
        'password': os.getenv('ELASTICSEARCH_PASSWORD'),
    }

def main():
    """Main execution function"""
    import argparse
    from datetime import datetime
    
    parser = argparse.ArgumentParser(description='MediQuery AI Elasticsearch Index Manager')
    parser.add_argument('--create', action='store_true', help='Create all indices')
    parser.add_argument('--force', action='store_true', help='Force recreate existing indices')
    parser.add_argument('--delete', type=str, help='Delete specific index')
    parser.add_argument('--list', action='store_true', help='List all MediQuery indices')
    parser.add_argument('--info', type=str, help='Get info for specific index')
    parser.add_argument('--validate', action='store_true', help='Validate index mappings')
    parser.add_argument('--optimize', action='store_true', help='Optimize all indices')
    parser.add_argument('--backup', action='store_true', help='Backup index configurations')
    
    args = parser.parse_args()
    
    # Load configuration
    config = load_config()
    
    # Create index manager
    manager = ElasticsearchIndexManager(config)
    
    # Test connection
    if not manager.test_connection():
        sys.exit(1)
    
    # Execute requested action
    if args.create:
        success = manager.create_all_indices(force_recreate=args.force)
        sys.exit(0 if success else 1)
    
    elif args.delete:
        success = manager.delete_index(args.delete)
        sys.exit(0 if success else 1)
    
    elif args.list:
        indices = manager.list_indices()
        if indices:
            logger.info("📋 MediQuery AI Indices:")
            for idx in indices:
                logger.info(f"   📁 {idx}")
        else:
            logger.info("📭 No MediQuery indices found")
    
    elif args.info:
        info = manager.get_index_info(args.info)
        if 'error' not in info:
            logger.info(f"📊 Index Info: {args.info}")
            logger.info(f"   Documents: {info['stats']['documents']}")
            logger.info(f"   Size: {info['stats']['size']} bytes")
            logger.info(f"   Shards: {info['stats']['shards']}")
        else:
            logger.error(f"❌ {info['error']}")
    
    elif args.validate:
        success = manager.validate_mappings()
        sys.exit(0 if success else 1)
    
    elif args.optimize:
        success = manager.optimize_indices()
        sys.exit(0 if success else 1)
    
    elif args.backup:
        success = manager.backup_index_config()
        sys.exit(0 if success else 1)
    
    else:
        parser.print_help()

if __name__ == '__main__':
    main()