import React from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';

export const createIconComponent = (Icon: LucideIcon) => {
  const IconComponent = React.forwardRef<SVGSVGElement, Omit<LucideProps, 'ref'>>((props, ref) => {
    return React.createElement(Icon, { ...props, ref });
  });
  IconComponent.displayName = Icon.displayName || 'IconComponent';
  return IconComponent;
}; 