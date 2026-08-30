import { useEffect, useState } from 'react';
import { editarPatrimonio, criarPatrimonio } from '../../services/patrimonioService.js';
import { urlImagemPatrimonio } from '../../services/imagemService.js';
import { obterUsuarioAtual } from '../../storage/usuario/dados.storage.js';

export default function ModalPatrimonio({ aberto, patrimonio, salas = [], onSalvar, onFechar }) {
    const [nome, setNome] = useState('');
    const [status, setStatus] = useState('');
    const [idSala, setIdSala] = useState('');
    const [numeroPatrimonio, setNumeroPatrimonio] = useState('');
    const [arquivo, setArquivo] = useState(null);
    const [previewImagem, setPreviewImagem] = useState(null);
    const [erro, setErro] = useState('');
    const [salvando, setSalvando] = useState(false);

    // Valida se é edição verificando se existe um ID válido no patrimônio
    const ehEdicao = Boolean(
        patrimonio &&
        Object.keys(patrimonio).length > 0 &&
        (patrimonio.id_patrimonio || patrimonio.id)
    );

    useEffect(() => {
        if (aberto && patrimonio) {
            setNome(patrimonio.nome || '');
            setStatus(patrimonio.status || '');
            setNumeroPatrimonio(patrimonio.numero_patrimonio || '');

            // Prioriza o id_sala já vindo no patrimonio (seja na criação ou edição)
            const idSalaInicial = patrimonio.id_sala ||
                salas.find((s) => s.patrimonios?.some(
                    (p) => (p.id_patrimonio || p.id) === (patrimonio.id_patrimonio || patrimonio.id)
                ))?.id_sala ||
                salas.find((s) => s.id_sala || s.id)?.id_sala ||
                salas.find((s) => s.id_sala || s.id)?.id;

            setIdSala(idSalaInicial ? String(idSalaInicial) : '');
            setArquivo(null);
            setPreviewImagem(urlImagemPatrimonio(patrimonio));
            setErro('');
            setSalvando(false);
        }
    }, [aberto, patrimonio]);

    if (!aberto || !patrimonio) return null;

    function handleImagemChange(e) {
        const file = e.target.files[0] || null;
        setArquivo(file);
        setPreviewImagem(file ? URL.createObjectURL(file) : urlImagemPatrimonio(patrimonio));
    }

    async function handleSalvar() {
        if (!nome.trim() || !status || !idSala) {
            setErro('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {
            const usuario = obterUsuarioAtual();
            const token = usuario?.token;
            if (!token) {
                setErro('Sessão expirada. Faça login novamente.');
                return;
            }

            const dadosAtualizados = new FormData();
            dadosAtualizados.append('nome', nome.trim());
            dadosAtualizados.append('status', status);
            dadosAtualizados.append('id_sala', idSala);
            if (numeroPatrimonio.trim()) dadosAtualizados.append('numero_patrimonio', numeroPatrimonio.trim());
            if (arquivo) dadosAtualizados.append('imagem', arquivo);

            setErro('');
            setSalvando(true);
            let resultado;

            if (ehEdicao) {
                const idPatrimonio = patrimonio.id_patrimonio || patrimonio.id;
                resultado = await editarPatrimonio(idPatrimonio, dadosAtualizados, token);
            } else {
                resultado = await criarPatrimonio(dadosAtualizados, token);
            }

            setSalvando(false);
            onSalvar?.(resultado?.result ?? resultado);
        } catch (erroSalvar) {
            console.error('Erro ao salvar patrimônio:', erroSalvar);
            setErro('Ocorreu um erro ao salvar as alterações. Tente novamente.');
            setSalvando(false);
        }
    }

    return (
        <div
            className="modal-overlay visible"
            onClick={(e) => { if (e.target === e.currentTarget) onFechar?.(); }}
        >
            <div className="modal-box" style={{ maxWidth: 480, height: 'auto', maxHeight: '90vh' }}>
                <div className="modal-header">
                    <h5>{ehEdicao ? 'Editar Patrimônio' : 'Adicionar Patrimônio'}</h5>
                    <button className="modal-close" aria-label="Fechar" onClick={onFechar}>&times;</button>
                </div>

                {erro && (
                    <div className="alert-error">{erro}</div>
                )}

                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label" htmlFor="patNome">
                            Nome do Patrimônio <span className="required-mark">*</span>
                        </label>
                        <input
                            type="text" id="patNome" className="form-control"
                            value={nome} onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Computador, Mesa, Cadeira"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="patStatus">
                                Status <span className="required-mark">*</span>
                            </label>
                            <select
                                id="patStatus" className="form-control"
                                value={status} onChange={(e) => setStatus(e.target.value)}
                                required
                            >
                                <option value="">Selecione</option>
                                <option value="Ok">Ok</option>
                                <option value="Danificado">Danificado</option>
                                <option value="Manutenção">Manutenção</option>
                                <option value="Descartado">Descartado</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="patSala">
                                Sala <span className="required-mark">*</span>
                            </label>
                            <select
                                id="patSala" className="form-control"
                                value={idSala} onChange={(e) => setIdSala(e.target.value)}
                                required
                            >
                                <option value="">Selecione</option>
                                {salas.map((s) => {
                                    const id = s.id_sala || s.id;
                                    return (
                                        <option key={id} value={id}>
                                            {s.descricao} (Bloco {s.bloco})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="patNumero">Número do Patrimônio</label>
                        <input
                            type="text" id="patNumero" className="form-control"
                            value={numeroPatrimonio} onChange={(e) => setNumeroPatrimonio(e.target.value)}
                            placeholder="Ex: 2024-00123"
                            maxLength={20}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Imagem do Patrimônio</label>
                        <div className="patrimonio-img-upload-row">
                            <div className="patrimonio-img-preview">
                                {previewImagem ? (
                                    <img src={previewImagem} alt={nome || 'Prévia do patrimônio'} />
                                ) : (
                                    <span className="patrimonio-img-preview-placeholder">Sem imagem</span>
                                )}
                            </div>
                            <div className="patrimonio-img-upload-controls">
                                <label className="btn-upload-imagem" htmlFor="patImagem" style={{ width: 'fit-content' }}>
                                    <ion-icon name="folder-open-outline" style={{ fontSize: '18px' }}></ion-icon>
                                    Selecionar imagem
                                </label>
                                <input
                                    type="file" id="patImagem" accept="image/*"
                                    className="foto-input"
                                    onChange={handleImagemChange}
                                />
                                <small className="form-hint">
                                    {ehEdicao ? 'Deixe em branco para manter a imagem atual.' : 'PNG, JPG ou JPEG.'}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-modal-cancel" onClick={onFechar}>Cancelar</button>
                    <button className="btn-modal-save" onClick={handleSalvar} disabled={salvando}>
                        {salvando ? 'Salvando…' : (ehEdicao ? 'Salvar Alterações' : 'Cadastrar Patrimônio')}
                    </button>
                </div>
            </div>
        </div>
    );
}
