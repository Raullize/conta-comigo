import Conta from '../models/Conta.js';
import Usuario from '../models/User.js';
import Instituicao from '../models/Institution.js';
class ContaController{
    async create(req,res){""
        try{
            const {usuario_id, instituicao_id} = req.body;

            const usuario = await Usuario.findByPk(usuario_id);
            const instituicao = await Instituicao.findByPk(instituicao_id);

            if (!usuario || !instituicao) {
                return res.status(404).json({ error: 'Usuário ou instituição não encontrados' });
            }

            const contaExistente = await Conta.findOne({
                where: {
                    usuario_id,
                    instituicao_id
                }
            });
        
            if (contaExistente) {
                return res.status(409).json({ error: 'Usuário já possui uma conta nessa instituição' });
            }

            const novaConta = await Conta.create({
                usuario_id,
                instituicao_id,
                saldo: 0.0,
                nome_usuario: usuario.nome,
                cpf_usuario: usuario.cpf,
                nome_instituicao: instituicao.nome
            });
            const mensagem = `Conta de '${usuario.nome}' criada na instituição '${instituicao.nome}'`;
            return res.status(201).json({
                "message": mensagem,
                "new_account":novaConta});
        }catch(error){
            return res.status(400).json({error: 'Erro ao criar Conta', details: error.message});
        }
    }
        async index(req, res) {
            try {
            const contas = await Conta.findAll({
                include: [
                { model: Usuario, as: 'usuario' },
                { model: Instituicao, as: 'instituicao' },
                ],
            });
        
            if (contas.length === 0) {
                return res.status(404).json({ message: 'Nenhuma conta encontrada.' });
            }
        
            return res.status(200).json(contas);
            } catch (error) {
            return res.status(400).json({ error: 'Erro ao listar contas', details: error.message });
            }
        }

        async listarPorUsuario(req, res) {
            const { id } = req.params;
        
            try {
            const contas = await Conta.findAll({
                where: { usuario_id: id },
                include: [
                { model: Usuario, as: 'usuario' },
                { model: Instituicao, as: 'instituicao' },
                ],
            });
        
            if (contas.length === 0) {
                return res.status(404).json({ message: 'Nenhuma conta encontrada para este usuário.' });
            }
        
            return res.status(200).json(contas);
            } catch (error) {
            return res.status(400).json({ error: 'Erro ao listar contas do usuário', details: error.message });
            }
        }
}
export default new ContaController();