from flask import Flask, request, jsonify
import requests
import joblib
import numpy as np
from pathlib import Path
import os
import warnings

from flask_cors import CORS

ENV_PATH = Path(__file__).resolve().parent / ".env"


def _load_local_env() -> None:
    """Best-effort load of Backend/.env (if python-dotenv is installed)."""
    try:
        from dotenv import load_dotenv  # type: ignore
    except Exception:
        return
    load_dotenv(str(ENV_PATH))

app = Flask(__name__)
CORS(app)

# Load environment variables from Backend/.env (optional)
_load_local_env()

warnings.filterwarnings(
    "ignore",
    message=r"X does not have valid feature names, but .* was fitted with feature names",
    category=UserWarning,
)

# Load trained model
MODEL_PATH = Path(__file__).resolve().parent / "model" / "aqi_model.pkl"
model = joblib.load(MODEL_PATH)

# -------- OpenWeather API KEY --------
# Set OPENWEATHER_API_KEY in your environment (or in Backend/.env).
# If missing/invalid, the backend falls back to safe default values.
def _get_api_key() -> str | None:
    _load_local_env()
    return os.getenv("OPENWEATHER_API_KEY")


@app.route("/")
def home():
    return "EcoVision Backend Running"


@app.route("/mock", methods=["POST"])
def mock_predict():
    """Return fake data for testing (no API key needed)."""
    return jsonify({
        "risk_level": "Moderate",
        "aqi": 3,
        "temperature": 25,
        "humidity": 65,
        "used_fallback": False
    })


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json(silent=True) or {}

    name = data.get("name")
    ageGroup = data.get("ageGroup")
    health = data.get("health")
    city = data.get("city")

    if not city:
        return jsonify({"error": "Missing required field: city"}), 400

    print("CITY RECEIVED:", city)

    used_fallback = False

    try:

        api_key = _get_api_key()
        if not api_key:
            raise ValueError("Missing OPENWEATHER_API_KEY")

        # -------- REAL WEATHER API CALL --------
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"

        response = requests.get(url, timeout=10)
        weather_data = response.json() if response.ok else {}

        print("WEATHER DATA:", weather_data)

        temperature = weather_data.get("main", {}).get("temp")
        humidity = weather_data.get("main", {}).get("humidity")

        lat = weather_data.get("coord", {}).get("lat")
        lon = weather_data.get("coord", {}).get("lon")

        if temperature is None or humidity is None or lat is None or lon is None:
            raise ValueError(f"Weather API did not return expected fields for city={city}")

        # -------- AQI API --------
        aqi_url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={api_key}"

        aqi_response = requests.get(aqi_url, timeout=10)
        aqi_data = aqi_response.json() if aqi_response.ok else {}

        print("AQI DATA:", aqi_data)

        aqi = aqi_data.get("list", [{}])[0].get("main", {}).get("aqi")
        if aqi is None:
            raise ValueError("AQI API did not return expected fields")

    except Exception as e:

        print("API ERROR:", e)

        # fallback values if API fails
        temperature = 30
        humidity = 60
        aqi = 2
        used_fallback = True


    # -------- Prediction input --------
    # Model is trained on: aqi, temperature, humidity
    features = np.array([[aqi, temperature, humidity]])

    prediction = model.predict(features)[0]

    risk_map = {
        0:"Low",
        1:"Moderate",
        2:"High"
    }

    risk_level = risk_map.get(prediction,"Moderate")


    return jsonify({
        "risk_level": risk_level,
        "aqi": aqi,
        "temperature": temperature,
        "humidity": humidity,
        "used_fallback": used_fallback
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)