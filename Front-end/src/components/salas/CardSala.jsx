import { urlImagemSala } from '../../services/imagemService.js';
import { excluirSala } from '../../services/salaService.js';
import { obterUsuarioAtual } from '../../storage/usuario/dados.storage.js';

export default function CardSala({ sala, selecionado, onToggleSelecionado, onVisualizar, onEditar, onExcluir }) {
    const id = sala.id_sala || sala.id || '—';
    const descricao = sala.descricao || sala.nome || 'Sem descrição';
    const bloco = sala.bloco || '—';
    const srcImagem = urlImagemSala(sala);

    function handleCardClick(e) {
        if (e.target.closest('.sala-card-acoes') || e.target.closest('.sala-card-checkbox-label')) return;
        onVisualizar?.(sala);
    }

    async function handleExcluir(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm(`Deseja realmente excluir a sala ${id}?`)) return;

        try {
            const usuario = obterUsuarioAtual();
            const token = usuario?.token;
            if (!token) {
                alert('Sessão expirada. Faça login novamente.');
                return;
            }
            await excluirSala(id, token);
            onExcluir?.(id);
        } catch (erro) {
            console.error('Erro ao excluir a sala:', erro);
            alert('Não foi possível excluir a sala. Verifique suas permissões.');
        }
    }

    return (
        <div className={`sala-card-item ${selecionado ? 'selecionada' : ''}`} onClick={handleCardClick}>
            <div className="sala-card-imagem-wrapper">
                <label className="sala-card-checkbox-label" title="Selecionar" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={Boolean(selecionado)}
                        onChange={() => onToggleSelecionado?.(String(id))}
                    />
                    <span className="sala-card-checkbox-custom"></span>
                </label>
                {srcImagem && <img className="sala-card-img" alt={descricao} src={srcImagem} />}
                <span className="sala-card-badge-bloco">Bloco {bloco}</span>
            </div>
            <div className="sala-card-conteudo">
                <div className="sala-card-id">ID da sala: {id}</div>
                <p className="sala-card-descricao">{descricao}</p>
                <div className="sala-card-acoes">
                    <button
                        className="btn-card-action btn-card-visualizar"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onVisualizar?.(sala); }}
                    >
                        Visualizar
                    </button>
                    <button
                        className="btn-card-action btn-card-editar"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEditar?.(sala); }}
                    >
                        Editar
                    </button>
                    <button className="btn-card-action btn-card-excluir" onClick={handleExcluir}>Excluir</button>
                </div>
            </div>
        </div>
    );
}