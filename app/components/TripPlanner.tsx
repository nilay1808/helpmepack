import { Form } from '@remix-run/react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { useMemo, useState } from 'react';

export function TripPlanner() {
  const [destinations, setDestinations] = useState<string[]>(['']);

  const addDestination = () => {
    setDestinations([...destinations, '']);
  };

  const updateDestination = (index: number, value: string) => {
    const newDestinations = [...destinations];
    newDestinations[index] = value;
    setDestinations(newDestinations);
  };

  const canAddDestination = useMemo(() => {
    console.log('canAddDestination');
    if (destinations.length >= 5) {
      return false;
    }

    return destinations.every((destination) => destination !== '');
  }, [destinations]);

  console.log(canAddDestination);
  console.log(destinations);

  return (
    <div>
      <Form method="post">
        <Card className="min-w-[650px]">
          <CardHeader>
            <CardTitle className="text-xl">Trip Planner</CardTitle>
            <CardDescription>Lorem Ipsum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col w-full">
              {destinations.map((destination, index) => (
                <div key={index} className="flex flex-col justify-start mb-4">
                  <Label className="text-md mb-2" htmlFor="destination">
                    Destination {destinations.length === 1 ? '' : `#${index + 1}`}
                  </Label>
                  <Input
                    type="text"
                    name={`destination-${index}`}
                    id={`destination-${index}`}
                    placeholder={
                      index === 0 && destinations.length === 1 ? 'Ex. New York City' : undefined
                    }
                    onChange={(e) => updateDestination(index, e.target.value)}
                  />
                </div>
              ))}

              <Button
                disabled={!canAddDestination}
                className="self-end mt-4"
                variant="outline"
                onClick={addDestination}
              >
                Add Destination
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Submit</Button>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
