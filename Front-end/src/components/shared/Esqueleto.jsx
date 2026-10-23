import './kit.css';
export function EsqueletoBloco({ largura = '100%', altura = 16, raio = 'var(--raio-sm)', className = '' }) {
    return (
        <span
            className={`kit-esqueleto ${className}`.trim()}
            aria-hidden="true"
            style={{ width: largura, height: altura, borderRadius: raio }}
        />
    );
}

export function EsqueletoLinhas({ quantidade = 5, altura = 72 }) {
    return (
        <div className="kit-esqueleto-linhas" role="status" aria-label="Carregando">
            {Array.from({ length: quantidade }, (_, i) => (
                <EsqueletoBloco key={i} altura={altura} raio="var(--raio)" />
            ))}
        </div>
    );
}
