import Sequelize,{Model} from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize){
    super.init(
      {
        name: Sequelize.STRING,
        cpf: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,       
        underscored: true,
      }
    );
    this.addHook('beforeSave', async(user)=> {
      if(user.password){
        user.password_hash = await bcrypt.hash(user.password,8)
      }
    });
    return this;
  }
  checkPassword(password){
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
