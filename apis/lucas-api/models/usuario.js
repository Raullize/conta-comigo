'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
   
    static associate(models) {
      Usuario.hasMany(models.Conta, { foreignKey: 'usuarioCpf',
        as: 'contas'
       });
    }
    
  }
  Usuario.init({
    cpf: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    nome: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Usuario',
    timestamps: true,
  });
  return Usuario;
};