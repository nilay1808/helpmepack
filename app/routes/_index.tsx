import { GradientText } from '@components/GradientText';
import { TripInputForm, TripValidator } from '@components/TripInputForm';

import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import { json } from '@remix-run/node';
import type { ActionArgs, DataFunctionArgs, V2_MetaFunction } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import { Weather } from 'app/server/weather.server';
import { parse } from 'date-fns';
import { ValidatedForm, setFormDefaults, validationError } from 'remix-validated-form';
import { utcToZonedTime, format as formatWithTimezone } from 'date-fns-tz';
import { ValidatedInput } from '@components/ValidatedInput';
import { ValidatedSubmitButton } from '@components/ValidatedSubmitButton';
import { useEffect, useState } from 'react';

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

  const { destination, from, to, timezone } = result.data;

  console.log(
    `Destination: ${destination}\n
    From: ${new Date(from).toLocaleDateString()}\n
    To: ${new Date(to).toLocaleDateString()}\n
    Timezone: ${timezone}`,
  );

  const forecastForTrip = await Weather.getForecastForTrip(
    destination,
    parse(from, 'yyyy-MM-dd', new Date()),
    parse(to, 'yyyy-MM-dd', new Date()),
  );

  return json({ forecastForTrip });
}

export function loader(args: DataFunctionArgs) {
  console.log('loader');
  return json(
    setFormDefaults('tripInputForm', {
      destination: 'San Francisco, CA',
      from: new Date().toLocaleDateString(),
      to: new Date().toLocaleDateString(),
    }),
  );
}

export default function Index() {
  return (
    <div className="flex flex-grow justify-center items-center flex-col">
      <Introduction />
    </div>
  );
}

function Introduction() {
  const actionData = useActionData<typeof action>();

  // let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

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
            <ValidatedForm id="tripInputForm" validator={TripValidator} method="post">
              <ValidatedInput className="mb-4 w-full" name="destination" label="Destination" />
              <div className="flex w-full flex-col md:flex-row md:space-x-4">
                <ValidatedInput className="mb-4 w-full" type="date" name="from" label="From" />
                <ValidatedInput className="mb-4 w-full" type="date" name="to" label="To" />
              </div>
              <ValidatedInput
                className="hidden"
                name="timezone"
                label="timezone"
                value={timezone}
              />
              <ValidatedSubmitButton />
            </ValidatedForm>
          </CardContent>
        </Card>

        {actionData && 'forecastForTrip' in actionData && (
          <Card className="w-full max-w-[650px] mt-12">
            <CardHeader>
              <CardTitle className="text-2xl">Trip Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg mb-2 font-medium">
                {`📍 ${actionData.forecastForTrip.location.name}, ${
                  actionData.forecastForTrip.location.region ??
                  actionData.forecastForTrip.location.country
                }`}
              </h3>

              {actionData.forecastForTrip.forecast
                .filter((day): day is Weather.ForecastForDate => day != null)
                .map((day) => (
                  <div className="mb-2" key={day.date}>
                    <h5 className="text-md font-medium">
                      {formatWithTimezone(
                        utcToZonedTime(day.date, actionData.forecastForTrip.location.tz_id),
                        'MMMM dd, yyyy',
                        {
                          timeZone: actionData.forecastForTrip.location.tz_id,
                        },
                      )}
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
