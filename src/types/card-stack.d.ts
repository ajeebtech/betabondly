declare module '@/components/ui/card-stack' {
  import * as React from 'react';

  export interface Card {
    id: number;
    name: string;
    designation: string;
    content: React.ReactNode;
  }

  export interface CardStackProps {
    items: Card[];
    offset?: number;
    scaleFactor?: number;
    className?: string;
  }

  export const CardStack: React.FC<CardStackProps>;
  
  export interface HighlightProps {
    children: React.ReactNode;
    className?: string;
  }
  
  export const Highlight: React.FC<HighlightProps>;
}
