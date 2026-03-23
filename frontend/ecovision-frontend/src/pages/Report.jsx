import "../landing.css";
import "./Dashboard.css";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";

function Report() {

  const location = useLocation();
  const data = location.state || {};

  /* ---------- Dummy monthly AQI data (city + month) ---------- */

  const cityMonthAQI = {
    Delhi: {
      January: [140, 160, 150, 155, 148, 152],
      February: [120, 135, 130, 128, 140, 138]
    },
    Noida: {
      January: [120, 132, 128, 135, 130, 138],
      February: [118, 125, 130, 120, 135, 128]
    },
    Mumbai: {
      January: [95, 100, 105, 110, 98, 102],
      February: [100, 105, 110, 108, 112, 107]
    }
  };

  const monthAQI =
    cityMonthAQI[data.city]?.[data.month] ||
    [120, 130, 128, 135, 132, 138];

  const avgAQI = Math.round(
    monthAQI.reduce((a, b) => a + b, 0) / monthAQI.length
  );

  let aqiLevel = "Good";
  if (avgAQI > 200) aqiLevel = "Very Poor";
  else if (avgAQI > 150) aqiLevel = "Poor";
  else if (avgAQI > 100) aqiLevel = "Moderate";

  const mostPollutedDays = "8 – 10 " + (data.month || "");

  /* ---------- climate pattern (demo) ---------- */

  const avgTemp = data.temperature ?? 26;
  const avgHumidity = data.humidity ?? 72;
  const wind = "Low";

  let riskLevel = "Low";
  if (aqiLevel === "Poor" || aqiLevel === "Very Poor") riskLevel = "High";
  else if (aqiLevel === "Moderate") riskLevel = "Medium";

  if (data.risk_level) riskLevel = data.risk_level;

  /* ---------- REALISTIC medical style advice ---------- */

  function getMonthlyAdvice(aqiLevel, ageGroup, health, temp, humidity) {

    const tips = [];

    const ag = ageGroup?.toLowerCase() || "";
    const h = health?.toLowerCase() || "";

    const isChild = ag.includes("child");
    const isSenior = ag.includes("older");
    const hasBP = h.includes("bp");
    const hasAllergy = h.includes("allergy");
    const hasAsthma = h.includes("asthma");
    const hasRespiratory = h.includes("respiratory");

    /* AQI based */

    if (aqiLevel === "Good") {
      tips.push(
        "Air quality remained acceptable for most days of the month. Normal outdoor activities are generally safe."
      );
    }

    if (aqiLevel === "Moderate") {
      tips.push(
        "Reduce prolonged outdoor exposure, especially near traffic-heavy roads and junctions."
      );
    }

    if (aqiLevel === "Poor" || aqiLevel === "Very Poor") {
      tips.push(
        "Avoid outdoor activities during high pollution days whenever possible."
      );
      tips.push(
        "Use a well-fitting mask (N95/KN95 type) when stepping outside."
      );
    }

    /* Age based */

    if (isChild) {
      tips.push(
        "Children should avoid outdoor play during high pollution hours because developing lungs are more sensitive."
      );
    }

    if (isSenior) {
      tips.push(
        "Older adults should avoid strenuous outdoor activity and stay indoors on poor air-quality days."
      );
    }

    /* Health based */

    if (hasAsthma || hasRespiratory) {
      tips.push(
        "People with asthma or respiratory problems should strictly avoid polluted areas and keep prescribed inhalers or medicines easily accessible."
      );
    }

    if (hasAllergy) {
      tips.push(
        "High pollution and humidity may worsen allergy symptoms. Continue regular allergy medication as advised by your doctor."
      );
    }

    if (hasBP) {
      tips.push(
        "Limit heavy physical exertion outdoors and minimise stress, as polluted air can increase cardiovascular strain."
      );
    }

    /* Climate based */

    if (humidity > 65) {
      tips.push(
        "High humidity combined with pollution can worsen breathing discomfort. Prefer indoor, well-ventilated environments."
      );
    }

    if (temp >= 30) {
      tips.push(
        "Higher temperatures together with pollution increase dehydration and fatigue. Maintain good hydration throughout the day."
      );
    }

    /* General medical guidance */

    tips.push(
      "Check daily AQI before planning outdoor travel, exercise or school activities."
    );

    tips.push(
      "If you experience breathlessness, chest discomfort or persistent cough, seek medical advice from a healthcare professional."
    );

    return tips;
  }

  const adviceList = getMonthlyAdvice(
    aqiLevel,
    data.ageGroup || "",
    data.health || "",
    avgTemp,
    avgHumidity
  );

  function handleDownload() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const maxWidth = pageWidth - margin * 2;

    const title = "EcoVision Monthly Report";
    const subtitle = `${data.name || "User"} • ${data.city || ""} • ${data.month || ""}`;
    const fileName = `EcoVision_Report_${(data.name || "User").replace(/\s+/g, "_")}_${(data.month || "Month").replace(/\s+/g, "_")}.pdf`;

    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(title, margin, y);
    y += 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(subtitle, margin, y);
    y += 18;

    doc.setDrawColor(220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 18;

    const lines = [
      `Name: ${data.name || "—"}`,
      `Age Group: ${data.ageGroup || "—"}`,
      `Health: ${data.health || "Not selected"}`,
      `Zone: ${data.zone || "—"}`,
      `City: ${data.city || "—"}`,
      `Month: ${data.month || "—"}`,
      `Average AQI (demo monthly series): ${avgAQI} (${aqiLevel})`,
      `Temperature: ${avgTemp} °C`,
      `Humidity: ${avgHumidity} %`,
      `Overall health risk level: ${riskLevel}`
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Summary", margin, y);
    y += 14;

    doc.setFontSize(10.5);
    for (const line of lines) {
      const wrapped = doc.splitTextToSize(line, maxWidth);
      for (const w of wrapped) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(w, margin, y);
        y += 14;
      }
    }

    y += 10;
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Key Health Advice", margin, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    adviceList.forEach((tip, idx) => {
      const bulletLine = `${idx + 1}. ${tip}`;
      const wrapped = doc.splitTextToSize(bulletLine, maxWidth);
      wrapped.forEach((w) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(w, margin, y);
        y += 14;
      });
      y += 4;
    });

    y += 8;
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(9.5);
    doc.setTextColor(80);
    doc.text(
      "Note: This report is based on public air-quality guidance and available data. It is not medical advice.",
      margin,
      y,
      { maxWidth }
    );

    doc.save(fileName);
  }

  return (
    <div className="dashboard-container">

      {/* TOP */}
      <div className="heading-box">
        <h1 className="heading-text">
          Your Monthly Eco Report 📄💗
        </h1>
      </div>

      <div className="dash-grid">

        {/* Combined profile + region box */}
        <div className="dash-box">

          <div className="card-title">
            <span className="title-icon">👤</span>
            <span>User & Region Profile</span>
          </div>

          <ul className="dark-pink-text">
            <li><b>Name :</b> {data.name}</li>
            <li><b>Age Group :</b> {data.ageGroup}</li>
            <li><b>Health :</b> {data.health || "Not selected"}</li>
            <li><b>Zone :</b> {data.zone}</li>
            <li><b>City :</b> {data.city}</li>
            <li><b>Month :</b> {data.month}</li>
          </ul>
        </div>

        {/* Monthly AQI & climate summary */}
        <div className="dash-box">

          <div className="card-title">
            <span className="title-icon">📊</span>
            <span>Monthly AQI & Climate Summary</span>
          </div>

          <ul className="dark-pink-text">
            <li><b>Average AQI :</b> {avgAQI} ({aqiLevel})</li>
            {data.aqi != null ? (
              <li><b>Live AQI index (OpenWeather 1–5) :</b> {data.aqi}</li>
            ) : null}
            <li><b>Most polluted days :</b> {mostPollutedDays}</li>
            <li>
              <b>Climate pattern :</b> High humidity ({avgHumidity}%), temperature
              around {avgTemp}°C and {wind} wind conditions
            </li>
            <li><b>Overall health risk level :</b> {riskLevel}</li>
          </ul>
        </div>

        {/* Enhanced medical advice – full width + flower bullets */}
        <div className="dash-box advice-wide">

          <div className="card-title">
            <span className="title-icon">💡</span>
            <span>Key Health Advice</span>
          </div>

          <p className="hello-line dark-pink-text">
            Hello {data.name} 😊 Here is your personalised guidance for this month.
          </p>

          <ul className="dark-pink-text advice-list">
            {adviceList.map((tip, index) => (
              <li key={index}>
                <span className="flower">🌸</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          <p className="dark-pink-text advice-note">
            Based on public health air-quality guidelines. Not a substitute for medical consultation.
          </p>

        </div>

      </div>

      {/* Download */}
      <div className="dash-box chart-box">

        <div className="card-title">
          <span className="title-icon">⬇️</span>
          <span>Download Your Report</span>
        </div>

        <p className="dark-pink-text">
          Click below to download your report as a PDF.
        </p>

        <button
          style={{
            background: "#f06292",
            color: "white",
            border: "none",
            padding: "12px 22px",
            borderRadius: "18px",
            cursor: "pointer",
            fontWeight: "600"
          }}
          onClick={handleDownload}
        >
          Download Report 📄
        </button>

      </div>

    </div>
  );
}

export default Report;
