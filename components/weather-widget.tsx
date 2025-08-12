"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Droplet } from "lucide-react";

interface WeatherWidgetProps {
  location?: string;
  temperature?: number;
  condition?: string;
  humidity?: number;
}

export function WeatherWidget({
  location = "New York",
  temperature = 22,
  condition = "Partly Cloudy",
  humidity = 60,
}: WeatherWidgetProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Weather in {location}
        </CardTitle>
        <Cloud className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="text-2xl font-bold">{temperature}°C</div>
        <p className="text-xs text-muted-foreground">{condition}</p>
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <Droplet className="h-4 w-4 mr-1" /> {humidity}% Humidity
        </div>
      </CardContent>
    </Card>
  );
}
