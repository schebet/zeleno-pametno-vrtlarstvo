
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, Wifi, Sprout, Download } from "lucide-react";

const Documentation = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Документација</h1>
        <p className="text-muted-foreground">Упутства за коришћење ГарденТех система</p>
      </div>
      
      <Tabs defaultValue="sensors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sensors">Сензори</TabsTrigger>
          <TabsTrigger value="wifi">Wi-Fi</TabsTrigger>
          <TabsTrigger value="dashboard">Контролна Табла</TabsTrigger>
          <TabsTrigger value="firmware">Фирмвер</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sensors" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sprout className="mr-2" size={20} />
                Повезивање Сензора
              </CardTitle>
              <CardDescription>
                Како правилно повезати сензоре на ваш ЕСП8266 уређај
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="sensor-dht">
                  <AccordionTrigger>DHT22 Сензор Температуре и Влажности</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>DHT22 сензор мери температуру и влажност ваздуха. За повезивање:</p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Повежите VCC пин на 3.3V извор на ЕСП8266</li>
                        <li>Повежите GND пин на GND на ЕСП8266</li>
                        <li>Повежите DATA пин на D4 пин ЕСП8266</li>
                        <li>Додајте 10K отпорник између VCC и DATA пинова</li>
                      </ol>
                      <p className="text-sm text-muted-foreground">
                        Напомена: Осигурајте да користите библиотеку "DHT sensor library" у Arduino IDE.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="sensor-soil">
                  <AccordionTrigger>Сензор Влажности Земљишта</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>Сензор влажности земљишта мери количину воде у земљишту. За повезивање:</p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Повежите VCC пин на 3.3V извор на ЕСП8266</li>
                        <li>Повежите GND пин на GND на ЕСП8266</li>
                        <li>Повежите АНАЛОГ пин на A0 пин ЕСП8266</li>
                      </ol>
                      <p className="text-sm text-muted-foreground">
                        Напомена: Калибрирајте сензор тако што ћете измерити вредности на потпуно сувом и потпуно влажном земљишту.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="sensor-relay">
                  <AccordionTrigger>Релеј за Пумпу за Воду</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>Релеј контролише пумпу за воду. За повезивање:</p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Повежите VCC пин на 3.3V извор на ЕСП8266</li>
                        <li>Повежите GND пин на GND на ЕСП8266</li>
                        <li>Повежите IN пин на D1 пин ЕСП8266</li>
                        <li>Повежите NC и COM пинове на пумпу и извор напајања</li>
                      </ol>
                      <p className="text-sm text-muted-foreground">
                        Важно: Увек користите externos napajanje за пумпу, никада директно са ЕСП8266.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wifi" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wifi className="mr-2" size={20} />
                Wi-Fi Подешавања
              </CardTitle>
              <CardDescription>
                Како конфигурисати Wi-Fi везу вашег ГарденТех уређаја
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Први Корак: Повезивање на АП Режим</h3>
                  <p>Када први пут укључите уређај, он ће креирати Wi-Fi приступну тачку:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>На вашем телефону/рачунару, потражите мрежу "GardenTech-Setup"</li>
                    <li>Повежите се користећи подразумевану лозинку "gardentech123"</li>
                    <li>Након повезивања, отворите веб прегледач и идите на адресу 192.168.4.1</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Други Корак: Конфигурисање Wi-Fi Параметара</h3>
                  <p>У апликацији ГарденТех:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Идите на страницу "Wi-Fi Подешавања"</li>
                    <li>Кликните на "Скенирај Мреже" да видите доступне Wi-Fi мреже</li>
                    <li>Изаберите вашу кућну мрежу и унесите лозинку</li>
                    <li>Кликните на "Повежи" и сачекајте потврду</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Решавање Проблема</h3>
                  <p>Ако имате потешкоћа при повезивању:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Проверите да ли је уређај укључен и има напајање</li>
                    <li>Ресетујте уређај држањем дугмета за ресет 10 секунди</li>
                    <li>Проверите да ли је ваша Wi-Fi мрежа на 2.4GHz (уређај не подржава 5GHz)</li>
                    <li>Уверите се да је сигнал довољно јак на месту где је уређај постављен</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Коришћење Контролне Табле</CardTitle>
              <CardDescription>Како ефикасно користити контролну таблу за управљање системом</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="dashboard-manual">
                  <AccordionTrigger>Ручни Режим</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>У ручном режиму, директно контролишете пумпу за воду:</p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Изаберите картицу "Ручно" у секцији "Контрола Наводњавања"</li>
                        <li>Користите прекидач да укључите/искључите пумпу</li>
                        <li>Обратите пажњу на влажност земљишта да избегнете превише заливања</li>
                        <li>Не заборавите да ИСКЉУЧИТЕ пумпу након заливања</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="dashboard-timer">
                  <AccordionTrigger>Режим Тајмера</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>Режим тајмера омогућава заливање на одређено време:</p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Изаберите картицу "Тајмер" у секцији "Контрола Наводњавања"</li>
                        <li>Померите клизач да поставите трајање заливања (1-30 минута)</li>
                        <li>Кликните на "Покрени Тајмер" да започнете заливање</li>
                        <li>Пумпа ће се аутоматски искључити након истека времена</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="dashboard-auto">
                  <AccordionTrigger>Аутоматски Режим</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>Аутоматски режим заснива се на влажности земљишта:</p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Изаберите картицу "Аутоматски" у секцији "Контрола Наводњавања"</li>
                        <li>Поставите праг влажности земљишта клизачем (препоручено: 30-40%)</li>
                        <li>Укључите прекидач "Укључи Аутоматски Режим"</li>
                        <li>Систем ће аутоматски заливати када влажност падне испод прага</li>
                        <li>Заливање ће трајати док влажност не достигне 10% изнад прага</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="dashboard-sensors">
                  <AccordionTrigger>Праћење Сензора</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>Контролна табла приказује податке са свих сензора:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Температура: Тренутна температура ваздуха у °C</li>
                        <li>Влажност: Тренутна влажност ваздуха у %</li>
                        <li>Влажност Земљишта: Тренутни ниво влажности земљишта у %</li>
                        <li>Статус Система: Ниво батерије, последње заливање, режим рада</li>
                      </ul>
                      <p>Сви подаци се ажурирају аутоматски сваких 30 секунди.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="firmware" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="mr-2" size={20} />
                Ажурирање Фирмвера
              </CardTitle>
              <CardDescription>
                Како ажурирати софтвер на вашем ГарденТех уређају
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Опција 1: OTA Ажурирање</h3>
                  <p>Ажурирање преко мреже (препоручено):</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Уверите се да је уређај повезан на Wi-Fi мрежу</li>
                    <li>У апликацији, идите на "Подешавања" &gt; "Ажурирање фирмвера"</li>
                    <li>Кликните на "Провери ажурирања"</li>
                    <li>Ако је доступно ажурирање, кликните на "Инсталирај"</li>
                    <li>Сачекајте да се процес заврши (~2-5 минута)</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Опција 2: Ручно Ажурирање преко USB-a</h3>
                  <p>За директно ажурирање преко Arduino IDE:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Преузмите најновију верзију фирмвера са нашег GitHub репозиторијума</li>
                    <li>Отворите .ino фајл у Arduino IDE</li>
                        <li>Повежите ЕСП8266 на рачунар помоћу микро USB кабла</li>
                        <li>Изаберите одговарајући порт у Arduino IDE</li>
                        <li>Поставите тип плоче на "NodeMCU 1.0 (ESP-12E Module)"</li>
                        <li>Кликните на "Постави" да пренесете фирмвер на уређај</li>
                        <li>Сачекајте да се процес заврши и уређај ће се аутоматски рестартовати</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Изворни Код Фирмвера</h3>
                  <p>Главни делови ESP8266 фирмвера укључују:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Повезивање са сензорима (DHT22, сензор влажности земљишта)</li>
                    <li>Wi-Fi конекција и АП режим рада</li>
                    <li>RESTful API за комуникацију са апликацијом</li>
                    <li>Логика за ручни, тајмер и аутоматски режим</li>
                    <li>OTA функционалност за ажурирање</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    Потпуни изворни код доступан је на нашем GitHub репозиторијуму: 
                    <a href="https://github.com/gardentech/esp8266-firmware" className="text-primary ml-1">github.com/gardentech/esp8266-firmware</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
