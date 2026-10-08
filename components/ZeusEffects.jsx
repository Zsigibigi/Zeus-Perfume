'use client';

import { useEffect } from 'react';
import { initZeus } from '../lib/zeus';

// Az összes animációt (intro, villámok, 3D palackok) a böngészőben indítja el.
export default function ZeusEffects() {
  useEffect(() => {
    initZeus();
  }, []);
  return null;
}
