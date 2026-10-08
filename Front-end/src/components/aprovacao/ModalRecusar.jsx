export default function ModalRecusar({ usuario, salvando, erro, onConfirmar, onFechar }) {
    return (
        <div
            className="modal-overlay visible"
            onClick={(e) => { if (e.target === e.currentTarget && !salvando) onFechar(); }}
        >
            <div className="modal-box" style={{ maxWidth: 440, height: 'auto', maxHeight: '90vh' }}>
                <div className="modal-header">
                    <h5>Recusar cadastro</h5>
                    <button className="modal-close" aria-label="Fechar" onClick={onFechar} disabled={salvando}>&times;</button>
                </div>

                {erro && <div className="alert-error">{erro}</div>}

                <div className="modal-body">
                    <p>
                        Deseja recusar o cadastro de <strong>{usuario.nome}</strong>? O cadastro será excluído e
                        essa ação não pode ser desfeita.
                    </p>
                </div>

                <div className="modal-footer">
                    <button className="btn-modal-cancel" onClick={onFechar} disabled={salvando}>Cancelar</button>
                    <button className="btn-modal-save" onClick={onConfirmar} disabled={salvando}>
                        {salvando ? 'Recusando…' : 'Recusar cadastro'}
                    </button>
                </div>
            </div>
        </div>
    );
}
