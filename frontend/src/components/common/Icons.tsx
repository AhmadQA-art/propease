import React from 'react';
import { 
  Search as SearchIcon,
  Filter as FilterIcon,
  Plus as PlusIcon,
  MoreVertical as MoreVerticalIcon,
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  X as XIcon
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export const Search = React.forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <SearchIcon ref={ref} {...props} />
));
Search.displayName = 'Search';

export const Filter = React.forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <FilterIcon ref={ref} {...props} />
));
Filter.displayName = 'Filter';

export const Plus = React.forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <PlusIcon ref={ref} {...props} />
));
Plus.displayName = 'Plus';

export const MoreVertical = React.forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <MoreVerticalIcon ref={ref} {...props} />
));
MoreVertical.displayName = 'MoreVertical';

export const Check = React.forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <CheckIcon ref={ref} {...props} />
));
Check.displayName = 'Check';

export const ChevronDown = React.forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <ChevronDownIcon ref={ref} {...props} />
));
ChevronDown.displayName = 'ChevronDown';

export const X = React.forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <XIcon ref={ref} {...props} />
));
X.displayName = 'X'; 