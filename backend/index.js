const express = require("express");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());
const SUPABASE_URL = "https://bsfnlqrserdkrcdjqrlc.supabase.co/rest/v1/complaints";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZm5scXJzZXJka3JjZGpxcmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNDg5MTMsImV4cCI6MjA4OTcyNDkxM30.HvvmFOq3MVvnUmMcSW6-cG6Uyb0m4oPK_Pzvc8ykues";


// 🚀 AI + SAVE API
app.post("/submit", async (req, res) => {

  const { title, description, location, name, phone } = req.body;

  // 🔥 SIMPLE AI LOGIC
  let category = "General";
  let priority = "Medium";
  let est_time = "24 hrs";

  if(description.toLowerCase().includes("garbage")){
    category = "Sanitation";
    priority = "High";
    est_time = "12 hrs";
  }

  if(description.toLowerCase().includes("road")){
    category = "Road Damage";
    priority = "High";
    est_time = "48 hrs";
  }

  // 📦 DATA TO SAVE
  const data = {
    title,
    description,
    location,
    name,
    phone,
    category,
    priority,
    status: "pending"
  };

  try {
    const response = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("DB Response:", result);

    // 🔥 SEND BACK AI RESULT
    res.json({
      category,
      priority,
      est_time
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }

});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));