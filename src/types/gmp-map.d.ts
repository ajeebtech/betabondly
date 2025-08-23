import 'react';

declare namespace JSX {
  interface IntrinsicElements {
    'gmp-map': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        center?: string;
        zoom?: string | number;
        'map-id'?: string;
        style?: React.CSSProperties;
      },
      HTMLElement
    >;
  }
}
