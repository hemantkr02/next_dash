"use client";
import React, {useEffect, useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CloudRain, Thermometer, Wind, Droplets, Sun, Airplay } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// WeatherComponent.tsx or your component file

// 1. Add the interfaces here at the top of the file
interface HourlyData {
  time: string;
  temp: number;
  feels_like: number;
}

interface HourlyWindData {
  time: string;
  wind_kph: number;
  wind_dir: string;
}

interface CurrentWeather {
  temp_c: number;
  feelslike_c: number;
  wind_kph: number;
  wind_dir: string;
  condition: {
    text: string;
  };
  humidity: number;
  cloud: number;
  uv: number;
  pressure_mb: number;
}

interface Location {
  name: string;
  country: string;
  localtime: string;
}

interface AirQuality {
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  "us-epa-index": number;
  "gb-defra-index": number;
}
interface DayForecast {
  maxtemp_c: number;
  mintemp_c: number;
  daily_chance_of_rain: number;
}
interface ForecastDay {
  hour: {
    time: string;
    temp_c: number;
    feelslike_c: number;
    wind_kph: number;
    wind_dir: string;
  }[];
  day: DayForecast & {
    air_quality: AirQuality;
  };
}

interface WeatherData {
  current: CurrentWeather;
  location: Location;
  forecast: {
    forecastday: ForecastDay[];
  };
}




export default  function Home() {
  // Extract hourly data for the temperature chart
  const [data, setData] = useState<WeatherData | null>(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "https://api.weatherapi.com/v1/forecast.json?key=00577e0f20794911874182844250402&q=Gandhinagar&days=1&aqi=yes&alerts=no"
        );
        const weatherData = await res.json();
        setData(weatherData);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    }

    fetchData();
  }, []);

  if (!data ) return <p>Loading...</p>;

  const hourlyData: HourlyData[] = data.forecast.forecastday[0].hour.map(hour => ({
    time: hour.time.split(' ')[1],
    temp: hour.temp_c,
    feels_like: hour.feelslike_c,
  }));

  const hourlyWindData: HourlyWindData[] = data.forecast.forecastday[0]?.hour?.map(hour => ({
    time: hour.time.split(' ')[1],
    wind_kph: hour.wind_kph,
    wind_dir: hour.wind_dir,
  })) || [];

  const currentWeather: CurrentWeather = data.current;
  const location: Location = data.location;
  const forecast: ForecastDay = data.forecast.forecastday[0];
  const currentAirQuality: AirQuality = forecast.day.air_quality;
  const airQualityData = [
    {
      name: "CO",
      value: currentAirQuality.co,
    },
    {
      name: "NO2",
      value: currentAirQuality.no2,
    },
    {
      name: "O3",
      value: currentAirQuality.o3,
    },
    {
      name: "SO2",
      value: currentAirQuality.so2,
    },
    {
      name: "PM2.5",
      value: currentAirQuality.pm2_5,
    },
    {
      name: "PM10",
      value: currentAirQuality.pm10,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Location Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">{location.name}, {location.country}</h1>
          <p className="text-gray-500">Local time: {location.localtime}</p>
        </div>

        {/* Current Weather Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Current Weather</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Temperature Section */}
              <div className="flex items-center space-x-4">
                <Thermometer className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-4xl font-bold">{currentWeather.temp_c}°C</p>
                  <p className="text-sm text-gray-500">Feels like {currentWeather.feelslike_c}°C</p>
                </div>
              </div>

              {/* Condition Section */}
              <div className="flex items-center space-x-4">
                <CloudRain className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-lg">{currentWeather.condition.text}</p>
                  <p className="text-sm text-gray-500">Cloud: {currentWeather.cloud}%</p>
                </div>
              </div>

              {/* Wind Section */}
              <div className="flex items-center space-x-4">
                <Wind className="h-8 w-8 text-teal-500" />
                <div>
                  <p className="text-lg">{currentWeather.wind_kph} km/h</p>
                  <p className="text-sm text-gray-500">Direction: {currentWeather.wind_dir}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Weather Info */}
        <Tabs defaultValue="temperature" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="humidity">Humidity</TabsTrigger>
            <TabsTrigger value="wind">Wind</TabsTrigger>
            <TabsTrigger value="air-quality">Air Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="temperature" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Temperature Over 24 Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="temp" stroke="#ff7300" name="Temperature" />
                      <Line type="monotone" dataKey="feels_like" stroke="#82ca9d" name="Feels Like" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="humidity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Humidity & Comfort</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4">
                    <Droplets className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{currentWeather.humidity}%</p>
                      <p className="text-gray-500">Relative Humidity</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Sun className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">UV: {currentWeather.uv}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wind" className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Wind Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wind Speed */}
            <div className="flex items-center space-x-4">
              <Wind className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{currentWeather.wind_kph} km/h</p>
                <p className="text-gray-500">Wind Speed</p>
              </div>
            </div>

            {/* Humidity & UV */}
            <div className="flex items-center space-x-4">
              <Droplets className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{currentWeather.humidity}%</p>
                <p className="text-gray-500">Relative Humidity</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Sun className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">UV: {currentWeather.uv}</p>
                <p className="text-gray-500">Pressure: {currentWeather.pressure_mb} mb</p>
              </div>
            </div>
          </div>

          {/* Wind Speed Chart */}
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyWindData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis label={{ value: "km/h", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line type="monotone" dataKey="wind_kph" stroke="#3182CE" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="air-quality" className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Air Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Air Quality Indexes */}
            <div className="flex items-center space-x-4">
              <Airplay className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">CO: {currentAirQuality.co} µg/m³</p>
                <p className="text-gray-500">Carbon Monoxide</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Airplay className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">NO2: {currentAirQuality.no2} µg/m³</p>
                <p className="text-gray-500">Nitrogen Dioxide</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Airplay className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">O3: {currentAirQuality.o3} µg/m³</p>
                <p className="text-gray-500">Ozone</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Airplay className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">SO2: {currentAirQuality.so2} µg/m³</p>
                <p className="text-gray-500">Sulphur Dioxide</p>
              </div>
            </div>
          </div>

          {/* Air Quality Chart (PM2.5, PM10) */}
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={airQualityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: "µg/m³", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3182CE" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

          {/* Additional tab contents would go here */}
        </Tabs>

        {/* Daily Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="font-semibold">Max Temperature</p>
                <p className="text-2xl">{forecast.day.maxtemp_c}°C</p>
              </div>
              <div>
                <p className="font-semibold">Min Temperature</p>
                <p className="text-2xl">{forecast.day.mintemp_c}°C</p>
              </div>
              <div>
                <p className="font-semibold">Chance of Rain</p>
                <p className="text-2xl">{forecast.day.daily_chance_of_rain}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

