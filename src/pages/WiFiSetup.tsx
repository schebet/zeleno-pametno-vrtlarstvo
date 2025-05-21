
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wifi, Loader2, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WiFiNetwork {
  ssid: string;
  signal: number;
  secured: boolean;
}

const WiFiSetup = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [networks, setNetworks] = useState<WiFiNetwork[]>([]);
  
  const scanNetworks = () => {
    setIsScanning(true);
    setNetworks([]);
    
    // Simulate network scanning delay
    setTimeout(() => {
      // Mock data - in a real app, this would come from the ESP8266
      setNetworks([
        { ssid: 'Кућна Мрежа', signal: 90, secured: true },
        { ssid: 'Комшијски_WiFi', signal: 65, secured: true },
        { ssid: 'Гостујућа Мрежа', signal: 30, secured: false },
        { ssid: 'IoT_Мрежа', signal: 80, secured: true },
      ]);
      setIsScanning(false);
    }, 2000);
  };
  
  const connectToWiFi = () => {
    if (!selectedNetwork) return;
    
    setIsConnecting(true);
    setConnectionStatus('idle');
    
    // Simulate connection attempt
    setTimeout(() => {
      // In a real app, this would attempt to configure the ESP8266
      if (Math.random() > 0.3) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
      setIsConnecting(false);
    }, 3000);
  };
  
  const getSignalStrength = (signal: number) => {
    if (signal >= 70) return 'Одличан';
    if (signal >= 50) return 'Добар';
    if (signal >= 30) return 'Средњи';
    return 'Слаб';
  };
  
  const getSignalColor = (signal: number) => {
    if (signal >= 70) return 'text-green-600';
    if (signal >= 50) return 'text-amber-500';
    if (signal >= 30) return 'text-orange-500';
    return 'text-red-500';
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wi-Fi Подешавања</h1>
        <p className="text-muted-foreground">Конфигуришите Wi-Fi везу вашег уређаја</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wifi className="mr-2" size={20} />
            Доступне Мреже
          </CardTitle>
          <CardDescription>
            Изаберите мрежу да бисте повезали ваш ГарденТех уређај
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={scanNetworks} 
              disabled={isScanning}
              variant="outline"
              className="w-full"
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Скенирање...
                </>
              ) : (
                'Скенирај Мреже'
              )}
            </Button>
            
            {networks.length > 0 && (
              <div className="border rounded-md divide-y">
                {networks.map((network) => (
                  <div 
                    key={network.ssid}
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-muted transition-colors ${
                      selectedNetwork === network.ssid ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedNetwork(network.ssid)}
                  >
                    <div className="flex items-center">
                      <Wifi size={16} className="mr-2" />
                      <div>
                        <div>{network.ssid}</div>
                        <div className={`text-xs ${getSignalColor(network.signal)}`}>
                          {getSignalStrength(network.signal)}
                        </div>
                      </div>
                    </div>
                    {network.secured && <span className="text-xs">🔒</span>}
                  </div>
                ))}
              </div>
            )}
            
            {selectedNetwork && (
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="wifi-password">Лозинка за {selectedNetwork}</Label>
                  <Input 
                    id="wifi-password"
                    type="password"
                    placeholder="Унесите лозинку мреже"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={connectToWiFi} 
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Повезивање...
                    </>
                  ) : (
                    'Повежи'
                  )}
                </Button>
                
                {connectionStatus === 'success' && (
                  <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Успешно</AlertTitle>
                    <AlertDescription>
                      Успешно повезивање на {selectedNetwork}. Ваш уређај је сада на мрежи.
                    </AlertDescription>
                  </Alert>
                )}
                
                {connectionStatus === 'error' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Повезивање није успело</AlertTitle>
                    <AlertDescription>
                      Није могуће повезати се на {selectedNetwork}. Проверите лозинку и покушајте поново.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Ручна Конфигурација</CardTitle>
          <CardDescription>
            Алтернативно, можете ручно унети детаље ваше мреже
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ssid">Име Мреже (SSID)</Label>
              <Input id="ssid" placeholder="Унесите име мреже" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-password">Лозинка</Label>
              <Input id="manual-password" type="password" placeholder="Унесите лозинку мреже" />
            </div>
            <Button variant="outline" className="w-full">Ручно Повезивање</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WiFiSetup;
