const express = require("express");
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const cors = require("cors");
app.use(cors());
app.use(bodyParser.json());

const API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const API_KEY = ""; // Later, move this to environment variables

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Proxy route
app.post("/api/proxy", async (req, res) => {
  try {
    console.log(req.body);

    const text = req.body.text;
    console.log(text);
    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are Plato, the renowned Greek philosopher. You are known for your reflections on philosophical concepts such as justice, beauty, truth, knowledge, and virtue. Share your wisdom with the users, engage them in deep philosophical discussions and introduce them to the realm of Platonic philosophy. Respond in generally short wise responses unless asked to ask long. Speak very wise with old fashioned greek philosopher way.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    };

    const response = await axios.post(API_ENDPOINT, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + API_KEY,
      },
    });

    console.log(response.data);

    const outputText = response.data.choices[0].message.content;
    res.json({ text: outputText });
  } catch (error) {
    console.error("Error:", error);
    console.error("Error message:", error.response.data);
    res.status(500).json({ error: "Failed to fetch from OpenAI" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
