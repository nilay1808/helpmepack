import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Help me Pack" },
    { name: "description", content: "GPT based trip packing assistant" },
  ];
};

export default function Index() {
  return (
    <div className="h-screen w-screen flex justify-center items-center flex-col">
      <h1 className="text-3xl font-semibold m-4">Help Me Pack</h1>
      <p className="text-lg m-2">A GPT based trip packing assistant</p>
      <p className="text-lg m-2">Coming Soon!</p>
    </div>
  );
}
