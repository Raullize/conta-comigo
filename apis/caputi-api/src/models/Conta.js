import { DataTypes } from 'sequelize';
import database from '../database/db.js';

const Conta = database.define('contas', {
  id_conta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  instituicao_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  saldo: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  nome_usuario: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cpf_usuario: {
    type: DataTypes.STRING(11),
    allowNull: false,
  },
  nome_instituicao: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'contas',
  timestamps: true,
});

export default Conta;
