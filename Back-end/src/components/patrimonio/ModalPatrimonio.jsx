import { useEffect, useState } from 'react';
import { editarPatrimonio, criarPatrimonio } from '../../services/patrimonioService.js';
import { obterUsuarioAtual } from '../../storage/usuario/dados.storage.js';

export default function ModalPatrimonio({ aberto, patrimonio, salas = [], onSalvar, onFechar }) {
    const [nome, setNome] = useState('');
    const [status, setStatus] = useState('');
    const [idSala, setIdSala] = useState('');
    const [numeroPatrimonio, setNumeroPatrimonio] = useState('');
    const [arquivo, setArquivo] = useState(null);
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
            setSalvando(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aberto, patrimonio]);

    if (!aberto || !patrimonio) return null;

    async function handleSalvar() {
        if (!nome.trim() || !status || !idSala) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        try {
            const usuario = obterUsuarioAtual();
            const token = usuario?.token;
            if (!token) {
                alert('Sessão expirada. Faça login novamente.');
                return;
            }

            const dadosAtualizados = new FormData();
            dadosAtualizados.append('nome', nome.trim());
            dadosAtualizados.append('status', status);
            dadosAtualizados.append('id_sala', idSala);
            if (numeroPatrimonio.trim()) dadosAtualizados.append('numero_patrimonio', numeroPatrimonio.trim());
            if (arquivo) dadosAtualizados.append('imagem', arquivo);

            setSalvando(true);
            let resultado;

            if (ehEdicao) {
                const idPatrimonio = patrimonio.id_patrimonio || patrimonio.id;
                resultado = await editarPatrimonio(idPatrimonio, dadosAtualizados, token);
                alert('Patrimônio atualizado com sucesso!');
            } else {
                resultado = await criarPatrimonio(dadosAtualizados, token);
                alert('Patrimônio cadastrado com sucesso!');
            }

            setSalvando(false);
            onSalvar?.(resultado);
        } catch (erro) {
            console.error('Erro ao salvar patrimônio:', erro);
            alert('Ocorreu um erro ao salvar as alterações. Tente novamente.');
            setSalvando(false);
        }
    }

    return (
        <div
            className="modal-overlay-editar-patrimonio"
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: 20, boxSizing: 'border-box' }}
            onClick={(e) => { if (e.target === e.currentTarget) onFechar?.(); }}
        >
            <div
                className="modal-content-editar-patrimonio"
                style={{ background: '#fff', width: '100%', maxWidth: 500, borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'sans-serif', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
            >
                <div style={{ padding: 20, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: 20, color: '#333' }}>
                        {ehEdicao ? 'Editar Patrimônio' : 'Adicionar Patrimônio'}
                    </h2>
                    <button onClick={onFechar} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: 24, color: '#888' }}>&times;</button>
                </div>

                <div style={{ padding: 20, overflowY: 'auto', flexGrow: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: 5, fontWeight: 500, color: '#333' }}>Nome do Patrimônio *</label>
                            <input
                                type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                                placeholder="Ex: Computador, Mesa, Cadeira"
                                style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: 14 }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: 5, fontWeight: 500, color: '#333' }}>Status *</label>
                            <select
                                value={status} onChange={(e) => setStatus(e.target.value)}
                                style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: 14 }}
                                required
                            >
                                <option value="">Selecione um status</option>
                                <option value="Ok">Ok</option>
                                <option value="Danificado">Danificado</option>
                                <option value="Manutenção">Manutenção</option>
                                <option value="Descartado">Descartado</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: 5, fontWeight: 500, color: '#333' }}>Sala *</label>
                            <select
                                value={idSala} onChange={(e) => setIdSala(e.target.value)}
                                style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: 14 }}
                                required
                            >
                                <option value="">Selecione uma sala</option>
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

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: 5, fontWeight: 500, color: '#333' }}>Número do Patrimônio</label>
                            <input
                                type="text" value={numeroPatrimonio} onChange={(e) => setNumeroPatrimonio(e.target.value)}
                                placeholder="Ex: 2024-00123"
                                maxLength={20}
                                style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: 14 }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: 5, fontWeight: 500, color: '#333' }}>Imagem do Patrimônio</label>
                            <input
                                type="file" accept="image/*"
                                onChange={(e) => setArquivo(e.target.files[0] || null)}
                                style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: 14 }}
                            />
                            {ehEdicao && <small style={{ color: '#666', marginTop: 5 }}>Deixe em branco para manter a imagem atual</small>}
                        </div>
                    </div>
                </div>

                <div style={{ padding: '15px 20px', borderTop: '1px solid #eee', background: '#fafafa', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={onFechar} style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
                    <button
                        onClick={handleSalvar} disabled={salvando}
                        style={{ padding: '8px 16px', border: 'none', background: '#dc2626', color: 'white', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {salvando ? 'Salvando...' : (ehEdicao ? 'Salvar Alterações' : 'Cadastrar Patrimônio')}
                    </button>
                </div>
            </div>
        </div>
    );
}