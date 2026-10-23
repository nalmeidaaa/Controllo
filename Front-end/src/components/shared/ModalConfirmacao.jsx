import './kit.css';
import { useEffect } from 'react';

/*
 * Substitui confirm(). Reaproveita as classes de modal existentes.
 * Esc e clique fora cancelam (exceto enquanto `carregando`).
 */
export default function ModalConfirmacao({
    aberto,
    titulo,
    mensagem,
    textoConfirmar = 'Confirmar',
    textoCancelar = 'Cancelar',
    carregando = false,
    erro = '',
    onConfirmar,
    onCancelar,
    children
}) {
    useEffect(() => {
        if (!aberto) return undefined;

        function onKey(e) {
            if (e.key === 'Escape' && !carregando) onCancelar?.();
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [aberto, carregando, onCancelar]);

    if (!aberto) return null;

    return (
        <div
            className="modal-overlay visible"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !carregando) onCancelar?.();
            }}
        >
            <div
                className="modal-box kit-modal-box"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="kit-modal-titulo"
                aria-describedby="kit-modal-msg"
            >
                <div className="modal-header">
                    <h5 id="kit-modal-titulo">{titulo}</h5>
                    <button
                        type="button"
                        className="modal-close"
                        aria-label="Fechar"
                        disabled={carregando}
                        onClick={onCancelar}
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    {mensagem && <p id="kit-modal-msg" className="kit-modal-msg">{mensagem}</p>}
                    {children}
                    {erro && <p className="kit-modal-erro" role="alert">{erro}</p>}
                </div>

                <div className="modal-footer kit-modal-footer">
                    <button
                        type="button"
                        className="btn-modal-cancel"
                        disabled={carregando}
                        onClick={onCancelar}
                        autoFocus
                    >
                        {textoCancelar}
                    </button>
                    <button
                        type="button"
                        className="btn-modal-save"
                        disabled={carregando}
                        onClick={onConfirmar}
                    >
                        {carregando ? 'Aguarde…' : textoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
}
