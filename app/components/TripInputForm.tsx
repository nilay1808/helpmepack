import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';
import { z } from 'zod';
import { ValidatedInput } from './ValidatedInput';
import { ValidatedSubmitButton } from './ValidatedSubmitButton';
import { addDays, format, parse, startOfDay } from 'date-fns';

const isValidDate = (dateString: string) => !isNaN(Date.parse(dateString));

const isDateAfterToday = (dateString: string) => {
  const date = parse(dateString, 'yyyy-MM-dd', new Date());
  return date > startOfDay(new Date());
};

const TripSchema = z
  .object({
    destination: z.string().min(1, { message: 'The destination is required.' }),
    from: z
      .string()
      .refine(isValidDate, {
        message: 'The from date is required.',
      })
      .refine(isDateAfterToday, {
        message: 'The from date must be in the future.',
      }),
    to: z
      .string()
      .refine(isValidDate, {
        message: 'The to date is required.',
      })
      .refine(isDateAfterToday, {
        message: 'The to date must be in the future.',
      }),
  })
  .refine(
    (data) => {
      const fromDate = parse(data.from, 'yyyy-MM-dd', new Date());
      const toDate = parse(data.to, 'yyyy-MM-dd', new Date());
      return fromDate <= toDate;
    },
    {
      message: 'The to date cannot be before the from date.',
    },
  );

export const TripValidator = withZod(TripSchema);

export const TripInputForm = () => {
  return (
    <ValidatedForm validator={TripValidator} method="post">
      <ValidatedInput
        className="mb-4 w-full"
        defaultValue="San Francisco, CA"
        name="destination"
        label="Destination"
      />
      <div className="flex w-full flex-col md:flex-row md:space-x-4">
        <ValidatedInput
          className="mb-4 w-full"
          defaultValue={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
          type="date"
          name="from"
          label="From"
        />
        <ValidatedInput
          className="mb-4 w-full"
          defaultValue={format(addDays(new Date(), 4), 'yyyy-MM-dd')}
          type="date"
          name="to"
          label="To"
        />
      </div>
      <ValidatedSubmitButton />
    </ValidatedForm>
  );
};
