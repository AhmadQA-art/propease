import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  FileText,
  DollarSign,
  CreditCard,
  Users2,
  MessageSquare,
  Wrench,
  HelpCircle,
  FileSignature
} from 'lucide-react';
import { featureFlags } from '../config/featureFlags';

// Filter menu items based on feature flags
const getMenuItems = () => {
  const baseMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Home, label: 'Rentals', href: '/rentals' },
    { icon: FileSignature, label: 'Leases', href: '/leases' },
    { icon: Users2, label: 'People', href: '/people' },
    { icon: Wrench, label: 'Maintenance', href: '/maintenance' },
    { icon: MessageSquare, label: 'Communications', href: '/communications' },
  ];
  
  // Conditionally add payment feature
  if (featureFlags.enablePayments) {
    baseMenuItems.push({ icon: CreditCard, label: 'Payments', href: '/payments' });
  }
  
  // Conditionally add finance feature
  if (featureFlags.enableFinances) {
    baseMenuItems.push({ icon: DollarSign, label: 'Finances', href: '/finances' });
  }
  
  return baseMenuItems;
};

export default function Sidebar() {
  const location = useLocation();
  const menuItems = getMenuItems();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="w-64 h-screen bg-[#F8F8F8] flex flex-col fixed left-0 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
      <div className="p-4 pb-0">
        <Link to="/" className="block">
          <img
            src="/PropEase.png"
            alt="PropEase"
            className="h-16 w-auto"
            onError={(e) => {
              console.error('Error loading logo:', e, 'Current src:', e.currentTarget.src);
              const target = e.currentTarget as HTMLImageElement;
              target.onerror = null; // Prevent infinite error loops
              target.style.display = 'none';
              target.insertAdjacentHTML('afterend', '<div className="h-16 w-auto text-gray-500">PropEase Logo Failed</div>');
            }}
          />
        </Link>
      </div>
      
      <nav className="flex-1 px-4 pt-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center px-4 py-3 rounded-lg group transition-colors ${
                isActive(item.href)
                  ? 'bg-white text-[#2C3539] shadow-sm'
                  : 'text-[#2C3539] hover:bg-white/60'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Link
          to="/help"
          className="flex items-center px-4 py-3 rounded-lg text-[#2C3539] hover:bg-white/60 mb-4"
        >
          <HelpCircle className="h-5 w-5 mr-3" />
          <span>Help Center</span>
        </Link>
      </div>
    </div>
  );
}