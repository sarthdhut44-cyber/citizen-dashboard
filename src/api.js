/**
 * API fetching functions for the Citizen Information Dashboard
 */

export const fetchWeather = async () => {
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true');
    const data = await response.json();
    return {
      temp: data.current_weather.temperature,
      wind: data.current_weather.windspeed,
      condition: data.current_weather.weathercode, // Will map this to text later
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};

export const fetchCurrency = async () => {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    return {
      rates: {
        EUR: data.rates.EUR,
        GBP: data.rates.GBP,
        INR: data.rates.INR,
        JPY: data.rates.JPY,
      },
      base: 'USD',
    };
  } catch (error) {
    console.error('Error fetching currency:', error);
    return null;
  }
};

export const fetchCitizen = async () => {
  try {
    const response = await fetch('https://randomuser.me/api/');
    const data = await response.json();
    const user = data.results[0];
    return {
      name: `${user.name.first} ${user.name.last}`,
      email: user.email,
      location: `${user.location.city}, ${user.location.country}`,
      picture: user.picture.large,
    };
  } catch (error) {
    console.error('Error fetching citizen:', error);
    return null;
  }
};

export const fetchFact = async () => {
  try {
    const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random');
    const data = await response.json();
    return {
      text: data.text,
    };
  } catch (error) {
    console.error('Error fetching fact:', error);
    return null;
  }
};

export const sendMessageToAI = async (message, context) => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, context }),
    });

    if (!response.ok) {
      console.warn("Serverless function failed. Falling back to mock response.");
      return getMockResponse(message, context);
    }

    const result = await response.json();
    
    if (result.choices && result.choices[0]?.message?.content) {
      return result.choices[0].message.content.trim();
    } else if (result.error) {
      console.error("AI Error:", result.error);
      return getMockResponse(message, context);
    }
    return getMockResponse(message, context);
  } catch (error) {
    console.error('Error calling serverless AI:', error);
    return getMockResponse(message, context);
  }
};

/**
 * Mock response fallback when API is down or token is invalid.
 */
const getMockResponse = (message, context) => {
  const msg = message.toLowerCase();
  if (msg.includes('weather')) {
    return `The current weather in Neo-City is ${context.weather?.temp}°C with wind speeds of ${context.weather?.wind} km/h.`;
  }
  if (msg.includes('currency') || msg.includes('rupee') || msg.includes('dollar')) {
    return `Currently, 1 USD is approximately ${context.currency?.rates?.INR} INR and ${context.currency?.rates?.EUR} EUR.`;
  }
  if (msg.includes('citizen') || msg.includes('who is')) {
    return `Our featured citizen today is ${context.citizen?.name} from ${context.citizen?.location}.`;
  }
  if (msg.includes('fact')) {
    return `Here is a city fact for you: ${context.fact?.text}`;
  }
  return "I'm currently in offline mode because the AI provider is experiencing issues. However, I can still help with dashboard data! Ask me about the weather, currency, or today's featured citizen.";
};
