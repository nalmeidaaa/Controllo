import { useState } from 'react';

const PERFIS = [
    { valor: 'geral', label: 'Geral' },
    { valor: 'manutencao', label: 'Manutenção' },
    { valor: 'administracao', label: 'Administração' },
];

export default function ModalAprovar({ usuario, salvando, erro, onConfirmar, onFechar }) {
    const [perfil, setPerfil] = useState('geral');

    return (
        <div
            className="modal-overlay visible"
            onClick={(e) => { if (e.target === e.currentTarget && !salvando) onFechar(); }}
        >
            <div className="modal-box" style={{ maxWidth: 440, height: 'auto', maxHeight: '90vh' }}>
                <div className="modal-header">
                    <h5>Aprovar cadastro</h5>
                    <button className="modal-close" aria-label="Fechar" onClick={onFechar} disabled={salvando}>&times;</button>
                </div>

                {erro && <div className="alert-error">{erro}</div>}

                <div className="modal-body">
                    <p style={{ marginBottom: 16 }}>
                        Escolha o perfil de acesso de <strong>{usuario.nome}</strong>.
                    </p>

                    <div className="form-group">
                        <label className="form-label" htmlFor="perfilAprovacao">Perfil</label>
                        <select
                            id="perfilAprovacao"
                            className="form-control"
                            value={perfil}
                            onChange={(e) => setPerfil(e.target.value)}
                            disabled={salvando}
                        >
                            {PERFIS.map((p) => (
                                <option key={p.valor} value={p.valor}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-modal-cancel" onClick={onFechar} disabled={salvando}>Cancelar</button>
                    <button className="btn-modal-save" onClick={() => onConfirmar(perfil)} disabled={salvando}>
                        {salvando ? 'Aprovando…' : 'Aprovar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
