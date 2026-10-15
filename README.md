# AI Travel Advisor

A simple command-line chatbot that helps users plan personalized trips
using the OpenAI API.

## Requirements

- Python 3.10+
- An OpenAI API key


## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-travel-advisor
```

### 2. Create a virtual environment

macOS / Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Windows:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Copy `.env.example` to `.env`.

macOS / Linux:

```bash
cp .env.example .env
```

Windows:

```powershell
Copy-Item .env.example .env
```

Add your OpenAI API key to `.env`.

Never commit your `.env` file to Git.

### 5. Run the application

From the repository root:

```bash
python -m app.main
```

## Usage

Enter your travel requirements in the terminal and answer
the assistant's follow-up questions.

Type `exit` or `quit` to end the conversation.

