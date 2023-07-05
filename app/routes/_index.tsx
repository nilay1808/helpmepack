import { GradientText } from '@components/GradientText';
import { TripInputForm, TripValidator } from '@components/TripInputForm';

import { json } from '@remix-run/node';
import type { ActionArgs, V2_MetaFunction } from '@remix-run/node';
import { Weather } from 'app/server/weather.server';
import { parse } from 'date-fns';
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

export default function Index() {
  return (
    <div className="flex flex-grow justify-center items-center flex-col">
      <Introduction />
      <TripInputForm />
    </div>
  );
}

function Introduction() {
  return (
    <div className="flex flex-col justify-center items-center mt-36 mb-18">
      <GradientText
        text="Help Me Pack"
        gradientStart="from-red-900"
        gradientEnd="to-yellow-950"
        className="font-extrabold text-8xl text-center"
      />
      <h3 className="text-2xl m-8 text-center">
        Seamless packing made easy: Introducing Help Me Pack - Your Tailored Clothing Checklist.
      </h3>
    </div>
  );
}
