import { useEffect, useState } from 'react';
import { iniciaisDoNome } from '../../utils/usuario.js';
import './Avatar.css';

// Gradientes da identidade visual; a cor é escolhida pelo nome (sempre a mesma pessoa = mesma cor)
const PALETA = [
    ['#ff5a66', '#b01d2e'], // vermelho (marca)
    ['#fb923c', '#c2410c'], // laranja
    ['#2dd4bf', '#0f766e'], // verde-água
    ['#818cf8', '#4338ca'], // índigo
    ['#c084fc', '#7e22ce'], // violeta
    ['#64748b', '#334155'], // grafite
];

function indicePorNome(nome) {
    let h = 0;
    for (const c of String(nome || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h % PALETA.length;
}

export default function Avatar({ nome, src, tamanho = 36, className = '', ...resto }) {
    const [falhou, setFalhou] = useState(false);

    // nova foto -> tenta carregar de novo
    useEffect(() => setFalhou(false), [src]);

    const iniciais = iniciaisDoNome(nome);
    const mostrarFoto = Boolean(src) && !falhou;
    const [de, ate] = PALETA[indicePorNome(nome)];

    return (
        <span
            className={`avatar ${mostrarFoto ? 'avatar--foto' : 'avatar--iniciais'} ${className}`}
            style={{
                '--avatar-size': `${tamanho}px`,
                ...(mostrarFoto ? null : { backgroundImage: `linear-gradient(135deg, ${de}, ${ate})` }),
            }}
            {...resto}
        >
            {mostrarFoto ? (
                <img src={src} alt={nome ? `Foto de ${nome}` : 'Foto de perfil'} onError={() => setFalhou(true)} draggable={false} />
            ) : iniciais ? (
                <span className="avatar__letras" aria-hidden="true">{iniciais}</span>
            ) : (
                <ion-icon name="person" aria-hidden="true"></ion-icon>
            )}
        </span>
    );
}
