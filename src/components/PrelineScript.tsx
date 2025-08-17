'use client';

import { useEffect } from 'react';

export default function PrelineScript() {
  useEffect(() => {
    // @ts-ignore
    import('preline');
  }, []);

  return null;
}
