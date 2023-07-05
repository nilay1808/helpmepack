import { useField } from 'remix-validated-form';
import type { InputProps } from './ui/input';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { HTMLInputTypeAttribute } from 'react';

type Props = {
  name: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  defaultValue?: InputProps['defaultValue'];
  className?: string;
};

export const ValidatedInput = ({ name, label, type, defaultValue, className }: Props) => {
  const { error, getInputProps } = useField(name);

  return (
    <div className={className}>
      <Label className="text-md mb-2 font-normal text-small text-slate-600" htmlFor={name}>
        {label}
      </Label>
      <Input {...getInputProps({ id: name, type })} defaultValue={defaultValue} />
      {error && <span className="text-sm text-red-700 font-medium">{error}</span>}
    </div>
  );
};
