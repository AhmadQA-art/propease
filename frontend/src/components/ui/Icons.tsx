import React from 'react';
import { X as LucideX, Building2 as LucideBuilding2, ChevronDown as LucideChevronDown, Plus as LucidePlus } from 'lucide-react';

// Wrapper components for Lucide icons to fix type issues
export const X = ({ className, size }: { className?: string; size?: number }) => {
  return <LucideX className={className} size={size} />;
};

export const Building2 = ({ className, size }: { className?: string; size?: number }) => {
  return <LucideBuilding2 className={className} size={size} />;
};

export const ChevronDown = ({ className, size }: { className?: string; size?: number }) => {
  return <LucideChevronDown className={className} size={size} />;
};

export const Plus = ({ className, size }: { className?: string; size?: number }) => {
  return <LucidePlus className={className} size={size} />;
}; 