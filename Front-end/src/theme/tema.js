import { useCallback, useEffect, useState } from 'react';

const CHAVE = 'controllo_tema';

export function temaSalvo() {
    try {
        const t = localStorage.getItem(CHAVE);
        if (t === 'dark' || t === 'light') return t;
    } catch { /* storage indisponível */ }
    return 'light';
}

export function aplicarTema(tema) {
    const raiz = document.documentElement;
    raiz.setAttribute('data-theme', tema);
    raiz.setAttribute('data-bs-theme', tema); // faz o Bootstrap acompanhar
}

export function definirTema(tema) {
    aplicarTema(tema);
    try { localStorage.setItem(CHAVE, tema); } catch { /* ignora */ }
    window.dispatchEvent(new CustomEvent('tema-alterado', { detail: tema }));
}

export function useTema() {
    const [tema, setTema] = useState(
        () => document.documentElement.getAttribute('data-theme') || temaSalvo()
    );

    useEffect(() => {
        const aoMudar = (e) => setTema(e.detail);
        window.addEventListener('tema-alterado', aoMudar);
        return () => window.removeEventListener('tema-alterado', aoMudar);
    }, []);

    const alternar = useCallback(
        () => definirTema(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'),
        []
    );

    return { tema, escuro: tema === 'dark', alternar };
}
