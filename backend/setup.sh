#!/bin/bash

# Setup script for the visualization backend

echo "Setting up visualization backend..."

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

echo "Backend setup complete!"
echo "To start the backend server, run:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python app.py"
