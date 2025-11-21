'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  
  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/heatmap', label: 'Heatmap', icon: MapPin },
    { href: '/chatbot', label: 'AI Chat', icon: MessageSquare },
  ];
  
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-gray-800">IoT Sensor Dashboard</h1>
          
          <div className="flex space-x-2">
            {links.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
