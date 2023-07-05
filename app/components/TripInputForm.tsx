import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';
import { z } from 'zod';
import { ValidatedInput } from './ValidatedInput';
import { ValidatedSubmitButton } from './ValidatedSubmitButton';
import { addDays, differenceInDays, format, isAfter, isEqual, parse, startOfDay } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
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
          <CardTitle className="text-2xl">Where are you travelling?</CardTitle>
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
        <Card className="w-full max-w-[650px] my-12">
          <CardHeader>
            <CardTitle className="text-2xl">🕶️ Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Weather Summary */}
            <h3 className="text-lg mb-2 font-medium">
              {`⛅ Weather in ${actionData.forecastForTrip.location.name}, ${
                actionData.forecastForTrip.location.region ??
                actionData.forecastForTrip.location.country
              }`}
            </h3>
            {actionData.weatherSummary && <p>{actionData.weatherSummary}</p>}

            {/* Packing List */}
            <h3 className="text-lg mb-2 mt-4 font-medium">🧳 Packing List</h3>
            {actionData.packingList && <pre>{actionData.packingList}</pre>}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
