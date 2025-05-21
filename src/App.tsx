
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import WiFiSetup from "./pages/WiFiSetup";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/wifi-setup" element={<WiFiSetup />} />
            <Route path="/documentation" element={<Documentation />} />
            {/* Placeholder routes - to be implemented later */}
            <Route path="/growing-guides" element={<div className="text-center py-12"><h1 className="text-3xl font-bold">Водичи за Узгој</h1><p className="mt-4">Ова страница је у развоју...</p></div>} />
            <Route path="/calendar" element={<div className="text-center py-12"><h1 className="text-3xl font-bold">Календар Гајења</h1><p className="mt-4">Ова страница је у развоју...</p></div>} />
            <Route path="/crop-rotation" element={<div className="text-center py-12"><h1 className="text-3xl font-bold">Ротација Усева</h1><p className="mt-4">Ова страница је у развоју...</p></div>} />
            <Route path="/pests-diseases" element={<div className="text-center py-12"><h1 className="text-3xl font-bold">Штеточине и Болести</h1><p className="mt-4">Ова страница је у развоју...</p></div>} />
            <Route path="/settings" element={<div className="text-center py-12"><h1 className="text-3xl font-bold">Подешавања</h1><p className="mt-4">Ова страница је у развоју...</p></div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
