import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';
import { z } from 'zod';
import { ValidatedInput } from './ValidatedInput';
import { ValidatedSubmitButton } from './ValidatedSubmitButton';

const TripSchema = z
  .object({
    destination: z.string().min(1, { message: 'The destination is required.' }),
    from: z
      .string()
      .refine((dateString) => !isNaN(Date.parse(dateString)), {
        message: 'The from date is required.',
      })
      .refine((dateString) => new Date(dateString) >= new Date(), {
        message: 'The "from" date must be greater than or equal to today.',
      }),
    to: z
      .string()
      .refine((dateString) => !isNaN(Date.parse(dateString)), {
        message: 'The to date is required.',
      })
      .refine((dateString) => new Date(dateString) >= new Date(), {
        message: 'The "to" date must be greater than or equal to todat.',
      }),
  })
  .refine((data) => new Date(data.from) <= new Date(data.to), {
    message: 'The to date cannot be before the from date.',
  });

export const TripValidator = withZod(TripSchema);

export const TripInputForm = () => {
  return (
    <ValidatedForm validator={TripValidator} method="post">
      <ValidatedInput name="destination" label="Destination" />
      <ValidatedInput type="date" name="from" label="From" />
      <ValidatedInput type="date" name="to" label="To" />
      <ValidatedSubmitButton />
    </ValidatedForm>
  );
};
