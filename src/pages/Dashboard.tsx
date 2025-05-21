
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Battery, Cloud, WifiHigh, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [mode, setMode] = useState<'manual' | 'timer' | 'auto'>('manual');
  const [manualPumpOn, setManualPumpOn] = useState(false);
  const [timerDuration, setTimerDuration] = useState(5); // minutes
  const [moistureThreshold, setMoistureThreshold] = useState(30); // percentage
  const [isConnected, setIsConnected] = useState(false);
  
  // Sensor data (in a real app, this would come from the ESP8266)
  const mockSensorData = {
    temperature: 24.5,
    humidity: 65,
    soilMoisture: 42,
    lastWatered: '2025-05-21 08:30',
    batteryLevel: 85,
  };
  
  const handleTimerDurationChange = (value: number[]) => {
    setTimerDuration(value[0]);
  };
  
  const handleMoistureThresholdChange = (value: number[]) => {
    setMoistureThreshold(value[0]);
  };
  
  const handleConnect = () => {
    // In a real app, this would attempt to connect to the ESP8266
    setIsConnected(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Контролна Табла</h1>
          <p className="text-muted-foreground">Надгледајте и контролишите ваш башту</p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center text-green-600">
              <WifiHigh className="mr-1" size={18} />
              Повезано
            </span>
          ) : (
            <Button onClick={handleConnect} variant="outline" size="sm">
              <WifiHigh className="mr-1" size={18} />
              Повежите Уређај
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Температура</CardTitle>
            <CardDescription>Тренутна температура ваздуха</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockSensorData.temperature}°C</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Влажност</CardTitle>
            <CardDescription>Тренутна влажност ваздуха</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockSensorData.humidity}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Влажност Земљишта</CardTitle>
            <CardDescription>Тренутни ниво влажности земљишта</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockSensorData.soilMoisture}%</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Контрола Наводњавања</CardTitle>
          <CardDescription>Контролишите ваш систем за наводњавање</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full" onValueChange={(v) => setMode(v as 'manual' | 'timer' | 'auto')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">Ручно</TabsTrigger>
              <TabsTrigger value="timer">Тајмер</TabsTrigger>
              <TabsTrigger value="auto">Аутоматски</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="pump-switch">Пумпа за Воду</Label>
                <Switch 
                  id="pump-switch" 
                  checked={manualPumpOn} 
                  onCheckedChange={setManualPumpOn} 
                  disabled={!isConnected}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {manualPumpOn 
                  ? "Пумпа тренутно ради. Искључите је кад завршите." 
                  : "Укључите пумпу да бисте почели са ручним заливањем."}
              </p>
            </TabsContent>
            
            <TabsContent value="timer" className="mt-4 space-y-4">
              <div>
                <Label>Трајање Заливања: {timerDuration} минута</Label>
                <Slider 
                  disabled={!isConnected}
                  value={[timerDuration]} 
                  min={1} 
                  max={30} 
                  step={1} 
                  className="mt-2" 
                  onValueChange={handleTimerDurationChange}
                />
              </div>
              <Button disabled={!isConnected}>Покрени Тајмер</Button>
            </TabsContent>
            
            <TabsContent value="auto" className="mt-4 space-y-4">
              <div>
                <Label>Праг Влажности: {moistureThreshold}%</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Систем ће заливати када влажност земљишта падне испод овог процента
                </p>
                <Slider 
                  disabled={!isConnected}
                  value={[moistureThreshold]} 
                  min={10} 
                  max={90} 
                  step={5} 
                  className="mt-2" 
                  onValueChange={handleMoistureThresholdChange}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-switch">Укључи Аутоматски Режим</Label>
                <Switch id="auto-switch" disabled={!isConnected} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Статус Система</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Battery className="mr-2 h-4 w-4" />
              <span>Батерија</span>
            </div>
            <span className="font-medium">{mockSensorData.batteryLevel}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Cloud className="mr-2 h-4 w-4" />
              <span>Последње Заливање</span>
            </div>
            <span className="font-medium">{mockSensorData.lastWatered}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Server className="mr-2 h-4 w-4" />
              <span>Режим Рада</span>
            </div>
            <span className="font-medium">
              {mode === 'manual' ? 'Ручни' : mode === 'timer' ? 'Тајмер' : 'Аутоматски'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
