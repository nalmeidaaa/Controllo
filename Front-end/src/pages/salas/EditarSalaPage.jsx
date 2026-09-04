import { useEffect, useRef, useState } from 'react';
import { obterSalaComPatrimonios, editarSala } from '../../services/salaService.js';
import { obterToken } from '../../storage/usuario/dados.storage.js';
import { urlImagemSala } from '../../services/imagemService.js';
import PatrimonioFormRow from '../../components/salas/PatrimonioFormRow.jsx';

let contadorLinhas = 0;
function novaChave() { return `linha-${Date.now()}-${contadorLinhas++}`; }

export default function EditarSalaPage({ navegarPara, idSala }) {
    const token = obterToken();

    const [carregando, setCarregando] = useState(true);
    const [erroCarregar, setErroCarregar] = useState(false);
    const [sala, setSala] = useState(null);
    const [idSalaReal, setIdSalaReal] = useState(null);

    const [descricao, setDescricao] = useState('');
    const [bloco, setBloco] = useState('');
    const [arquivoImagem, setArquivoImagem] = useState(null);
    const [previewImagem, setPreviewImagem] = useState(null);
    const [linhas, setLinhas] = useState([]);

    const [erro, setErro] = useState('');
    const [salvando, setSalvando] = useState(false);

    const fileReaderRef = useRef(null);

    const voltarParaSalas = () => navegarPara.salas();

    useEffect(() => {
        async function carregar() {
            try {
                setCarregando(true);
                setErroCarregar(false);
                const dados = await obterSalaComPatrimonios(idSala, token);
                const raw = dados.result ?? dados;
                const salaCarregada = Array.isArray(raw) ? raw[0] : raw;

                setSala(salaCarregada);
                setIdSalaReal(salaCarregada.id_sala ?? salaCarregada.id ?? salaCarregada.idSala ?? null);
                setDescricao(salaCarregada.descricao || '');
                setBloco(String(salaCarregada.bloco ?? ''));
                setPreviewImagem(urlImagemSala(salaCarregada));
                setLinhas((salaCarregada.patrimonios || []).map((p) => ({
                    chave: novaChave(),
                    idPatrimonio: p.id_patrimonio ?? p.id ?? '',
                    nome: p.nome || '',
                    status: p.status || 'Ok',
                    numeroPatrimonio: p.numero_patrimonio || '',
                    caminhoImagem: p.caminho_imagem || null,
                    arquivoFoto: null,
                    previewFoto: null,
                    novo: false,
                })));
            } catch (error) {
                console.error('Erro ao carregar sala:', error);
                setErroCarregar(true);
            } finally {
                setCarregando(false);
            }
        }
        if (token) carregar();
    }, [idSala]);

    if (!token) {
        return <div className="sala-empty"><div>🔒</div><p>Sessão inválida. Faça login novamente.</p></div>;
    }

    if (carregando) {
        return (
            <div className="page-salas-container">
                <div className="editar-sala-loading">
                    <div className="loading-spinner"></div>
                    <p>Carregando dados da sala...</p>
                </div>
            </div>
        );
    }

    if (erroCarregar || !sala) {
        return (
            <div className="page-salas-container">
                <div className="sala-empty">
                    <div>⚠️</div>
                    <p>Não foi possível carregar a sala. <button className="btn-link" onClick={voltarParaSalas}>Voltar</button></p>
                </div>
            </div>
        );
    }

    function handleImagemChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setArquivoImagem(file);
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewImagem(ev.target.result);
        reader.readAsDataURL(file);
    }

    function adicionarPatrimonio() {
        setLinhas((atual) => [...atual, {
            chave: novaChave(), idPatrimonio: '', nome: '', status: 'Ok', numeroPatrimonio: '',
            caminhoImagem: null, arquivoFoto: null, previewFoto: null, novo: true,
        }]);
    }

    function removerPatrimonio(chave) {
        setLinhas((atual) => atual.filter((l) => l.chave !== chave));
    }

    function atualizarLinha(linhaAtualizada) {
        setLinhas((atual) => atual.map((l) => (l.chave === linhaAtualizada.chave ? linhaAtualizada : l)));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErro('');

        let valido = true;
        const descTrim = descricao.trim();
        const blocoTrim = bloco.trim();

        if (!descTrim) valido = false;
        if (!blocoTrim) valido = false;

        const nomeInvalido = (l) => !l.nome.trim() || l.nome.trim().length < 3;
        const linhasInvalidas = linhas.filter(nomeInvalido);
        if (linhasInvalidas.length > 0) {
            setLinhas((atual) => atual.map((l) => ({ ...l, erro: nomeInvalido(l) })));
            setErro('Todos os patrimônios precisam de um nome com pelo menos 3 caracteres.');
            valido = false;
        }

        if (!valido) {
            if (!descTrim || !blocoTrim) setErro((e) => e || 'Descrição e Bloco são obrigatórios.');
            return;
        }

        if (!idSalaReal) {
            setErro('ID da sala não encontrado. Não é possível salvar.');
            return;
        }

        try {
            setSalvando(true);

            const patrimoniosMeta = [];
            const fotosPorIndice = [];

            linhas.forEach((linha) => {
                const indice = patrimoniosMeta.length;
                patrimoniosMeta.push({
                    ...(linha.idPatrimonio ? { id_patrimonio: linha.idPatrimonio } : {}),
                    nome: linha.nome.trim(),
                    status: linha.status,
                    numero_patrimonio: linha.numeroPatrimonio?.trim() || null,
                });
                if (linha.arquivoFoto) fotosPorIndice.push({ indice, arquivo: linha.arquivoFoto });
            });

            const formData = new FormData();
            formData.append('descricao', descTrim);
            formData.append('bloco', blocoTrim);
            if (arquivoImagem) formData.append('imagem_sala', arquivoImagem);
            formData.append('patrimonios', JSON.stringify(patrimoniosMeta));
            fotosPorIndice.forEach(({ indice, arquivo }) => formData.append(`foto_${indice}`, arquivo));

            await editarSala(idSalaReal, formData, token);
            navegarPara.visualizarSala(idSalaReal);
        } catch (error) {
            const msg = error?.response?.data?.errorMessage
                || error?.response?.data?.erro
                || error?.response?.data?.mensagem
                || error?.response?.data?.message
                || 'Erro ao salvar as alterações. Tente novamente.';
            setErro(msg);
            console.error('[editarSala] Erro ao salvar:', error);
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="page-salas-container">
            <header className="header-usuarios" style={{ marginBottom: 28 }}>
                <div>
                    <div className="breadcrumb-nav">
                        <button className="breadcrumb-link" onClick={voltarParaSalas}>Salas</button>
                        <span className="breadcrumb-sep">›</span>
                        <span className="breadcrumb-current">Editar Sala</span>
                    </div>
                    <h1>Editar Sala</h1>
                    <p className="page-subtitle">Altere os dados da sala abaixo e salve as modificações.</p>
                </div>
                <button className="btn-action" onClick={voltarParaSalas}>← Voltar</button>
            </header>

            <div className="editar-sala-layout">
                <form onSubmit={handleSubmit} noValidate className="editar-sala-form-col">
                    <div className="form-section-card">
                        <div className="form-section-header"><h2>Dados da Sala</h2></div>
                        <div className="form-section-body">
                            <div className="form-group-edit">
                                <label className="form-label-edit" htmlFor="editDescricao">
                                    Descrição <span className="required-mark">*</span>
                                </label>
                                <input
                                    type="text" id="editDescricao" className="form-input-edit"
                                    value={descricao} onChange={(e) => setDescricao(e.target.value)}
                                    placeholder="Ex: Laboratório de Informática"
                                />
                            </div>

                            <div className="form-group-edit">
                                <label className="form-label-edit" htmlFor="editBloco">
                                    Bloco <span className="required-mark">*</span>
                                </label>
                                <input
                                    type="text" id="editBloco" className="form-input-edit"
                                    value={bloco} onChange={(e) => setBloco(e.target.value)}
                                    placeholder="Ex: A, B, 3"
                                />
                            </div>

                            <div className="form-group-edit">
                                <label className="form-label-edit">Imagem da Sala</label>
                                <div className="imagem-upload-area">
                                    {previewImagem ? (
                                        <img src={previewImagem} alt="Prévia da sala" className="imagem-preview" />
                                    ) : (
                                        <div className="imagem-preview-placeholder">
                                            <ion-icon name="image-outline"></ion-icon>
                                            <span>Sem imagem</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="imagem-upload-controls">
                                <label className="btn-upload-imagem" htmlFor="editImagem">
                                    <ion-icon name="folder-open-outline" style={{ fontSize: '18px' }}></ion-icon>
                                    Selecionar nova imagem
                                </label>
                                <input type="file" id="editImagem" accept="image/*" className="foto-input" onChange={handleImagemChange} ref={fileReaderRef} />
                                <p className="imagem-hint">A imagem atual será mantida se nenhuma for selecionada.</p>
                            </div>
                        </div>
                    </div>

                    <div className="form-section-card">
                        <div className="form-section-header">
                            <h2>
                                Patrimônios Vinculados
                                <span className="form-section-header-count">{linhas.length}</span>
                            </h2>
                            <button type="button" className="btn-primary-custom" style={{ fontSize: 13, padding: '6px 14px' }} onClick={adicionarPatrimonio}>
                                + Adicionar
                            </button>
                        </div>
                        <div className="form-section-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {linhas.length === 0 ? (
                                    <p className="patrimonios-vazio">Nenhum patrimônio cadastrado nesta sala.</p>
                                ) : (
                                    linhas.map((linha) => (
                                        <PatrimonioFormRow
                                            key={linha.chave}
                                            linha={linha}
                                            onAtualizar={atualizarLinha}
                                            onRemover={() => removerPatrimonio(linha.chave)}
                                        />
                                    ))
                                )}

                                {/* Botão vermelho abaixo da lista para adicionar outro patrimônio */}
                                <button
                                    type="button"
                                    onClick={adicionarPatrimonio}
                                    style={{
                                        marginTop: 8,
                                        width: '100%',
                                        padding: '8px 12px',
                                        backgroundColor: 'var(--vermelho-principal, #ef4444)',
                                        border: 'none',
                                        color: '#ffffff',
                                        borderRadius: 'var(--raio, 6px)',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> Adicionar outro patrimônio
                                </button>
                            </div>
                        </div>
                    </div>

                    {erro && <div className="alert-error" style={{ display: 'block', borderRadius: 'var(--raio)' }}>{erro}</div>}

                    <div className="form-actions-edit">
                        <button type="button" className="btn-action" onClick={voltarParaSalas}>Cancelar</button>
                        <button type="submit" className="btn-primary-custom" disabled={salvando}>
                            {salvando ? 'Salvando...' : 'Salvar alterações'}
                        </button>
                    </div>
                </form>

                <aside className="editar-sala-aside">
                    <div className="aside-info-card">
                        <div className="aside-info-header">Informações</div>
                        <div className="aside-info-body">
                            <div className="aside-info-row">
                                <span className="aside-info-label">ID da Sala</span>
                                <span className="aside-info-value">#{idSalaReal ?? '—'}</span>
                            </div>
                            <div className="aside-info-row">
                                <span className="aside-info-label">Patrimônios</span>
                                <span className="aside-info-value badge-patrimonio">{linhas.length} itens</span>
                            </div>
                            <div className="aside-info-row">
                                <span className="aside-info-label">Bloco atual</span>
                                <span className="aside-info-value">{bloco.trim() || '—'}</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}