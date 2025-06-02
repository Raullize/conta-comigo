import { DataTypes } from 'sequelize';
import database from '../database/db.js';

const Transacao = database.define('transacoes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  conta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('deposito', 'saque','transferencia'),
    allowNull: false,
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  conta_destino_id: {
    type: DataTypes.INTEGER,
    allowNull: true 
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
  
}, {
  tableName: 'transacoes',
  timestamps: true,
});




export default Transacao;
