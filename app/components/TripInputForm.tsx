import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';
import { z } from 'zod';
import { ValidatedInput } from './ValidatedInput';
import { ValidatedSubmitButton } from './ValidatedSubmitButton';
import { addDays, differenceInDays, format, isAfter, isEqual, parse, startOfDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc, format as formatWithTimezone } from 'date-fns-tz';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import type { action } from 'app/routes/_index';
import { useActionData } from '@remix-run/react';
import { useEffect, useState } from 'react';

const isValidDate = (dateString: string) => !isNaN(Date.parse(dateString));

const isDateAfterToday = (dateString: string, timezone: string) => {
  const normalizedDate = zonedTimeToUtc(parse(dateString, 'yyyy-MM-dd', new Date()), timezone);
  const currentDate = zonedTimeToUtc(startOfDay(new Date()), timezone);

  console.log('inputs', dateString, timezone);
  console.log('normalizedDate', normalizedDate);
  console.log('currentDate', currentDate);

  return isEqual(normalizedDate, currentDate) || isAfter(normalizedDate, currentDate);
};

const TripSchema = z
  .object({
    destination: z.string().min(1, { message: 'The destination is required.' }),
    from: z.string().refine(isValidDate, {
      message: 'The from date is required.',
    }),
    to: z.string().refine(isValidDate, {
      message: 'The to date is required.',
    }),
    timezone: z.string(),
  })
  .refine((data) => isDateAfterToday(data.from, data.timezone), {
    message: 'The from date must be at least 1 day in the future.',
    path: ['from'],
  })
  .refine((data) => isDateAfterToday(data.to, data.timezone), {
    message: 'The to date must be at least 1 day in the future.',
    path: ['to'],
  })
  .refine(
    (data) => {
      const fromDate = parse(data.from, 'yyyy-MM-dd', new Date());
      const toDate = parse(data.to, 'yyyy-MM-dd', new Date());
      return fromDate <= toDate;
    },
    {
      message: 'The to date cannot be before the from date.',
      path: ['to'],
    },
  )
  .refine(
    (data) => {
      const fromDate = parse(data.from, 'yyyy-MM-dd', new Date());
      const toDate = parse(data.to, 'yyyy-MM-dd', new Date());
      return differenceInDays(toDate, fromDate) <= 21;
    },
    {
      message: 'The trip currently cannot be longer than 21 days.',
      path: ['to'],
    },
  );

export const TripValidator = withZod(TripSchema);

export const TripInputForm = () => {
  const actionData = useActionData<typeof action>();

  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return (
    <div className="flex justify-center flex-col items-center w-full">
      <Card className="w-full max-w-[650px] mt-12">
        <CardHeader>
          <CardTitle className="text-2xl">Trip Input</CardTitle>
        </CardHeader>
        <CardContent>
          <ValidatedForm
            defaultValues={{
              destination: 'New York, NY',
              from: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
              to: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
            }}
            validator={TripValidator}
            method="post"
          >
            <ValidatedInput className="mb-4 w-full" name="destination" label="Destination" />
            <div className="flex w-full flex-col md:flex-row md:space-x-4">
              <ValidatedInput className="mb-4 w-full" type="date" name="from" label="From" />
              <ValidatedInput className="mb-4 w-full" type="date" name="to" label="To" />
            </div>
            <ValidatedInput className="hidden" name="timezone" label="timezone" value={timezone} />
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

            {actionData.forecastForTrip.forecast.map((day) => {
              if (!day.stats) {
                return (
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
                    <p className="text-sm text-red-700 font-medium">Could not get forecast</p>
                  </div>
                );
              }

              return (
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
                    <li>Average Temperature: {day.stats.avgTemperatureInCelcius}°C</li>
                    <li>
                      Temperature Range: {day.stats.minTemperatureInCelcius}°C -{' '}
                      {day.stats.maxTemperatureInCelcius}°C
                    </li>
                    <li>Humidity: {day.stats.avgHumidity}</li>
                    <li>Total Precipitation: {day.stats.totalPrecipitationInMm} mm</li>
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
