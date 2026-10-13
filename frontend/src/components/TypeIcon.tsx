import { Construction, Droplets, Lightbulb } from 'lucide-react';

const ICONS = {
  pothole: Construction,
  water_leak: Droplets,
  streetlight: Lightbulb,
};

const COLORS = {
  pothole: 'text-orange-600',
  water_leak: 'text-blue-600',
  streetlight: 'text-yellow-600',
};

export const TypeIcon = ({ type, className = 'w-5 h-5' }: { type: string; className?: string }) => {
  const Icon = ICONS[type as keyof typeof ICONS] || Construction;
  const color = COLORS[type as keyof typeof COLORS] || 'text-gray-600';
  return <Icon className={`${className} ${color}`} />;
};