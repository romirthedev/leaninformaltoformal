# Embedding Visualization Backend

This backend service generates embedding visualizations for Lean code formalizations.

## Features

- Generates embeddings for Lean code using sentence transformers
- Creates t-SNE visualizations with clustering analysis
- Shows 2-cluster and 4-cluster analysis
- Identifies cluster centers with representative examples

## Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the setup script:
   ```bash
   ./setup.sh
   ```

3. Activate the virtual environment:
   ```bash
   source venv/bin/activate
   ```

4. Start the server:
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /api/visualize
Generate an embedding visualization.

**Request Body:**
```json
{
  "informal_statement": "The sum of two even numbers is even",
  "lean_codes": [
    "theorem sum_even (a b : ℤ) (ha : Even a) (hb : Even b) : Even (a + b) := by sorry",
    "lemma even_sum (x y : ℕ) : Even x → Even y → Even (x + y) := by sorry"
  ]
}
```

**Response:**
```json
{
  "plot_image": "base64_encoded_image_data",
  "success": true
}
```

### GET /api/health
Health check endpoint.

## Dependencies

- Flask: Web framework
- matplotlib: Plotting library
- scikit-learn: Machine learning (clustering, t-SNE)
- sentence-transformers: Text embeddings
- adjustText: Text label positioning
- numpy: Numerical operations

## How it Works

1. **Embedding Generation**: Uses SentenceTransformers to convert Lean code into high-dimensional vectors
2. **Clustering**: Applies K-means clustering with 2 and 4 clusters
3. **Dimensionality Reduction**: Uses t-SNE to project embeddings to 2D space
4. **Visualization**: Creates scatter plots showing clusters and representative examples
5. **Export**: Returns the plot as a base64-encoded PNG image
