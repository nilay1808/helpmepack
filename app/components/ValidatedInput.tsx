import { useField } from 'remix-validated-form';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { HTMLInputTypeAttribute } from 'react';

type Props = {
  name: string;
  label: string;
  type?: HTMLInputTypeAttribute;
};

export const ValidatedInput = ({ name, label, type }: Props) => {
  const { error, getInputProps } = useField(name);

  // console.log(getInputProps({ id: name }));

  // const inputProps = getInputProps({ id: name });

  return (
    <div className="mb-4">
      <Label className="text-md mb-2 font-normal text-small text-slate-600" htmlFor={name}>
        {label}
      </Label>
      <Input {...getInputProps({ id: name, type })} />
      {error && <span className="text-sm text-red-700 font-medium">{error}</span>}
    </div>
  );
};
