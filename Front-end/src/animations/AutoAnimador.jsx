import { useEffect } from 'react';
import { gsap, reduzMovimento } from './gsap.js';
import { iniciarInteracoes } from './interacoes.js';

/*
 * Anima automaticamente tudo o que entra na tela.
 *
 * Um MutationObserver enxerga os elementos que o React insere (páginas, linhas
 * de tabela, cards, modais, mensagens de erro...) e dispara a entrada certa para
 * cada um. Assim as animações cobrem também o que chega depois de uma chamada
 * à API ou de uma troca de página, sem editar cada componente.
 *
 * Para incluir um elemento novo, basta adicionar uma regra em REGRAS.
 * Para excluir uma área, coloque data-sem-auto no elemento pai.
 */

const SEL_OVERLAY = '.modal-overlay, .modal-overlay-visualizar, .historico-modal-overlay, .transfer-modal-overlay';
const SEL_GAVETA = '.perfil-drawer-overlay';
const SEL_ERRO = '.alert-error, .kit-modal-erro, .aprov-mensagem.erro';

/** Entrada de elementos. Desliga as transições CSS enquanto o GSAP trabalha. */
function entrar(els, vars) {
    const lista = els.filter((el) => el.isConnected && !el.dataset.gEntrou);
    if (!lista.length) return;

    lista.forEach((el) => {
        el.dataset.gEntrou = '1';
        el.classList.add('g-anim');
    });

    gsap.from(lista, {
        clearProps: 'transform,opacity,filter',
        ...vars,
        onComplete: () => lista.forEach((el) => el.classList.remove('g-anim')),
    });
}

function animarAlerta(el) {
    if (el.dataset.gEntrou) return;
    el.dataset.gEntrou = '1';
    el.classList.add('g-anim');

    const tl = gsap.timeline({ onComplete: () => el.classList.remove('g-anim') });
    tl.from(el, { y: -12, opacity: 0, duration: 0.35, clearProps: 'opacity' });
    if (el.matches(SEL_ERRO)) {
        tl.to(el, {
            keyframes: [
                { x: -9, duration: 0.07 },
                { x: 9, duration: 0.07 },
                { x: -6, duration: 0.07 },
                { x: 6, duration: 0.07 },
                { x: 0, duration: 0.07 },
            ],
            clearProps: 'transform',
        }, 0.12);
    } else {
        tl.set(el, { clearProps: 'transform' });
    }
}

function animarModal(overlay) {
    if (overlay.dataset.gEntrou) return;
    overlay.dataset.gEntrou = '1';

    const caixa = overlay.firstElementChild;
    const itens = caixa
        ? [...caixa.querySelectorAll('.modal-body > *, .modal-footer > *, .historico-modal-header > *')]
        : [];

    [overlay, caixa].forEach((el) => el?.classList.add('g-anim'));

    const tl = gsap.timeline({
        onComplete: () => [overlay, caixa].forEach((el) => el?.classList.remove('g-anim')),
    });

    tl.from(overlay, { opacity: 0, duration: 0.25, ease: 'power1.out', clearProps: 'opacity' });
    if (caixa) {
        tl.from(caixa, {
            y: 50,
            scale: 0.9,
            opacity: 0,
            duration: 0.55,
            ease: 'back.out(1.6)',
            clearProps: 'transform,opacity',
        }, 0.03);
    }
    if (itens.length) {
        tl.from(itens, {
            y: 14,
            opacity: 0,
            duration: 0.4,
            stagger: { amount: 0.3 },
            clearProps: 'transform,opacity',
        }, 0.18);
    }
}

function animarGaveta(overlay) {
    const alvos = overlay.querySelectorAll('.perfil-drawer-header, .perfil-drawer-body > *, .perfil-drawer-footer');
    if (!alvos.length) return;
    gsap.from(alvos, {
        x: 36,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        delay: 0.12,
        clearProps: 'transform,opacity',
    });
}

/*
 * s: seletor · vars: estado inicial (gsap.from) · stagger/maxTotal: escalonamento
 * modal: true permite animar também dentro de modais
 */
const REGRAS = [
    { s: '.dashboard-welcome h1', vars: { y: 34, opacity: 0, filter: 'blur(10px)', duration: 0.9 } },
    { s: '.dashboard-welcome .welcome-sub', vars: { y: 22, opacity: 0, duration: 0.7, delay: 0.15 } },
    { s: '.header-usuarios', vars: { y: -20, opacity: 0, duration: 0.6 } },
    { s: '.dashboard-section-label', vars: { x: -20, opacity: 0, duration: 0.6, delay: 0.25 } },
    {
        s: '.menu-card, .sala-card-item, .hist-kpi',
        vars: { y: 42, scale: 0.92, opacity: 0, duration: 0.75, ease: 'back.out(1.5)', delay: 0.2 },
        stagger: 0.08,
        maxTotal: 0.7,
    },
    {
        s: '.tabela-card, .hist-card, .filtros-barra, .hist-filtros, .kit-abas, .salas-abas, .salas-selecao-header, .kit-estado, .aprov-estado, .hist-estado, .paginacao-nav',
        vars: { y: 26, opacity: 0, duration: 0.6, delay: 0.1 },
        stagger: 0.07,
        maxTotal: 0.4,
    },
    {
        s: '.tabela-card tbody tr',
        modal: true,
        vars: { x: -26, opacity: 0, duration: 0.5, delay: 0.2 },
        stagger: 0.04,
        maxTotal: 0.6,
    },
    {
        s: '.hist-item:not(.hist-item--esqueleto), .historico-item',
        modal: true,
        vars: { y: 16, opacity: 0, duration: 0.45, delay: 0.1 },
        stagger: 0.03,
        maxTotal: 0.5,
    },
    { s: '.hist-grupo-titulo', vars: { x: -16, opacity: 0, duration: 0.5, delay: 0.1 } },
    {
        s: '.form-group, .form-section-header',
        vars: { y: 18, opacity: 0, duration: 0.5, delay: 0.15 },
        stagger: 0.05,
        maxTotal: 0.5,
    },
    { s: '.alert-error, .aprov-mensagem, .hist-aviso, .kit-modal-erro', modal: true, alerta: true },
];

const SEL_TODAS = REGRAS.map((r) => r.s).join(',');
const SEL_ANY_OVERLAY = `${SEL_OVERLAY}, ${SEL_GAVETA}`;

function processar(nos) {
    const porRegra = REGRAS.map(() => new Set());
    const overlays = new Set();

    nos.forEach((no) => {
        if (!no.isConnected || no.nodeType !== 1) return;

        if (no.matches(SEL_OVERLAY)) overlays.add(no);
        no.querySelectorAll(SEL_OVERLAY).forEach((o) => overlays.add(o));

        if (!no.matches(SEL_TODAS) && !no.querySelector(SEL_TODAS)) return;
        REGRAS.forEach((r, i) => {
            if (no.matches(r.s)) porRegra[i].add(no);
            no.querySelectorAll(r.s).forEach((el) => porRegra[i].add(el));
        });
    });

    overlays.forEach(animarModal);

    REGRAS.forEach((r, i) => {
        const els = [...porRegra[i]].filter((el) => {
            if (!r.alerta && el.closest('[data-sem-auto]')) return false;
            if (!r.modal && el.closest(SEL_ANY_OVERLAY)) return false;
            return true;
        });
        if (!els.length) return;

        if (r.alerta) {
            els.forEach(animarAlerta);
            return;
        }

        const vars = { ...r.vars };
        if (r.stagger) vars.stagger = Math.min(r.stagger, (r.maxTotal || 0.6) / els.length);
        entrar(els, vars);
    });
}

export default function AutoAnimador() {
    useEffect(() => {
        if (reduzMovimento()) return undefined;

        const pararInteracoes = iniciarInteracoes();

        const observer = new MutationObserver((registros) => {
            const novos = [];
            registros.forEach((rec) => {
                if (rec.type === 'childList') {
                    rec.addedNodes.forEach((n) => { if (n.nodeType === 1) novos.push(n); });
                } else if (rec.type === 'attributes') {
                    const alvo = rec.target;
                    const abriu =
                        alvo.matches?.(SEL_GAVETA) &&
                        alvo.classList.contains('visible') &&
                        !(rec.oldValue || '').includes('visible');
                    if (abriu) animarGaveta(alvo);
                }
            });
            if (novos.length) processar(novos);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class'],
            attributeOldValue: true,
        });

        // elementos que já estavam na tela quando o observador começou
        const raiz = document.getElementById('root');
        if (raiz) processar([raiz]);

        return () => {
            observer.disconnect();
            pararInteracoes();
        };
    }, []);

    return null;
}
