import { TripInputForm } from '@components/TripInputForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import type { ActionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

export async function action({ request }: ActionArgs) {
  const body = await request.formData();

  for (const pair of body.entries()) {
    console.log(`${pair[0]}, ${pair[1]}`);
  }
  return redirect('/trip');
}

export default function TripPlanner() {
  return (
    <div className="flex justify-center">
      <Card className="min-w-[650px]">
        <CardHeader>
          <CardTitle className="text-2xl">Trip Planner</CardTitle>
          <CardDescription>Lorem Ipsum</CardDescription>
        </CardHeader>
        <CardContent>
          <TripInputForm />
        </CardContent>
      </Card>
    </div>
  );
}
