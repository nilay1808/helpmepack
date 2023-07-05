import { useIsSubmitting, useIsValid } from 'remix-validated-form';
import { Button } from './ui/button';

export const ValidatedSubmitButton = () => {
  const isSubmitting = useIsSubmitting();
  const isValid = useIsValid();
  return (
    <Button type="submit" disabled={isSubmitting || !isValid}>
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </Button>
  );
};
