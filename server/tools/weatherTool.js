import fetch from "node-fetch";
import { tool } from "@langchain/core/tools";

// Asynchrone functie die weerdata ophaalt voor een gegeven locatie
const getWeather = async ({ location }) => {
  console.log("[weatherTool] Invoked for:", location);

  const apiKey = process.env.WEATHER_API_KEY;

  // Verzoek naar WeatherAPI
  const res = await fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`);
  const data = await res.json();

  // Controleer of data geldig is
  if (!data || !data.current || !data.location) {
    console.error("[weatherTool] Invalid API response");
    return `Sorry, I couldn't get the weather for "${location}".`;
  }

  // Maak korte weeroverzicht-tekst
  const result = `It is currently ${data.current.temp_c}°C with ${data.current.condition.text.toLowerCase()} in ${data.location.name}.`;
  console.log("[weatherTool] Result sent back:", result);
  return result;
};

// Exporteer tool met metadata voor GPT
export const weatherTool = tool(getWeather, {
  name: "getWeather",
  description: `Use this tool to get the current weather of a location.

Always call this tool when the user asks:
- about the weather
- what to wear
- temperature
- conditions outside

You MUST pass an object with a 'location' string property. The location should be the city or place name mentioned in the user's message.`,
  schema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "City or place name, like Amsterdam, Rotterdam, or Zoetermeer",
      },
    },
    required: ["location"],
  },
});
