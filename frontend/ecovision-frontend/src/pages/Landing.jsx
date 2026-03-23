import { useState } from "react";
import "../landing.css";
import { useNavigate } from "react-router-dom";

function Landing() {

  const navigate = useNavigate();

  const zones = {
    "North Zone": [
      "Delhi","Noida","Gurugram","Ghaziabad","Faridabad",
      "Chandigarh","Ludhiana","Amritsar","Jaipur",
      "Dehradun","Haridwar","Shimla","Jammu"
    ],

    "South Zone": [
      "Bengaluru","Chennai","Hyderabad","Coimbatore",
      "Madurai","Trichy","Salem",
      "Kochi","Trivandrum","Kozhikode",
      "Mysuru","Mangaluru","Tirupati","Vijayawada"
    ],

    "East Zone": [
      "Kolkata","Howrah","Durgapur","Asansol",
      "Patna","Gaya","Muzaffarpur",
      "Ranchi","Jamshedpur",
      "Bhubaneswar","Cuttack","Rourkela",
      "Guwahati","Silchar"
    ],

    "West Zone": [
      "Mumbai","Pune","Thane","Navi Mumbai",
      "Nagpur","Nashik","Aurangabad",
      "Ahmedabad","Surat","Vadodara","Rajkot",
      "Udaipur","Jodhpur","Ajmer","Panaji"
    ],

    "Central Zone": [
      "Bhopal","Indore","Ujjain","Gwalior","Jabalpur",
      "Raipur","Bilaspur","Durg",
      "Korba","Ambikapur"
    ]
  };

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const healthOptions = [
    "Normal",
    "Asthma",
    "COPD (lung problem)",
    "Allergy / Dust allergy",
    "Heart disease",
    "High BP",
    "Respiratory problem",
    "Pregnancy (sensitive group)"
  ];

  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [month, setMonth] = useState("");
  const [zone, setZone] = useState("");
  const [city, setCity] = useState("");
  const [health, setHealth] = useState("");

  const cities = zone ? zones[zone] : [];

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      name,
      ageGroup,
      month,
      zone,
      city,
      health
    };

    console.log("Form Data :", formData);

    // 👉 Dashboard page par data ke saath bhejna
    navigate("/dashboard", { state: formData });
  };

  return (
    <div className="landing-container">

      <div className="heading-box">
        <h1 className="heading-text">Welcome to EcoVision</h1>
      </div>

      <p className="normal-text">
        Smart environment monitoring dashboard
      </p>

      <form className="eco-form" onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Age group */}
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          required
        >
          <option value="">Select Age Group</option>
          <option value="Child (0 - 12)">Child (0 - 12 years)</option>
          <option value="Teen (13 - 19)">Teen (13 - 19 years)</option>
          <option value="Adult (20 - 59)">Adult (20 - 59 years)</option>
          <option value="Older (60+)">Older (60+ years)</option>
        </select>

        {/* Month */}
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
        >
          <option value="">Select Month</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Zone */}
        <select
          value={zone}
          onChange={(e) => {
            setZone(e.target.value);
            setCity("");
          }}
          required
        >
          <option value="">Select Zone</option>
          {Object.keys(zones).map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>

        {/* City */}
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={!zone}
          required
        >
          <option value="">
            {zone ? "Select City" : "Select zone first"}
          </option>

          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Health */}
        <select
          value={health}
          onChange={(e) => setHealth(e.target.value)}
        >
          <option value="">Health Category (optional)</option>
          {healthOptions.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <button type="submit">Submit</button>

      </form>

    </div>
  );
}

export default Landing;
