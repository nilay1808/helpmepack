import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';
import { z } from 'zod';
import { ValidatedInput } from './ValidatedInput';
import { ValidatedSubmitButton } from './ValidatedSubmitButton';
import { isAfter, parse } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

const isValidDate = (dateString: string) => !isNaN(Date.parse(dateString));

const isDateAfterToday = (dateString: string, timezone: string) => {
  const normalizedDate = zonedTimeToUtc(parse(dateString, 'yyyy-MM-dd', new Date()), timezone);
  const currentDate = zonedTimeToUtc(new Date(), timezone);
  return isAfter(normalizedDate, currentDate);
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
  );
export const TripValidator = withZod(TripSchema);

export const TripInputForm = () => {
  return (
    <ValidatedForm id="tripInputForm" validator={TripValidator} method="post">
      <ValidatedInput className="mb-4 w-full" name="destination" label="Destination" />
      <div className="flex w-full flex-col md:flex-row md:space-x-4">
        <ValidatedInput className="mb-4 w-full" type="date" name="from" label="From" />
        <ValidatedInput className="mb-4 w-full" type="date" name="to" label="To" />
      </div>
      <ValidatedInput
        name="timezone"
        label="timezone"
        defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
      />
      <ValidatedSubmitButton />
    </ValidatedForm>
  );
};
