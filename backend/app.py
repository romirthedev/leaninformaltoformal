"""Flask API for generating embedding visualizations."""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from visualize_embeddings import generate_visualization_plot

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route('/api/visualize', methods=['POST'])
def visualize_embeddings():
    """Generate embedding visualization for given informal statement and Lean codes."""
    try:
        data = request.json
        informal_statement = data.get('informal_statement', '')
        lean_codes = data.get('lean_codes', [])
        
        if not informal_statement or not lean_codes:
            return jsonify({
                'error': 'Missing informal_statement or lean_codes'
            }), 400
        
        # Generate the visualization
        plot_base64 = generate_visualization_plot(informal_statement, lean_codes)
        
        return jsonify({
            'plot_image': plot_base64,
            'success': True
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
