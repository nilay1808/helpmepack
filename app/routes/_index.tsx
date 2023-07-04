import { GradientText } from '@components/GradientText';
import { TripPlanner } from '@components/TripPlanner';

import { Badge } from '@components/ui/badge';
import { redirect } from '@remix-run/node';
import type { ActionArgs, V2_MetaFunction } from '@remix-run/node';

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Help me Pack' },
    { name: 'description', content: 'GPT based trip packing assistant' },
  ];
};

export async function action({ request }: ActionArgs) {
  const body = await request.formData();

  console.log(body.get('destination'));

  return redirect('/');
}

export default function Index() {
  return (
    <div className="flex flex-grow justify-center items-center flex-col">
      <Introduction />
      <TripPlanner />
    </div>
  );
}

function Introduction() {
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
      <Badge className="text-lg text-slate-500 border-slate-500" variant="outline">
        Coming Soon
      </Badge>
    </div>
  );
}
