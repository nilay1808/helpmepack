import { GradientText } from '@components/GradientText';
import { TripInputForm, TripValidator } from '@components/TripInputForm';

import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import { json } from '@remix-run/node';
import type { ActionArgs, V2_MetaFunction } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import { Weather } from 'app/server/weather.server';
import { format, parse } from 'date-fns';
import { validationError } from 'remix-validated-form';

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Help me Pack' },
    { name: 'description', content: 'GPT based trip packing assistant' },
  ];
};

export async function action({ request }: ActionArgs) {
  const result = await TripValidator.validate(await request.formData());

  if (result.error) {
    return validationError(result.error);
  }

  const { destination, from, to } = result.data;

  console.log(
    `Destination: ${destination}, From: ${new Date(from).toLocaleDateString()}, To: ${new Date(
      to,
    ).toLocaleDateString()}`,
  );

  const forecastForTrip = await Weather.getForecastForTrip(
    destination,
    parse(from, 'yyyy-MM-dd', new Date()),
    parse(to, 'yyyy-MM-dd', new Date()),
  );

  return json({ forecastForTrip });
}

export default function Index() {
  return (
    <div className="flex flex-grow justify-center items-center flex-col">
      <Introduction />
    </div>
  );
}

function Introduction() {
  const data = useActionData<typeof action>();

  return (
    <div className="flex flex-col justify-center items-center my-36">
      <GradientText
        text="Help Me Pack"
        gradientStart="from-red-900"
        gradientEnd="to-yellow-950"
        className="font-extrabold text-8xl text-center"
      />
      <h3 className="text-2xl m-8 text-center">
        Seamless packing made easy: Introducing Help Me Pack - Your Tailored Clothing Checklist.
      </h3>
      <div className="flex justify-center flex-col items-center w-full">
        <Card className="w-full max-w-[650px] mt-12">
          <CardHeader>
            <CardTitle className="text-2xl">Trip Input</CardTitle>
          </CardHeader>
          <CardContent>
            <TripInputForm />
          </CardContent>
        </Card>

        {data && 'forecastForTrip' in data && (
          <Card className="w-full max-w-[650px] mt-12">
            <CardHeader>
              <CardTitle className="text-2xl">Trip Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg mb-2 font-medium">
                {`📍 ${data.forecastForTrip.location.name}, ${
                  data.forecastForTrip.location.region ?? data.forecastForTrip.location.country
                }`}
              </h3>

              {data.forecastForTrip.forecast
                .filter((day): day is Weather.ForecastForDate => day != null)
                .map((day) => (
                  <div className="mb-2" key={day.date}>
                    <h5 className="text-md font-medium">
                      {format(new Date(day.date), 'MMMM dd, yyyy')}
                    </h5>
                    <ul className="list-disc ml-4">
                      <li>Average Temperature: {day.avgTemperatureInCelcius}°C</li>
                      <li>
                        Temperature Range: {day.minTemperatureInCelcius}°C -{' '}
                        {day.maxTemperatureInCelcius}°C
                      </li>
                      <li>Humidity: {day.avgHumidity}</li>
                      <li>Total Precipitation: {day.totalPrecipitationInMm} mm</li>
                    </ul>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
