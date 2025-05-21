
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Wifi, 
  Calendar, 
  Settings, 
  Menu, 
  X,
  Sprout,
  RotateCw,
  Bug,
  FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Контролна Табла' },
    { path: '/wifi-setup', icon: <Wifi size={20} />, label: 'Wi-Fi Подешавања' },
    { path: '/growing-guides', icon: <Sprout size={20} />, label: 'Водичи за Узгој' },
    { path: '/calendar', icon: <Calendar size={20} />, label: 'Календар Гајења' },
    { path: '/crop-rotation', icon: <RotateCw size={20} />, label: 'Ротација Усева' },
    { path: '/pests-diseases', icon: <Bug size={20} />, label: 'Штеточине и Болести' },
    { path: '/documentation', icon: <FileText size={20} />, label: 'Документација' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Подешавања' },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={onToggle}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>
    
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-full w-64 transform bg-garden-dark text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-center border-b border-garden-dark">
          <h1 className="text-2xl font-bold">ГарденТех</h1>
        </div>
        
        <nav className="mt-6 px-2">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-md px-4 py-3 transition-colors",
                    location.pathname === item.path
                      ? "bg-garden-main text-white"
                      : "hover:bg-garden-main/80"
                  )}
                >
                  {item.icon}
                  <span className="ml-4">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
