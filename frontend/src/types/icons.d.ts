import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';

declare module 'lucide-react' {
  export interface LucideProps {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
    color?: string;
    strokeWidth?: number | string;
  }

  export type LucideIcon = ComponentType<LucideProps>;
  
  // Declare all icons we're using
  export const MoreVertical: LucideIcon;
  export const Edit: LucideIcon;
  export const Trash2: LucideIcon;
  export const UserMinus: LucideIcon;
  export const UserPlus: LucideIcon;
  export const Search: LucideIcon;
  export const Filter: LucideIcon;
  export const Plus: LucideIcon;
  export const ChevronDown: LucideIcon;
} 