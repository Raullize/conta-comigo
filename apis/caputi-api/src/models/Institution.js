import { DataTypes } from 'sequelize';
import database from '../database/db.js';

const Institution = database.define(
    'instituicoes',
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
    cnpj: {
        type: DataTypes.STRING(14),
        allowNull: false,
        unique: true,
        validate: {
        len: [14, 14],
        },
    },
    },
    {
    tableName: 'instituicoes',
    timestamps: false, 
    }
);

export default Institution;
