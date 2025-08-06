# Lean - Informal to Formal Converter

Transform your informal mathematical statements into formal Lean 4 proofs with the power of AI, complete with embedding visualizations.

## Features

- **AI-Powered Conversion**: Convert informal mathematical statements to formal Lean 4 proofs using Google Gemini AI
- **Copy to Clipboard**: Easily copy generated proofs with one click
- **Embedding Visualizations**: Generate visual representations of how different formalizations relate in semantic space
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Clean Interface**: Modern, intuitive UI built with React and shadcn/ui

## Getting Started

### Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:8080](http://localhost:8080) in your browser

### Backend (for visualizations)

1. Set up the Python backend:
   ```bash
   cd backend
   ./setup.sh
   ```

2. Start the backend server:
   ```bash
   source venv/bin/activate
   python app.py
   ```

The backend will run on [http://localhost:5000](http://localhost:5000)

## Usage

1. **Basic Conversion**:
   - Enter an informal mathematical statement (e.g., "The sum of two even numbers is even")
   - Click "Convert to Lean Proof" 
   - Copy the generated formal proof using the copy button

2. **Embedding Visualizations**:
   - After generating a proof, click "Generate Embedding Plot"
   - View clustering analysis showing how different formalizations relate
   - Explore 2-cluster and 4-cluster visualizations

## Architecture

- **Frontend**: React + TypeScript + Vite + shadcn/ui
- **Backend**: Python Flask API with ML libraries
- **AI Integration**: Google Gemini API for proof generation
- **Visualization**: matplotlib + scikit-learn + sentence-transformers

## Project info

**URL**: https://lovable.dev/projects/78e48332-5f11-4b5b-9a2d-be4ac7bd909a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/78e48332-5f11-4b5b-9a2d-be4ac7bd909a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/78e48332-5f11-4b5b-9a2d-be4ac7bd909a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
