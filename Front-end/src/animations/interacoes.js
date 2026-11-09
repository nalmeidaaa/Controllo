import { gsap, suportaHover } from './gsap.js';

/*
 * Micro-interações globais (delegação de eventos no document):
 *  - tilt 3D + brilho que segue o mouse nos cards
 *  - "press" elástico em botões e cards
 *  - pulso de clique nos botões primários
 * Tudo é configurado uma única vez e devolve a função de limpeza.
 */

const ALVOS_TILT = '.menu-card, .sala-card-item:not(.sala-card-desativada)';
const ALVOS_PRESS = 'button:not(:disabled):not(.modal-close), .menu-card, [role="button"]';
const BOTOES_PULSO = '.btn-submit, .btn-primary-custom, .btn-modal-save, .btn-action';

function pulso(x, y) {
    const d = document.createElement('div');
    d.className = 'g-pulso';
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    document.body.appendChild(d);
    gsap.fromTo(
        d,
        { scale: 0.2, opacity: 0.55 },
        { scale: 1.4, opacity: 0, duration: 0.65, ease: 'power2.out', onComplete: () => d.remove() }
    );
}

export function iniciarInteracoes() {
    const hover = suportaHover();
    const limpar = [];
    const ouvir = (tipo, fn, opts) => {
        document.addEventListener(tipo, fn, opts);
        limpar.push(() => document.removeEventListener(tipo, fn, opts));
    };

    /* ── TILT ─────────────────────────────────────────────── */
    if (hover) {
        ouvir('pointermove', (e) => {
            if (e.pointerType !== 'mouse') return;
            const card = e.target.closest?.(ALVOS_TILT);
            if (!card || card.classList.contains('g-anim')) return;

            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;

            card.style.setProperty('--mx', `${px * 100}%`);
            card.style.setProperty('--my', `${py * 100}%`);

            gsap.to(card, {
                rotationY: (px - 0.5) * 8,
                rotationX: (0.5 - py) * 8,
                y: -4,
                transformPerspective: 900,
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto',
            });
        });

        ouvir('pointerover', (e) => {
            const card = e.target.closest?.('.menu-card');
            if (!card || card.contains(e.relatedTarget)) return;
            const icone = card.querySelector('.card-icon');
            if (icone) gsap.to(icone, { rotation: -8, scale: 1.14, duration: 0.45, ease: 'back.out(3)', overwrite: 'auto' });
        });

        ouvir('pointerout', (e) => {
            const card = e.target.closest?.(ALVOS_TILT);
            if (!card || card.contains(e.relatedTarget)) return;

            if (!card.classList.contains('g-anim')) {
                gsap.to(card, {
                    rotationX: 0,
                    rotationY: 0,
                    y: 0,
                    duration: 0.8,
                    ease: 'elastic.out(1, 0.5)',
                    overwrite: 'auto',
                    clearProps: 'transform',
                });
            }
            const icone = card.querySelector('.card-icon');
            if (icone) gsap.to(icone, { rotation: 0, scale: 1, duration: 0.5, ease: 'back.out(2)', overwrite: 'auto' });
        });
    }

    /* ── PRESS ────────────────────────────────────────────── */
    let pressionado = null;

    ouvir('pointerdown', (e) => {
        if (e.button > 0) return;
        const el = e.target.closest?.(ALVOS_PRESS);
        if (!el || el.disabled) return;

        pressionado = el;
        el.classList.add('g-anim');
        gsap.to(el, {
            scale: el.matches('.menu-card, .sala-card-item') ? 0.985 : 0.94,
            duration: 0.12,
            ease: 'power2.out',
            overwrite: 'auto',
        });

        if (el.matches(BOTOES_PULSO)) pulso(e.clientX, e.clientY);
    }, true);

    const soltar = () => {
        if (!pressionado) return;
        const el = pressionado;
        pressionado = null;
        gsap.to(el, {
            scale: 1,
            duration: 0.55,
            ease: 'elastic.out(1, 0.45)',
            clearProps: 'scale',
            onComplete: () => el.classList.remove('g-anim'),
        });
    };
    ouvir('pointerup', soltar, true);
    ouvir('pointercancel', soltar, true);

    return () => limpar.forEach((fn) => fn());
}
