import type { ComponentProps } from 'react';

declare module '@radix-ui/react-popover' {
  interface PopoverProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }

  interface PopoverTriggerProps extends ComponentProps<'button'> {
    asChild?: boolean;
  }

  interface PopoverContentProps extends ComponentProps<'div'> {
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    alignOffset?: number;
    children?: React.ReactNode;
  }

  interface PopoverPortalProps {
    children?: React.ReactNode;
  }

  interface PopoverAnchorProps extends ComponentProps<'div'> {
    asChild?: boolean;
  }

  const Root: React.FC<PopoverProps>;
  const Trigger: React.FC<PopoverTriggerProps>;
  const Content: React.FC<PopoverContentProps>;
  const Portal: React.FC<PopoverPortalProps>;
  const Anchor: React.FC<PopoverAnchorProps>;
} 