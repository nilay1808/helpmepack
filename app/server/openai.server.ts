import { Configuration, OpenAIApi } from 'openai';
import type { Weather } from './weather.server';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export namespace Ai {
  export async function summarizeWeatherForecast(forecast: Weather.ForecastForTripResponse) {
    //   return `
    //   You are an AI assisntant who is going to act as a travel agent for a user who wants to go on a trip to ${
    //     forecast.location.name
    //   }, ${forecast.location.region}, ${forecast.location.country}.
    //   Your current task is to summarize the following weather forecast for the user as a tweet with emojis:
    //   ${weatherForecastToPrompt(forecast)}
    // `;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `
You are an AI assisntant who is going to act as a travel agent for a user who wants to go on a trip to ${
            forecast.location.name
          }, ${forecast.location.region}, ${forecast.location.country}.
Your current task is to summarize the following weather forecast for the user as a tweet with emojis:
${weatherForecastToPrompt(forecast)}
        `,
        },
      ],
    });

    console.log(response.data.choices);

    return response.data.choices.at(0)?.message;
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
