const Account = require('../models/Account');
const User = require('../models/User');

module.exports = {
    async createAccount(req, res){
        const user_id = req.user_id;
        const {
                institution,
            } = req.body;

            if(!user_id){
                return res.status(404).json({error: "The user doesn't exists"});
            }

            if(!institution){
                return res.status(400).json({error: 'Missing required account fields.'});
            }

        try {
            const account_exists = await Account.findOne({
                where: {
                    user_id,
                    institution,
                }
            });

            if(account_exists){
                return res.status(400).json({ error: 'This account already exists for this user.'});
            }

            const new_account = await Account.create({
                user_id,
                institution,
            });

            return res.status(201).json(new_account);

        } catch (error) {
            return res.status(500).json({erro: 'Erro ao criar conta.', detalhe: error.message });
        }
    },

    async updateAccount(req, res){
        try {
            
        } catch (error) {
            
        }
    },

    async getAllAccounts(req, res){
        try {
            
        } catch (error) {
            
        }
    },

    async deleteAccount(req, res){
        try {
            
        } catch (error) {
            
        }
    }
}
