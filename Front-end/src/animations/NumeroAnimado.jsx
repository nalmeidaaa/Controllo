import { useRef } from 'react';
import { gsap, useGSAP, reduzMovimento } from './gsap.js';

const formatarPadrao = (n) => n.toLocaleString('pt-BR');

/**
 * Número que "conta" até o valor final sempre que `valor` muda.
 * O texto é escrito direto no DOM pelo GSAP (o span não tem filhos do React).
 */
export default function NumeroAnimado({ valor, formatar = formatarPadrao, duracao = 1.1, className = '' }) {
    const ref = useRef(null);
    const atual = useRef(0);

    useGSAP(() => {
        const alvo = Number(valor) || 0;
        const el = ref.current;
        if (!el) return;

        if (reduzMovimento()) {
            atual.current = alvo;
            el.textContent = formatar(alvo);
            return;
        }

        const obj = { n: atual.current };
        gsap.to(obj, {
            n: alvo,
            duration: duracao,
            ease: 'power2.out',
            onUpdate() {
                atual.current = obj.n;
                el.textContent = formatar(Math.round(obj.n));
            },
            onComplete() {
                atual.current = alvo;
                el.textContent = formatar(alvo);
            },
        });
    }, { dependencies: [valor], revertOnUpdate: true });

    return <span ref={ref} className={className} />;
}
