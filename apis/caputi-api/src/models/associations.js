import User from './User.js';
import Conta from './Conta.js';
import Instituicao from './Institution.js';
import Transacao from './Transacao.js';

User.hasMany(Conta, {
    foreignKey: 'usuario_id',
    as: 'contas',
});

Conta.belongsTo(User, {
    foreignKey: 'usuario_id',
as: 'usuario',
});

Conta.belongsTo(Instituicao, {
    foreignKey: 'instituicao_id',
    as: 'instituicao',
});

Conta.hasMany(Transacao, {
    foreignKey: 'conta_id',
    as: 'transacoes'
});


Transacao.belongsTo(Conta,{
    foreignKey:'conta_id',
    as:'conta',
});

Transacao.belongsTo(Conta, {
    foreignKey: 'conta_destino_id',
    as: 'conta_destino',
});

Instituicao.hasMany(Conta, {
    foreignKey: 'instituicao_id',
    as: 'contas', 
});

export { User, Conta, Instituicao, Transacao };