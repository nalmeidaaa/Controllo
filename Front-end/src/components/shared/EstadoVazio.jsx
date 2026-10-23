import './kit.css';
/*
 * Estado vazio ou de erro padronizado.
 * tom: 'neutro' | 'erro' · acao: { rotulo, onClick } opcional
 */
export default function EstadoVazio({
    icone = 'file-tray-outline',
    titulo,
    descricao,
    tom = 'neutro',
    textoAcao,
    onAcao
}) {
    return (
        <div
            className={`kit-estado${tom === 'erro' ? ' kit-estado--erro' : ''}`}
            role={tom === 'erro' ? 'alert' : 'status'}
        >
            <ion-icon
                class="kit-estado-icone"
                name={tom === 'erro' ? 'warning-outline' : icone}
            ></ion-icon>
            {titulo && <p className="kit-estado-titulo">{titulo}</p>}
            {descricao && <p className="kit-estado-desc">{descricao}</p>}
            {textoAcao && onAcao && (
                <button type="button" className="btn-modal-cancel kit-estado-acao" onClick={onAcao}>
                    {textoAcao}
                </button>
            )}
        </div>
    );
}
