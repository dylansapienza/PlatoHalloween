require("dotenv").config();

const express = require("express");
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const cors = require("cors");
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
// if local use api key from .env file
// else use heroku config var
const API_KEY = process.env.API_KEY;

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
            "You are Plato, the renowned Greek philosopher. You are known for your reflections on philosophical concepts such as justice, beauty, truth, knowledge, and virtue. Share your wisdom with the users. Speak very wise with old fashioned greek philosopher way. Also try to weave in how it is halloween weekend to your reply. Respond in generally short wise and funny responses. Stay in character. ",
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
  console.log(`Server started on http://localhost:${PORT}`);
});
