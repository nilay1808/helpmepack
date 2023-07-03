import type { V2_MetaFunction } from "@remix-run/node";
import { GradientText } from "app/components/GradientText";
import { Badge } from "app/components/ui/badge";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Help me Pack" },
    { name: "description", content: "GPT based trip packing assistant" },
  ];
};

export default function Index() {
  return (
    <div className="flex flex-grow justify-center items-center flex-col">
      <Introduction />
    </div>
  );
}

function Introduction() {
  return (
    <div className="flex flex-col justify-center items-center mt-36">
      <GradientText
        text="Help Me Pack"
        gradientStart="from-red-900"
        gradientEnd="to-yellow-950"
        className="font-extrabold text-8xl text-center"
      />
      <h3 className="text-2xl m-8 text-center">
        Seamless packing made easy: Introducing Help Me Pack - Your Tailored
        Clothing Checklist.
      </h3>
      <Badge
        className="text-lg text-slate-500 border-slate-500"
        variant="outline"
      >
        Coming Soon
      </Badge>
    </div>
  );
}
