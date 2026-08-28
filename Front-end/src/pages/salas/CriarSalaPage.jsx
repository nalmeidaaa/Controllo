import { useState } from 'react';
import { criarSala } from '../../services/salaService.js';
import { obterToken } from '../../storage/usuario/dados.storage.js';

export default function CriarSalaPage({ navegarPara }) {
    const token = obterToken();
    const [descricao, setDescricao] = useState('');
    const [bloco, setBloco] = useState('');
    const [arquivo, setArquivo] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [erro, setErro] = useState('');
    const [salvando, setSalvando] = useState(false);

    const voltarParaSalas = () => navegarPara.salas();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setArquivo(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    if (!token) {
        return (
            <div className="page-salas-container">
                <div className="sala-empty"><div>🔒</div><p>Sessão inválida. Faça login novamente.</p></div>
            </div>
        );
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErro('');

        const desc = descricao.trim();
        const blc = bloco.trim();

        if (!desc || !blc) {
            setErro('Os campos Descrição e Bloco são obrigatórios.');
            return;
        }

        const formData = new FormData();
        formData.append('descricao', desc);
        formData.append('bloco', blc);
        if (arquivo) formData.append('imagem', arquivo);

        try {
            setSalvando(true);
            await criarSala(formData, token);
            voltarParaSalas();
        } catch (error) {
            setErro(error?.response?.data?.message || 'Erro ao criar a sala. Tente novamente.');
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="page-salas-container">
            <header className="header-usuarios">
                <div>
                    <h1>Nova Sala</h1>
                    <p className="page-subtitle">Preencha os dados abaixo para cadastrar uma nova sala no sistema.</p>
                </div>
                <button className="btn-action" onClick={voltarParaSalas}>Voltar</button>
            </header>

            <div className="criacao-sala-content">
                <div className="form-section-card">
                    <form className="sala-form" onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label className="form-label" htmlFor="inputDescricao">
                                Descrição da Sala <span className="required-mark">*</span>
                            </label>
                            <input
                                type="text" id="inputDescricao" className="form-control" required
                                placeholder="Ex: Laboratório de Informática"
                                value={descricao} onChange={(e) => setDescricao(e.target.value)}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="inputBloco">
                                    Bloco <span className="required-mark">*</span>
                                </label>
                                <input
                                    type="text" id="inputBloco" className="form-control" required
                                    placeholder="Ex: A, B, 3"
                                    value={bloco} onChange={(e) => setBloco(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="inputImagem">Imagem da Sala</label>
                            <div className="form-file-input">
                                <label className="form-file-label" htmlFor="inputImagem">
                                    📁 {arquivo ? arquivo.name : 'Selecionar imagem'}
                                </label>
                                <input
                                    type="file" id="inputImagem" className="form-control" accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <p className="form-hint">PNG, JPG ou JPEG (até 5MB)</p>

                            {previewUrl && (
                                <div style={{ marginTop: '10px' }}>
                                    <img 
                                        src={previewUrl} 
                                        alt="Prévia da Sala" 
                                        style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} 
                                    />
                                </div>
                            )}
                        </div>

                        {erro && <div className="alert-error" style={{ display: 'block' }}>{erro}</div>}

                        <div className="form-actions">
                            <button type="button" className="btn-modal-cancel" onClick={voltarParaSalas}>Cancelar</button>
                            <button type="submit" className="btn-primary-custom" disabled={salvando}>
                                {salvando ? 'Salvando...' : 'Salvar Sala'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}