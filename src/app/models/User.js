'use strict';
const { Model, Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = sequelize => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Goal, {
        foreignKey: 'user_id',
        as: 'goals',
      });

      User.hasMany(models.Account, {
        foreignKey: 'user_id',
        as: 'accounts',
      });
    }
  }

  User.init(
    {
      cpf: Sequelize.STRING,
      name: Sequelize.STRING,
      email: Sequelize.STRING,
      birth_date: Sequelize.STRING,
      password: Sequelize.STRING,
      password_hash: Sequelize.VIRTUAL,
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
    }
  );

  User.addHook('beforeSave', async user => {
    if (user.password_hash) {
      user.password = await bcrypt.hash(user.password, 8);
    }
  });

  return User;
};
