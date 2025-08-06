"""Vercel serverless function for generating embedding visualizations."""

import json
import base64
import io
import os
import sys
from typing import List

# Add the backend directory to the path
backend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend')
sys.path.append(backend_path)

try:
    import matplotlib
    matplotlib.use('Agg')  # Use non-interactive backend
    import matplotlib.pyplot as plt
    import numpy as np
    from adjustText import adjust_text
    from sklearn.cluster import KMeans
    from sklearn.manifold import TSNE
    from sentence_transformers import SentenceTransformer
    
    # Import our visualization function
    from visualize_embeddings import generate_visualization_plot
    
    DEPENDENCIES_AVAILABLE = True
except ImportError as e:
    DEPENDENCIES_AVAILABLE = False
    IMPORT_ERROR = str(e)


def handler(request):
    """Vercel serverless function handler."""
    # Enable CORS
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        }
    
    if request.method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    if not DEPENDENCIES_AVAILABLE:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Dependencies not available',
                'details': IMPORT_ERROR,
                'success': False
            })
        }
    
    try:
        # Parse request body
        if hasattr(request, 'get_json'):
            data = request.get_json()
        else:
            data = json.loads(request.body or '{}')
        
        informal_statement = data.get('informal_statement', '')
        lean_codes = data.get('lean_codes', [])
        
        if not informal_statement or not lean_codes:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Missing informal_statement or lean_codes',
                    'success': False
                })
            }
        
        # Generate the visualization
        plot_base64 = generate_visualization_plot(informal_statement, lean_codes)
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'plot_image': plot_base64,
                'success': True
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': str(e),
                'success': False
            })
        }
