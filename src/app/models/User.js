'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.Account, {
        foreignKey: 'userId',
        as: 'accounts',
      });
    }

    checkPassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }

  User.init(
    {
      cpf: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      birthDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'birth_date',
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      freezeTableName: true,
      underscored: true,
    }
  );

  User.addHook('beforeSave', async user => {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 8);
    }
  });

  return User;
};
