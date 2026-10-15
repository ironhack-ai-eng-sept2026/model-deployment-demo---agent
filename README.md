# AI Travel Advisor

A simple chatbot that helps users plan personalized trips using the OpenAI API.

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

<br><hr><br>


## Run the command-line app

```bash
python -m app.main
```

Enter your travel requirements in the terminal and answer
the assistant's follow-up questions.

Type `exit` or `quit` to end the conversation.

<br><hr><br>


## Run the API

From the repository root:

```bash
uvicorn app.api:app --reload
```

The API is available at `http://127.0.0.1:8000`. Open
`http://127.0.0.1:8000/docs` for interactive API documentation.

<br>

### Health check

`GET http://127.0.0.1:8000/health`

No request body.

<br>

### Chat

Start a conversation:

`POST http://127.0.0.1:8000/chat`

Request body:

```json
{
  "message": "Plan a three-day food trip to Lisbon"
}
```

<br>

The response contains both the advisor's answer and a `response_id`:

```json
{
  "answer": "What dates are you considering?",
  "response_id": "resp_..."
}
```

<br>

To continue the same conversation, include that ID in the next request:

`POST http://127.0.0.1:8000/chat`

Request body:

```json
{
  "message": "I am travelling in May",
  "previous_response_id": "resp_..."
}
```

Conversation state is client-managed, so API instances do not store
sessions in memory.




