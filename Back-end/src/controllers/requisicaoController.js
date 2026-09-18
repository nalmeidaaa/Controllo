import requisicaoRepository from '../repositories/requisicaoRepository.js';

const requisicaoController = {

    listarHistorico: async (req, res) => {
        try {
            const result = await requisicaoRepository.listarHistorico();

            res.status(200).json({ result });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                mensagem: 'Ocorreu um erro no servidor',
                errorMessage: error.message
            });
        }
    }

};

export default requisicaoController;