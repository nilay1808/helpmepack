import { Configuration, OpenAIApi } from 'openai';
import type { Weather } from './weather.server';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export namespace Ai {
  export async function summarizeWeatherForecast(
    forecast: Weather.ForecastForTripResponse,
  ): Promise<string | undefined> {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo-0613',
      messages: [
        {
          role: 'user',
          content: `
You are an AI assistant who is going to act as a travel agent for a user who wants to go on a trip to ${
            forecast.location.name
          }, ${forecast.location.region ?? forecast.location.country}.

Your current task is as follows
- look out for any odities in the forecast, such has sudden change in temperature, high winds, or high precipitation and point those out
- Look for unusual events like a heat wave or a cold snap and point those out
- Given the forecast, prepare a summary for the entire duration in the size of a tweet
- DO NOT PROVIDE A DAY BY DAY SUMMARY
- Use simpler words like rain or showers instead of precipitation
- Don't begin with "Weather forecast for your trip to"

Example Response: 
Mostly sunny skies with high temps ranging between 32.5-33.4°C and lows between 21-23.6°C. Humidity lingers around 70-80% with occasional light showers possible on one day. Enjoy your trip!

${weatherForecastToPrompt(forecast)}
        `,
        },
      ],
    });

    // console.log(response.data.choices);

    return response.data.choices.at(0)?.message?.content;
  }

  export async function getPackingSuggestions(
    location: string,
    from: string,
    to: string,
    forecastSummary: string = 'Unable to fetch weather forecast summary',
  ): Promise<string | undefined> {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo-0613',
      messages: [
        {
          role: 'user',
          content: `
You are an AI assistant who is gonna help a user pack for a trip to ${location} from ${from} until ${to}.
Your current task is as follows
- Under the weather forecast summary provided below.
- Provide a complete list of items the user should pack for the trip based on the weather and the duration of the trip.
- Your answer should be in the form of a list and each list item must be a clothing item followed by the quantity of that item.
- Limit the items to be clothing items, shoes, socks, underwear, and accessories.
- DO NOT BEGIN WITH "Based on the weather forecast for...", ONLY PROVIDE THE LIST 

Example Response:
- 2 pairs of shorts
- 5 pairs of t-shirts
- 1 pair of jeans
- 1 pair of sneakers
- 5 pairs of socks
- 5 pairs of underwear

Weather forecast summary:
${forecastSummary}
          `,
        },
      ],
    });

    return response.data.choices.at(0)?.message?.content;
  }
}

function weatherForecastToPrompt({ location, forecast }: Weather.ForecastForTripResponse) {
  return `
    Weather forecast for a trip to ${location.name}, ${location.region}, ${location.country}:
    \n
    ${forecast
      .map(({ date, stats }) => {
        return `
        - ${date}:
          - Max temperature: ${stats?.maxTemperatureInCelcius}°C
          - Min temperature: ${stats?.minTemperatureInCelcius}°C
          - Avg temperature: ${stats?.avgTemperatureInCelcius}°C
          - Max wind: ${stats?.maxWindInKph}kph
          - Avg humidity: ${stats?.avgHumidity}%
          - Total precipitation: ${stats?.totalPrecipitationInMm}mm
      `;
      })
      .join('\n')}
  `;
}
