import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import model from "./langchainSetup.js";
import { ToolMessage, HumanMessage } from "@langchain/core/messages";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint dat AI-antwoord genereert op gebruikersvragen
app.post("/api/ask", async (req, res) => {
  const { message } = req.body;
  console.log("Incoming message:", message);

  try {
    // Prompt die GPT instructies geeft om kort en duidelijk kledingadvies te geven
    const prompt = `
You are a weather-based assistant.

When the user asks a question like:
- "Can I wear shorts in Amsterdam?"
- "Moet ik een jas aan in Rotterdam?"

Your job:

1. Extract the city from the question.
2. Use the getWeather tool with that city.
3. Based on the temperature and weather, give a short, decisive answer to the user's question:
   - Say if it's a good idea or not.
   - Mention the temperature and condition briefly.
   - Be clear and confident.
4. Write your answer in the same language the user used (Dutch or English).
5. Keep it to 1 or 2 sentences max.
6. Do NOT give full outfits, accessories, or shoe suggestions.

Examples:

Dutch:
Vraag: "Kan ik een korte broek aan in Amsterdam?"
Antwoord: "Het is in Amsterdam 14 graden en bewolkt, dus ik zou geen korte broek aanraden."

English:
Question: "Should I wear a jacket in Rotterdam?"
Answer: "It's 11°C and windy in Rotterdam, so yes, a jacket is a good idea."

Now answer the following:
"${message}"
`;

    // Eerste AI-call: antwoord op basis van prompt
    const firstResponse = await model.invoke(prompt);
    console.log("First GPT response:", firstResponse);

    // Als de AI een tool wil gebruiken (bijv. weer ophalen)
    if (firstResponse.tool_calls?.length > 0) {
      const toolCall = firstResponse.tool_calls[0];
      const args = toolCall.args;

      console.log("GPT tool-call:", toolCall.name, args);

      // Controleer of locatie is meegegeven
      if (!args.location) {
        return res.json({ reply: "I need a location to check the weather. Please include a city name." });
      }

      // Importeer de tool en haal weerdata op
      const { weatherTool } = await import("./tools/weatherTool.js");
      const toolResult = await weatherTool.func(args);
      console.log("Tool result:", toolResult);

      // Tweede AI-call met het resultaat van de weerdata
      const finalResponse = await model.invoke([
        firstResponse,
        new ToolMessage({
          tool_call_id: toolCall.id,
          content: toolResult,
        }),
        new HumanMessage({
          content: `Based on that weather information, give a clear clothing suggestion.`,
        }),
      ]);

      console.log("Final GPT response:", finalResponse.content);
      return res.json({ reply: finalResponse.content });
    }

    // Als geen tool is gebruikt, stuur direct het eerste AI-antwoord terug
    return res.json({ reply: firstResponse.content || "I wasn't able to generate an answer." });

  } catch (err) {
    console.error("Error in ask flow:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Start de server op poort 3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
