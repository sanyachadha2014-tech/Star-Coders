const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ YOUR SUPABASE
const SUPABASE_URL = "https://bsfnlqrserdkrcdjqrlc.supabase.co/rest/v1/complaints";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZm5scXJzZXJka3JjZGpxcmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNDg5MTMsImV4cCI6MjA4OTcyNDkxM30.HvvmFOq3MVvnUmMcSW6-cG6Uyb0m4oPK_Pzvc8ykues";

// TEST
app.get("/", (req,res)=> res.send("Server OK"));


// ================== SUBMIT ==================
app.post("/submit", async (req,res)=>{

  const { title, description, location, name, phone, image } = req.body;

  if(!title || !description || !location){
    return res.json({ success:false });
  }

  let category="General", priority="Medium", est_time="2-3 days";
  let ai_label="Unknown", confidence=0;

  // 🤖 AI CALL
  if(image){
    try{
      const aiRes = await fetch("http://localhost:5000/predict",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ image })
      });

      const ai = await aiRes.json();

      ai_label = ai.label;
      confidence = ai.confidence;

      if(ai.label==="garbage"){
        category="Garbage";
        priority="High";
        est_time="1 day";
      }

    }catch(e){
      console.log("AI error", e);
    }
  }

  // 💾 SAVE TO SUPABASE
  try{
    await fetch(SUPABASE_URL,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        title,
        description,
        location,
        name,
        phone,
        category,
        priority,
        est_time,
        status:"pending",
        ai_label,
        confidence,
        created_at: new Date()
      })
    });
  }catch(e){
    console.log("DB error", e);
  }

  res.json({
    success:true,
    category,
    priority,
    est_time,
    ai_label,
    confidence
  });

});


// ================== GET FOR DASHBOARD ==================
app.get("/complaints", async (req, res) => {
  try {
    const response = await fetch(SUPABASE_URL + "?select=*", {
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.log(err);
    res.json([]);
  }
});


// START
app.listen(3000, ()=> console.log("Server running on http://localhost:3000"));