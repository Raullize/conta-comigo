import bcrypt from 'bcryptjs';
import Sequelize, { Model } from 'sequelize';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        cpf: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );
    this.addHook('beforeSave', async (user) => {
      if (user.password) {
        const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
        user.password_hash = await bcrypt.hash(user.password, rounds);
      }
    });

    return this;
  }

  static associate(models) {
    this.hasMany(models.BankAccount, { foreignKey: 'user_id', as: 'accounts' });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
