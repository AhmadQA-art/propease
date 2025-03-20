import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  icon: LucideIcon;
}

const Icon: React.FC<IconProps> = ({ icon: LucideIcon, ...props }) => {
  return <LucideIcon {...props} />;
};

export default Icon; 