import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

gsap.defaults({ ease: 'power3.out', duration: 0.6 });

/** Usuário pediu menos movimento no sistema operacional? */
export const reduzMovimento = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Mouse de verdade (não toque)? Usado nos efeitos de hover. */
export const suportaHover = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export { gsap, useGSAP };
