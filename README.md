# EcoVision
python3 app.py
## Prerequisites
- Node.js 18+

## Clone

```bash
git clone <your-repo-url>
cd eco-main
```

## Run backend (Flask)

```bash
cd Backend

# create + activate a virtualenv (first time)
python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

# Configure OpenWeather API key (recommended)
# Option A: set an environment variable
export OPENWEATHER_API_KEY="<your_openweather_key>"

# Option B: use Backend/.env
# cp .env.example .env

python3 app.py
```

Backend runs on `http://127.0.0.1:5000/`.

## Run frontend (Vite)

```bash
cd frontend/ecovision-frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173/`.

## Frontend ↔ Backend connection

During development, the frontend uses a Vite proxy so API calls go to:

- Frontend calls: `POST /api/predict`
- Vite rewrites/proxies to backend: `POST http://127.0.0.1:5000/predict`

If the OpenWeather APIs fail or the key is missing, the backend falls back to safe default values.