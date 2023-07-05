import { format, add, isBefore, isEqual, startOfDay, differenceInDays } from 'date-fns';

const API_KEY = process.env.WEATHER_API_KEY;

export namespace Weather {
  export interface Location {
    name: string;
    region: string;
    country: string;
    tz_id: string;
  }

  export interface ForecastForDate {
    date: string;
    maxTemperatureInCelcius: number;
    minTemperatureInCelcius: number;
    avgTemperatureInCelcius: number;
    maxWindInKph: number;
    avgHumidity: number;
    totalPrecipitationInMm: number;
  }

  export interface ForecastForTripResponse {
    location: {
      name: string;
      region: string;
      country: string;
      tz_id: string;
    };
    forecast: (ForecastForDate | undefined)[];
  }

  export async function getForecastForTrip(
    location: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ForecastForTripResponse> {
    const tripDates = getDatesInRange(startDate, endDate);

    const forecastForAllDates = await Promise.all(
      tripDates.map(async (date) => {
        try {
          if (differenceInDays(new Date(date), new Date()) >= 13) {
            return await getForecastForFutureDay(location, date);
          }
          if (differenceInDays(new Date(date), new Date()) < 9) {
            return await getForecastForUpcomingDay(location, date);
          }
          return undefined;
        } catch (error) {
          console.log(error);
          return undefined;
        }
      }),
    );

    if (forecastForAllDates.length === 0) {
      throw new Error('Could not find forecast for given dates');
    }

    return {
      location: forecastForAllDates.filter((forecast) => forecast != null).at(0)!.location,
      forecast: forecastForAllDates.map((forecast) => forecast?.forecast),
    };
  }

  interface ForecastForDayResponse {
    location: Location;
    forecast: ForecastForDate;
  }

  async function getForecastForUpcomingDay(
    location: string,
    date: string,
  ): Promise<ForecastForDayResponse> {
    const WEATHER_API_BASE_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=10&aqi=no&alerts=n`;

    const response = await fetch(WEATHER_API_BASE_URL);

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    const forecastForDate = data.forecast.forecastday.find(
      (forecast: any) => forecast?.date === date,
    );

    if (!forecastForDate) {
      console.error('Could not find forecast for given date', location, date);
      throw new Error('Could not find forecast for given date');
    }

    return {
      location: {
        name: data.location.name,
        region: data.location.region,
        country: data.location.country,
        tz_id: data.location.tz_id,
      },
      forecast: {
        date: forecastForDate.date,
        maxTemperatureInCelcius: forecastForDate.day.maxtemp_c,
        minTemperatureInCelcius: forecastForDate.day.mintemp_c,
        avgTemperatureInCelcius: forecastForDate.day.avgtemp_c,
        maxWindInKph: forecastForDate.day.maxwind_kph,
        avgHumidity: forecastForDate.day.avghumidity,
        totalPrecipitationInMm: forecastForDate.day.totalprecip_mm,
      },
    };
  }

  async function getForecastForFutureDay(
    location: string,
    date: string,
  ): Promise<ForecastForDayResponse> {
    const WEATHER_API_BASE_URL = `https://api.weatherapi.com/v1/future.json?key=${API_KEY}&q=${location}&dt=${date}`;

    const response = await fetch(WEATHER_API_BASE_URL);

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    const { location: locationData, forecast } = data;

    return {
      location: {
        name: locationData.name,
        region: locationData.region,
        country: locationData.country,
        tz_id: data.location.tz_id,
      },
      forecast: {
        date: forecast.forecastday.at(0).date,
        maxTemperatureInCelcius: forecast.forecastday.at(0).day.maxtemp_c,
        minTemperatureInCelcius: forecast.forecastday.at(0).day.mintemp_c,
        avgTemperatureInCelcius: forecast.forecastday.at(0).day.avgtemp_c,
        maxWindInKph: forecast.forecastday.at(0).day.maxwind_kph,
        avgHumidity: forecast.forecastday.at(0).day.avghumidity,
        totalPrecipitationInMm: forecast.forecastday.at(0).day.totalprecip_mm,
      },
    };
  }
}

function getDatesInRange(startDate: Date, endDate: Date): string[] {
  let currentDate = startOfDay(startDate);
  let dates: string[] = [];

  while (isBefore(currentDate, endDate) || isEqual(currentDate, endDate)) {
    dates.push(format(currentDate, 'yyyy-MM-dd'));
    currentDate = add(currentDate, { days: 1 });
  }

  return dates;
}
