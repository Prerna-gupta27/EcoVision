 import "../landing.css";   // same theme reuse
import "./Dashboard.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {

  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state || {};

  const [apiResult, setApiResult] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const canCallApi = Boolean(data && data.city);

  useEffect(() => {
    let isMounted = true;

    async function runPrediction() {
      if (!canCallApi) return;

      setApiLoading(true);
      setApiError("");

      try {
        const res = await fetch("/api/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: data.name,
            ageGroup: data.ageGroup,
            health: data.health,
            city: data.city
          })
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          const message = payload?.error || `Backend error (${res.status})`;
          throw new Error(message);
        }

        if (isMounted) setApiResult(payload);
      } catch (e) {
        if (isMounted) setApiError(e?.message || "Failed to connect to backend");
      } finally {
        if (isMounted) setApiLoading(false);
      }
    }

    runPrediction();

    return () => {
      isMounted = false;
    };
  }, [canCallApi, data.name, data.ageGroup, data.health, data.city]);

  const cityMonthAQI = {
    Delhi: {
      January:  [130, 150, 110, 140],
      February: [120, 160, 90, 140]
    },
    Noida: {
      January:  [110, 145, 100, 130],
      February: [120, 160, 90, 140]
    },
    Mumbai: {
      January:  [95, 120, 100, 110],
      February: [100, 130, 105, 115]
    }
  };

  const selectedAQI =
    cityMonthAQI[data.city]?.[data.month] ||
    [120, 160, 90, 140];

  const avgAQI = Math.round(
    selectedAQI.reduce((a, b) => a + b, 0) / selectedAQI.length
  );

  let aqiLevel = "Good";
  if (avgAQI > 200) aqiLevel = "Very Poor";
  else if (avgAQI > 150) aqiLevel = "Poor";
  else if (avgAQI > 100) aqiLevel = "Moderate";

  function getPersonalisedAdvice(aqiLevel, ageGroup, health) {

    const tips = [];

    if (aqiLevel === "Good") {
      tips.push("You can safely do outdoor activities.");
    } else if (aqiLevel === "Moderate") {
      tips.push("Limit long outdoor exposure.");
      tips.push("Prefer morning or evening walks.");
    } else {
      tips.push("Avoid outdoor activities.");
      tips.push("Wear a mask when going outside.");
    }

    if (ageGroup?.includes("Child")) {
      tips.push("Children should avoid polluted areas.");
    }

    if (ageGroup?.includes("Older")) {
      tips.push("Senior citizens should avoid heavy outdoor activity.");
    }

    if (health?.toLowerCase().includes("allergy")) {
      tips.push("Keep anti-allergy medication handy.");
    }

    if (health?.toLowerCase().includes("bp")) {
      tips.push("Avoid stress and heavy outdoor physical activity.");
    }

    if (health?.toLowerCase().includes("asthma")) {
      tips.push("Always carry your inhaler when going outside.");
    }

    return tips;
  }

  const adviceList = getPersonalisedAdvice(
    aqiLevel,
    data.ageGroup || "",
    data.health || ""
  );

  const chartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "AQI",
        data: selectedAQI,
        backgroundColor: "#f06292"
      },
      {
        label: "Temperature (°C)",
        data: [22, 25, 24, 26],
        backgroundColor: "#7e57c2"
      },
      {
        label: "Humidity (%)",
        data: [60, 68, 72, 65],
        backgroundColor: "#4fc3f7"
      },
      {
        label: "Weather Index",
        data: [2, 3, 1, 2],
        backgroundColor: "#81c784"
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top"
      }
    }
  };

  return (
    <div className="dashboard-container">

      <div className="heading-box">
        <h1 className="heading-text">
          Your Eco Health Dashboard 🌍💗
        </h1>
      </div>

      <div className="dash-grid">

        <div className="dash-box">
          <div className="card-title">
            <span className="title-icon">🌫️</span>
            <span>AQI Range</span>
          </div>

          <ul className="dark-pink-text">
            <li><b>Average AQI :</b> {avgAQI}</li>
            <li><b>Air quality level :</b> {aqiLevel}</li>
            <li>
              <b>Health risk indicator :</b>{" "}
              {apiLoading
                ? "Calculating…"
                : apiResult?.risk_level
                  ? apiResult.risk_level
                  : "Based on AQI & profile"}
            </li>
          </ul>

          {apiError ? (
            <p className="dark-pink-text" style={{ marginTop: "10px" }}>
              <b>Backend:</b> {apiError}
            </p>
          ) : null}
        </div>

        <div className="dash-box">
          <div className="card-title">
            <span className="title-icon">👤</span>
            <span>User Details</span>
          </div>

          <ul className="dark-pink-text">
            <li><b>Name:</b> {data.name}</li>
            <li><b>Age Group:</b> {data.ageGroup}</li>
            <li><b>Month:</b> {data.month}</li>
            <li><b>Zone:</b> {data.zone}</li>
            <li><b>City:</b> {data.city}</li>
            <li><b>Health Category:</b> {data.health || "Not selected"}</li>
          </ul>
        </div>

        <div className="dash-box">
          <div className="card-title">
            <span className="title-icon">🌦️</span>
            <span>Climate Info</span>
          </div>

          <ul className="dark-pink-text">
            <li>
              <b>Temperature :</b>{" "}
              {apiLoading
                ? "Loading…"
                : apiResult?.temperature != null
                  ? `${apiResult.temperature} °C`
                  : "—"}
            </li>
            <li>
              <b>Humidity :</b>{" "}
              {apiLoading
                ? "Loading…"
                : apiResult?.humidity != null
                  ? `${apiResult.humidity} %`
                  : "—"}
            </li>
            <li>
              <b>AQI (OpenWeather scale 1–5) :</b>{" "}
              {apiLoading
                ? "Loading…"
                : apiResult?.aqi != null
                  ? apiResult.aqi
                  : "—"}
            </li>
            <li>
              <b>Source :</b> OpenWeather APIs (fallback if unavailable)
            </li>
            <li>
              <b>Status :</b>{" "}
              {apiLoading
                ? "Checking…"
                : apiResult
                  ? apiResult.used_fallback
                    ? "Fallback values used"
                    : "Live weather data"
                  : "—"}
            </li>
          </ul>
        </div>

        <div className="dash-box">
          <div className="card-title">
            <span className="title-icon">💡</span>
            <span>Personalised Advice</span>
          </div>

          <p className="hello-line dark-pink-text">
            Hello {data.name} 😊 We truly care about your health and the planet.
          </p>

          <ul className="dark-pink-text">
            {adviceList.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>

      </div>

      <div className="dash-box chart-box">

        <div className="card-title">
          <span className="title-icon">📊</span>
          <span>Air Quality & Climate Trends</span>
        </div>

        <div style={{ height: "300px", marginTop: "15px" }}>
          <Bar data={chartData} options={chartOptions} />
        </div>

      </div>

      {/* ✅ Report page navigation (send all important data) */}
      <div style={{ marginTop: "25px" }}>
        <button
          onClick={() =>
            navigate("/report", {
              state: {
                ...data,
                selectedAQI,
                avgAQI,
                aqiLevel,
                ...(apiResult || {})
              }
            })
          }
          style={{
            background: "#f06292",
            color: "white",
            border: "none",
            padding: "12px 22px",
            borderRadius: "18px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          View Monthly Report 📄
        </button>
      </div>

    </div>
  );
}

export default Dashboard;
