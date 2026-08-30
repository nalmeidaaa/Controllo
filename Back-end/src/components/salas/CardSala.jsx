import { urlImagemSala } from '../../services/imagemService.js';
import { excluirSala } from '../../services/salaService.js';
import { obterUsuarioAtual } from '../../storage/usuario/dados.storage.js';

export default function CardSala({ sala, onVisualizar, onExcluir }) {
    const id = sala.id_sala || sala.id || '—';
    const descricao = sala.descricao || sala.nome || 'Sem descrição';
    const bloco = sala.bloco || '—';
    const srcImagem = urlImagemSala(sala);

    async function handleExcluir(e) {
        e.preventDefault();
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
        <div className="sala-card-item">
            <div className="sala-card-imagem-wrapper">
                {srcImagem && <img className="sala-card-img" alt={descricao} src={srcImagem} />}
                <span className="sala-card-badge-bloco">Bloco {bloco}</span>
            </div>
            <div className="sala-card-conteudo">
                <div className="sala-card-id">ID da sala: {id}</div>
                <p className="sala-card-descricao">{descricao}</p>
                <div className="sala-card-acoes">
                    <button className="btn-card-action btn-card-excluir" onClick={handleExcluir}>Excluir</button>
                    <button
                        className="btn-card-action btn-card-visualizar"
                        onClick={(e) => { e.preventDefault(); onVisualizar?.(sala); }}
                    >
                        Visualizar
                    </button>
                </div>
            </div>
        </div>
    );
}
