export default function PatrimonioFormRow({ linha, onAtualizar, onRemover }) {
    const { idPatrimonio, nome, status, novo } = linha;

    return (
        <div
            className={`patrimonio-item-form ${novo ? 'patrimonio-novo' : ''}`}
            style={{
                border: novo ? '1px dashed #94a3b8' : '1px solid #e2e8f0',
                padding: 14,
                borderRadius: 8,
                background: novo ? '#f0f9ff' : '#f8fafc',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: novo ? '#3b82f6' : '#94a3b8', fontWeight: novo ? 500 : 400 }}>
                    {novo ? 'Novo patrimônio' : `ID: ${idPatrimonio || '—'}`}
                </span>
                <button
                    type="button"
                    onClick={onRemover}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
                    title="Remover"
                >
                    ✕
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
                <div>
                    <label className="form-label-edit">Nome do Item *</label>
                    <input
                        type="text" className="form-input-edit"
                        value={nome}
                        onChange={(e) => onAtualizar({ ...linha, nome: e.target.value })}
                        placeholder="Ex: Cadeira Pro"
                        style={linha.erro ? { borderColor: '#ef4444' } : undefined}
                    />
                </div>
                <div>
                    <label className="form-label-edit">Status</label>
                    <select
                        className="form-input-edit" style={{ height: 42 }}
                        value={status}
                        onChange={(e) => onAtualizar({ ...linha, status: e.target.value })}
                    >
                        <option value="Ok">Ok</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Danificado">Danificado</option>
                        <option value="Manutenção">Manutenção</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="form-label-edit">{novo ? 'Foto' : 'Foto (substituir)'}</label>
                <input
                    type="file" accept="image/*"
                    onChange={(e) => onAtualizar({ ...linha, arquivoFoto: e.target.files[0] || null })}
                />
            </div>
        </div>
    );
}
