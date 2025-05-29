import { DataTypes } from 'sequelize';
import database from '../database/db.js';

const User = database.define(
  'usuarios',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: true,
      validate: {
        len: [11, 11],
      },
    },
  },
  {
    tableName: 'usuarios',
    timestamps: false, 
  }
);



export default User;
