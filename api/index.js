require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
//TEST
// 🔥 Firebase Connection
admin.initializeApp({
    credential: admin.credential.cert({
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      project_id: process.env.FIREBASE_PROJECT_ID
    }),
  });

const db = admin.firestore();

// 🚀 Express Configuration
const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🌍 Root Route to Verify API Status
app.get("/", (req, res) => {
  res.send("API Successfully Connected 🚀");
});

// 📊 Add a Metric (POST)
app.post("/add-metric", async (req, res) => {
  try {
    const { name, values } = req.body;
    if (!name || !values) {
      return res.status(400).json({ error: "Missing data" });
    }

    await db.collection("metrics").doc(name).set({
      ...values,
      date: new Date().toISOString(),
    });

    res.status(200).json({ message: "Metric successfully saved" });
  } catch (error) {
    console.error("Error saving metric:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📈 Get All Metrics (GET)
app.get("/get-metrics", async (req, res) => {
  try {
    const snapshot = await db.collection("metrics").get();
    let metrics = {};
    snapshot.forEach((doc) => {
      metrics[doc.id] = doc.data();
    });

    res.status(200).json(metrics);
  } catch (error) {
    console.error("Error retrieving metrics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📝 Update an Existing Metric (PUT)
app.put("/update-metric/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const { values } = req.body;

    if (!values) {
      return res.status(400).json({ error: "Missing values for update" });
    }

    const metricRef = db.collection("metrics").doc(name);
    const doc = await metricRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Metric not found" });
    }

    await metricRef.update(values);

    res.status(200).json({ message: "Metric successfully updated" });
  } catch (error) {
    console.error("Error updating metric:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ❌ Delete a Metric (DELETE)
app.delete("/delete-metric/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const metricRef = db.collection("metrics").doc(name);
    const doc = await metricRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Metric not found" });
    }

    await metricRef.delete();

    res.status(200).json({ message: "Metric successfully deleted" });
  } catch (error) {
    console.error("Error deleting metric:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🚀 Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});