import { useEffect, useState } from 'react';
import { editarPatrimonio, criarPatrimonio } from '../../services/patrimonioService.js';
import { urlImagemPatrimonio } from '../../services/imagemService.js';
import { obterUsuarioAtual } from '../../storage/usuario/dados.storage.js';

export default function ModalPatrimonio({ aberto, patrimonio, salas = [], onSalvar, onFechar }) {
    const [itens, setItens] = useState([]);
    const [idSala, setIdSala] = useState('');
    const [erro, setErro] = useState('');
    const [salvando, setSalvando] = useState(false);

    // Valida se é edição verificando se existe um ID válido no patrimônio
    const ehEdicao = Boolean(
        patrimonio &&
        Object.keys(patrimonio).length > 0 &&
        (patrimonio.id_patrimonio || patrimonio.id)
    );

    const criarNovoItem = (dadosIniciais = {}) => ({
        key: Date.now() + Math.random(),
        id_patrimonio: dadosIniciais.id_patrimonio || dadosIniciais.id || null,
        nome: dadosIniciais.nome || '',
        status: dadosIniciais.status || 'Ok',
        numeroPatrimonio: dadosIniciais.numero_patrimonio || '',
        arquivo: null,
        previewImagem: urlImagemPatrimonio(dadosIniciais)
    });

    useEffect(() => {
        if (aberto) {
            if (patrimonio && Object.keys(patrimonio).length > 0) {
                setItens([criarNovoItem(patrimonio)]);

                // Prioriza o id_sala já vindo no patrimonio (seja na criação ou edição)
                const idSalaInicial = patrimonio.id_sala ||
                    salas.find((s) => s.patrimonios?.some(
                        (p) => (p.id_patrimonio || p.id) === (patrimonio.id_patrimonio || patrimonio.id)
                    ))?.id_sala ||
                    salas.find((s) => s.id_sala || s.id)?.id_sala ||
                    salas.find((s) => s.id_sala || s.id)?.id;

                setIdSala(idSalaInicial ? String(idSalaInicial) : '');
            } else {
                setItens([criarNovoItem()]);
                const primeiraSala = salas[0]?.id_sala || salas[0]?.id || '';
                setIdSala(primeiraSala ? String(primeiraSala) : '');
            }

            setErro('');
            setSalvando(false);
        }
    }, [aberto, patrimonio, salas]);

    // Corrigido: Permite que a modal abra na criação mesmo sem a prop 'patrimonio'
    if (!aberto) return null;

    function handleAtualizarItem(index, campo, valor) {
        setItens((prev) => {
            const novos = [...prev];
            novos[index] = { ...novos[index], [campo]: valor };
            return novos;
        });
    }

    function handleImagemChange(index, e) {
        const file = e.target.files[0] || null;
        setItens((prev) => {
            const novos = [...prev];
            novos[index].arquivo = file;
            novos[index].previewImagem = file ? URL.createObjectURL(file) : urlImagemPatrimonio(novos[index]);
            return novos;
        });
    }

    function handleAdicionarOutro() {
        setItens((prev) => [...prev, criarNovoItem()]);
    }

    function handleRemoverItem(index) {
        if (itens.length === 1) return;
        setItens((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSalvar() {
        if (!idSala) {
            setErro('Por favor, selecione uma sala.');
            return;
        }

        const temInvalido = itens.some((item) => !item.nome.trim() || !item.status);
        if (temInvalido) {
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

            setErro('');
            setSalvando(true);
            const resultados = [];

            for (const item of itens) {
                const dadosAtualizados = new FormData();
                dadosAtualizados.append('nome', item.nome.trim());
                dadosAtualizados.append('status', item.status);
                dadosAtualizados.append('id_sala', idSala);
                if (item.numeroPatrimonio.trim()) dadosAtualizados.append('numero_patrimonio', item.numeroPatrimonio.trim());
                if (item.arquivo) dadosAtualizados.append('imagem', item.arquivo);

                let resultado;
                if (ehEdicao && item.id_patrimonio) {
                    resultado = await editarPatrimonio(item.id_patrimonio, dadosAtualizados, token);
                } else {
                    resultado = await criarPatrimonio(dadosAtualizados, token);
                }
                resultados.push(resultado?.result ?? resultado);
            }

            setSalvando(false);
            onSalvar?.(resultados.length === 1 ? resultados[0] : resultados);
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
            <div className="modal-box" style={{ maxWidth: 520, height: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <h5>{ehEdicao ? 'Editar Patrimônio' : 'Adicionar Patrimônio'}</h5>
                    <button className="modal-close" aria-label="Fechar" onClick={onFechar}>&times;</button>
                </div>

                {erro && (
                    <div className="alert-error" style={{ margin: '10px 20px 0' }}>{erro}</div>
                )}

                <div className="modal-body">
                    {/* Seleção de Sala */}
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label" htmlFor="patSala">
                            Sala <span className="required-mark">*</span>
                        </label>
                        <select
                            id="patSala" className="form-control"
                            value={idSala} onChange={(e) => setIdSala(e.target.value)}
                            required
                        >
                            <option value="">Selecione a sala</option>
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

                    {/* Lista de cards dos patrimônios */}
                    {itens.map((item, index) => {
                        const ehUltimo = index === itens.length - 1;

                        return (
                            <div
                                key={item.key}
                                className={`patrimonio-item-form ${!ehEdicao ? 'patrimonio-novo' : ''}`}
                                style={{ marginBottom: 16 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <span style={{ fontSize: 12, color: 'var(--vermelho-principal, #ef4444)', fontWeight: 600 }}>
                                        {ehEdicao ? `ID: ${item.id_patrimonio}` : 'Novo patrimônio'}
                                    </span>
                                    {itens.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn-remover-patrimonio"
                                            onClick={() => handleRemoverItem(index)}
                                            title="Remover"
                                            aria-label="Remover patrimônio"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                <div className="form-row" style={{ marginBottom: 10 }}>
                                    <div>
                                        <label className="form-label-edit">
                                            Nome do Item <span className="required-mark">*</span>
                                        </label>
                                        <input
                                            type="text" className="form-input-edit"
                                            value={item.nome}
                                            onChange={(e) => handleAtualizarItem(index, 'nome', e.target.value)}
                                            placeholder="Ex: Cadeira Pro"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label-edit">Status</label>
                                        <select
                                            className="form-input-edit"
                                            value={item.status}
                                            onChange={(e) => handleAtualizarItem(index, 'status', e.target.value)}
                                        >
                                            <option value="Ok">Ok</option>
                                            <option value="Pendente">Pendente</option>
                                            <option value="Danificado">Danificado</option>
                                            <option value="Manutenção">Manutenção</option>
                                            <option value="Descartado">Descartado</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group-edit" style={{ marginBottom: 10 }}>
                                    <label className="form-label-edit">Número do Patrimônio</label>
                                    <input
                                        type="text" className="form-input-edit"
                                        value={item.numeroPatrimonio}
                                        onChange={(e) => handleAtualizarItem(index, 'numeroPatrimonio', e.target.value)}
                                        placeholder="Ex: 2024-00123"
                                        maxLength={20}
                                    />
                                </div>

                                <div className="form-group-edit" style={{ marginBottom: 0 }}>
                                    <label className="form-label-edit">
                                        {!ehEdicao ? 'Foto' : 'Foto (substituir)'}
                                    </label>
                                    <div className="patrimonio-img-upload-row">
                                        <div className="patrimonio-img-preview">
                                            {item.previewImagem ? (
                                                <img src={item.previewImagem} alt={item.nome || 'Prévia'} />
                                            ) : (
                                                <span className="patrimonio-img-preview-placeholder">Sem foto</span>
                                            )}
                                        </div>
                                        <div className="patrimonio-img-upload-controls">
                                            <label className="btn-upload-imagem" htmlFor={`foto-patrimonio-${index}`} style={{ width: 'fit-content' }}>
                                                <ion-icon name="folder-open-outline" style={{ fontSize: '18px' }}></ion-icon>
                                                Selecionar foto
                                            </label>
                                            <input
                                                type="file" id={`foto-patrimonio-${index}`} accept="image/*"
                                                className="foto-input"
                                                onChange={(e) => handleImagemChange(index, e)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Botão para adicionar o próximo patrimônio dentro do card */}
                                {!ehEdicao && ehUltimo && (
                                    <button
                                        type="button"
                                        onClick={handleAdicionarOutro}
                                        style={{
                                            marginTop: 12,
                                            width: '100%',
                                            padding: '4px 8px',
                                            height: '32px',
                                            backgroundColor: 'var(--vermelho-principal, #ef4444)', // Fundo vermelho
                                            border: 'none', // Remove a borda pontilhada
                                            color: '#ffffff', // Letras brancas
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <span>+</span> Adicionar outro patrimônio
                                    </button>
                                )}
                            </div>
                        );
                    })}
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