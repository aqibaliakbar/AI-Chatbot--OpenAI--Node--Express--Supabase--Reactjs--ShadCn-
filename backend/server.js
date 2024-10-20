import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

import { PDFExtract } from "pdf.js-extract";
const pdfExtract = new PDFExtract();

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const upload = multer();

app.post("/api/chat", async (req, res) => {
  console.log("Received chat request:", req.body);
  const { messages } = req.body;
  if (!OPENAI_API_KEY) {
    console.error("OpenAI API key is missing");
    return res.status(500).json({ error: "Server configuration error" });
  }
  try {
    console.log("Sending request to OpenAI API");
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages,
        stream: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        responseType: "stream",
      }
    );
    console.log("Received response from OpenAI API");
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    let buffer = "";
    response.data.on("data", (chunk) => {
      buffer += chunk.toString();
      let lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (line.trim() === "") continue;
        if (line.trim() === "data: [DONE]") {
          res.write("data: [DONE]\n\n");
          return;
        }
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices[0].delta.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (error) {
            console.error("Error parsing SSE message:", error);
          }
        }
      }
    });

    response.data.on("end", () => {
      console.log("OpenAI API stream ended");
      res.end();
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(error.response?.status || 500).json({
      error: "An error occurred while processing your request",
      details: error.message,
    });
  }
});

app.post("/api/process-file", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  let fileContent;

  try {
    if (req.file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(req.file.buffer);
      fileContent = pdfData.text;
    } else {
      fileContent = req.file.buffer.toString("utf-8");
    }

    // Log the file content for debugging
    console.log("File content:", fileContent);

    if (!fileContent || fileContent.trim() === "") {
      throw new Error("File content is empty or unreadable");
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Analyze and summarize the following document:",
          },
          { role: "user", content: fileContent },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const summary = response.data.choices[0].message.content;
    res.json({ summary });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({
      error: "Error processing file",
      details: error.message,
      fileContent: fileContent
        ? fileContent.substring(0, 100) + "..."
        : "No content",
    });
  }
});

app.post("/api/generate-session-name", async (req, res) => {
  console.log("Received request to generate session name");
  const { message } = req.body;
  console.log("Message for name generation:", message);
  if (!OPENAI_API_KEY) {
    console.error("OpenAI API key is missing");
    return res.status(500).json({ error: "Server configuration error" });
  }
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Generate a brief, descriptive title (max 6 words) for this conversation based on the following message:",
          },
          { role: "user", content: message },
        ],
        max_tokens: 20,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    const generatedName = response.data.choices[0].message.content.trim();
    console.log("Generated name:", generatedName);
    res.json({ name: generatedName });
  } catch (error) {
    console.error("Error generating session name:", error);
    res.status(500).json({ error: "Error generating session name" });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
