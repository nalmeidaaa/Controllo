import { urlImagemPatrimonio } from '../../services/imagemService';

export default function PatrimonioCardVS({ patrimonio, selecionado, onToggleSelecionado, onEditar, onExcluir }) {
    const nome = patrimonio.nome || 'Sem nome';
    const id = String(patrimonio.id_patrimonio || patrimonio.id || '');
    const tombo = patrimonio.tombo || patrimonio.numero_tombo || '—';
    const srcImagem = urlImagemPatrimonio(patrimonio);

    function handleCardClick(e) {
        if (e.target.closest('.vs-pat-actions') || e.target.closest('.vs-pat-checkbox-label')) return;
        onToggleSelecionado(id);
    }

    return (
        <div className={`vs-patrimonio-card ${selecionado ? 'selecionado' : ''}`} onClick={handleCardClick}>
            <label className="vs-pat-checkbox-label" title="Selecionar">
                <input
                    type="checkbox"
                    className="vs-pat-checkbox"
                    checked={selecionado}
                    onChange={() => onToggleSelecionado(id)}
                />
                <span className="vs-pat-checkbox-custom"></span>
            </label>
            <div className="vs-pat-img-area">
                {srcImagem && <img className="patrimonio-card-img" alt={nome} src={srcImagem} />}
            </div>
            <div className="vs-pat-info">
                <div className="vs-pat-nome">{nome}</div>
                <div className="vs-pat-meta">Tombo: {tombo}</div>
                <div className="vs-pat-meta">ID: #{id}</div>
            </div>
            <div className="vs-pat-actions">
                <button className="btn-pat-editar" title="Editar patrimônio" onClick={(e) => { e.stopPropagation(); onEditar(patrimonio); }}>✏ Editar</button>
                <button className="btn-pat-excluir" title="Excluir patrimônio" onClick={(e) => { e.stopPropagation(); onExcluir(id, nome); }}>🗑 Excluir</button>
            </div>
        </div>
    );
}
