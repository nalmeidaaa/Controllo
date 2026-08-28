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
                    arquivoFoto: null,
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idSala]);

    if (!token) {
        return <div className="sala-empty"><div>
            <ion-icon name="lock-closed-outline" style={{ fontSize: '32px' }}></ion-icon>
        </div><p>Sessão inválida. Faça login novamente.</p></div>;
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
                    <div>
                        <ion-icon name="warning-outline" style={{ fontSize: '32px' }}></ion-icon>
                    </div>
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
            chave: novaChave(), idPatrimonio: '', nome: '', status: 'Ok', arquivoFoto: null, novo: true,
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

        const nomesVazios = linhas.filter((l) => !l.nome.trim());
        if (nomesVazios.length > 0) {
            setLinhas((atual) => atual.map((l) => ({ ...l, erro: !l.nome.trim() })));
            setErro('Todos os patrimônios precisam ter um nome.');
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
            voltarParaSalas();
        } catch (error) {
            const msg = error?.response?.data?.mensagem
                || error?.response?.data?.message
                || error?.response?.data?.erro
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
                <div className="editar-sala-form-col">
                    <div className="form-section-card">
                        <div className="form-section-header"><h2>Dados da Sala</h2></div>
                        <div className="form-section-body">
                            <form onSubmit={handleSubmit} noValidate>
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
                                        <div className="imagem-preview-wrapper">
                                            {previewImagem && (
                                                <img
                                                    src={previewImagem} alt="Prévia da sala"
                                                    style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, display: 'block' }}
                                                />
                                            )}
                                        </div>
                                        <div className="imagem-upload-controls">
                                            <label className="form-file-label" htmlFor="inputImagem" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ion-icon name="folder-open-outline" style={{ fontSize: '20px' }}></ion-icon>
                                                Selecionar imagem
                                            </label>
                                            <input type="file" id="editImagem" accept="image/*" style={{ display: 'none' }} onChange={handleImagemChange} ref={fileReaderRef} />
                                            <p className="imagem-hint">A imagem atual será mantida se nenhuma for selecionada.</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 32, borderTop: '1px solid #eee', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 className="form-section-header" style={{ margin: 0 }}>Patrimônios Vinculados</h2>
                                    <button type="button" className="btn-primary-custom" style={{ fontSize: 13, padding: '6px 14px' }} onClick={adicionarPatrimonio}>
                                        + Adicionar
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12, marginBottom: 24 }}>
                                    {linhas.length === 0 ? (
                                        <p style={{ color: '#64748b', fontStyle: 'italic' }}>Nenhum patrimônio cadastrado nesta sala.</p>
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
                                </div>

                                {erro && <div className="alert-error" style={{ display: 'block', marginTop: 8 }}>{erro}</div>}

                                <div className="form-actions-edit">
                                    <button type="button" className="btn-action" onClick={voltarParaSalas}>Cancelar</button>
                                    <button type="submit" className="btn-primary-custom" disabled={salvando}>
                                        {salvando ? 'Salvando...' : 'Salvar alterações'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

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
