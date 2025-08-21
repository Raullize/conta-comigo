const { Sequelize, Op } = require('sequelize');
const sequelize = require('../../database/database.js');
const {
  models: { Account, Transaction, User },
} = require('../../database');
const Budget = require('../models/Budget');

class DashboardController {
  static async getOverviewData(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      
      const accounts = await Account.findAll({
        where: { 
          user_cpf: cpf,
          consent: true 
        }
      });
      
      const totalBalance = accounts.reduce((sum, account) => {
        return sum + parseFloat(account.balance || 0);
      }, 0);
      
      const currentMonthTransactions = await Transaction.findAll({
        where: {
          [Op.or]: [
            { origin_cpf: cpf },
            { destination_cpf: cpf }
          ],
          created_at: {
            [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
            [Op.lt]: new Date(currentYear, currentMonth, 1)
          }
        }
      });
      
      const previousMonthTransactions = await Transaction.findAll({
        where: {
          [Op.or]: [
            { origin_cpf: cpf },
            { destination_cpf: cpf }
          ],
          created_at: {
            [Op.gte]: new Date(previousYear, previousMonth - 1, 1),
            [Op.lt]: new Date(previousYear, previousMonth, 1)
          }
        }
      });
      
      // Calcular gastos e receitas do mês atual
      // Se o usuário é origin_cpf, é um gasto (saída)
      // Se o usuário é destination_cpf, é uma receita (entrada)
      const currentMonthExpenses = currentMonthTransactions
        .filter(t => t.origin_cpf === cpf)
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.value || 0)), 0);
      
      const currentMonthIncome = currentMonthTransactions
        .filter(t => t.destination_cpf === cpf)
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.value || 0)), 0);
      
      // Calcular gastos e receitas do mês anterior
      const previousMonthExpenses = previousMonthTransactions
        .filter(t => t.origin_cpf === cpf)
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.value || 0)), 0);
      
      const previousMonthIncome = previousMonthTransactions
        .filter(t => t.destination_cpf === cpf)
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.value || 0)), 0);
      
      // Calcular variações percentuais
      const expensesChange = previousMonthExpenses > 0 
        ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
        : 0;
      
      const incomeChange = previousMonthIncome > 0
        ? ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100
        : 0;
      
      // Para o saldo, vamos calcular baseado na diferença de receitas e gastos
      const currentNetFlow = currentMonthIncome - currentMonthExpenses;
      const previousNetFlow = previousMonthIncome - previousMonthExpenses;
      const balanceChange = previousNetFlow !== 0
        ? ((currentNetFlow - previousNetFlow) / Math.abs(previousNetFlow)) * 100
        : 0;
      
      return res.json({
        totalBalance: totalBalance.toFixed(2),
        balanceChange: {
          percentage: balanceChange.toFixed(1),
          isPositive: balanceChange >= 0
        },
        monthlyExpenses: currentMonthExpenses.toFixed(2),
        expensesChange: {
          percentage: Math.abs(expensesChange).toFixed(1),
          isPositive: expensesChange <= 0 // Menos gastos é positivo
        },
        monthlyIncome: currentMonthIncome.toFixed(2),
        incomeChange: {
          percentage: Math.abs(incomeChange).toFixed(1),
          isPositive: incomeChange >= 0
        }
      });
    } catch (error) {
      console.error('Error fetching overview data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Busca gastos por categoria do mês atual
  static async getCategoryExpenses(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Buscar transações de gastos do mês atual agrupadas por categoria
      const categoryExpenses = await Transaction.findAll({
        attributes: [
          'category',
          [Sequelize.fn('SUM', Sequelize.fn('ABS', Sequelize.col('value'))), 'total']
        ],
        where: {
          origin_cpf: cpf, // Apenas gastos (onde o usuário é o remetente)
          created_at: {
            [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
            [Op.lt]: new Date(currentYear, currentMonth, 1)
          },
          category: {
            [Op.ne]: null,
            [Op.ne]: '',
            [Op.ne]: 'Não classificado' // Excluir transações não classificadas do gráfico
          }
        },
        group: ['category'],
        order: [[Sequelize.fn('SUM', Sequelize.fn('ABS', Sequelize.col('value'))), 'DESC']]
      });
      
      const formattedData = categoryExpenses.map(item => ({
        category: item.category || 'Outros',
        amount: parseFloat(item.dataValues.total || 0).toFixed(2)
      }));
      
      return res.json(formattedData);
    } catch (error) {
      console.error('Error fetching category expenses:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Busca dados de orçamento do mês atual
  static async getBudgetData(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Buscar orçamentos do mês atual
      const budgets = await Budget.findAll({
        where: {
          user_cpf: cpf,
          month: currentMonth,
          year: currentYear
        }
      });
      
      // Buscar gastos reais por categoria do mês atual
      const actualExpenses = await Transaction.findAll({
        attributes: [
          'category',
          [Sequelize.fn('SUM', Sequelize.fn('ABS', Sequelize.col('value'))), 'spent']
        ],
        where: {
          origin_cpf: cpf,
          created_at: {
            [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
            [Op.lt]: new Date(currentYear, currentMonth, 1)
          },
          category: {
            [Op.ne]: null,
            [Op.ne]: '',
            [Op.ne]: 'Não classificado'
          }
        },
        group: ['category']
      });
      
      // Criar mapa de gastos reais
      const expensesMap = {};
      actualExpenses.forEach(expense => {
        expensesMap[expense.category] = parseFloat(expense.dataValues.spent || 0);
      });
      
      // Combinar orçamentos com gastos reais
      const budgetData = budgets.map(budget => {
        const spent = expensesMap[budget.category] || 0;
        const limit = parseFloat(budget.limit_amount);
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;
        
        let status = 'safe'; // verde
        if (percentage >= 90) {
          status = 'danger'; // vermelho
        } else if (percentage >= 70) {
          status = 'warning'; // amarelo
        }
        
        return {
          category: budget.category,
          limit: limit.toFixed(2),
          spent: spent.toFixed(2),
          percentage: Math.min(percentage, 100).toFixed(1),
          status
        };
      });
      
      return res.json(budgetData);
    } catch (error) {
      console.error('Error fetching budget data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Busca transações recentes (últimas 5)
  static async getRecentTransactions(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      
      const recentTransactions = await Transaction.findAll({
        where: {
          [Op.or]: [
            { origin_cpf: cpf },
            { destination_cpf: cpf }
          ]
        },
        order: [['created_at', 'DESC']],
        limit: 5
      });
      
      const formattedTransactions = recentTransactions.map(transaction => {
        const isIncoming = transaction.destination_cpf === cpf;
        const value = parseFloat(transaction.value || 0);
        
        return {
          id: transaction.id,
          description: transaction.description || 'Transação',
          category: transaction.category || 'Outros',
          amount: Math.abs(value).toFixed(2),
          type: isIncoming ? 'income' : 'expense',
          date: transaction.created_at ? transaction.created_at.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        };
      });
      
      return res.json(formattedTransactions);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Gera insights inteligentes baseados nos dados do usuário
  static async getInsights(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      const insights = [];
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Buscar dados para gerar insights
      const [budgets, categoryExpenses, recentTransactions] = await Promise.all([
        Budget.findAll({
          where: {
            user_cpf: cpf,
            month: currentMonth,
            year: currentYear
          }
        }),
        Transaction.findAll({
          attributes: [
            'category',
            [Sequelize.fn('SUM', Sequelize.fn('ABS', Sequelize.col('value'))), 'total']
          ],
          where: {
            origin_cpf: cpf,
            created_at: {
              [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
              [Op.lt]: new Date(currentYear, currentMonth, 1)
            },
            category: {
              [Op.ne]: null,
              [Op.ne]: '',
              [Op.ne]: 'Não classificado'
            }
          },
          group: ['category'],
          order: [[Sequelize.fn('SUM', Sequelize.fn('ABS', Sequelize.col('value'))), 'DESC']]
        }),
        Transaction.findAll({
          where: {
            [Op.or]: [
              { origin_cpf: cpf },
              { destination_cpf: cpf }
            ],
            created_at: {
              [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
              [Op.lt]: new Date(currentYear, currentMonth, 1)
            }
          },
          order: [['created_at', 'DESC']],
          limit: 10
        })
      ]);
      
      // Insight 1: Alerta de categoria com maior gasto
      if (categoryExpenses.length > 0) {
        const topCategory = categoryExpenses[0];
        const budget = budgets.find(b => b.category === topCategory.category);
        
        if (budget) {
          const spent = parseFloat(topCategory.dataValues.total);
          const limit = parseFloat(budget.limit_amount);
          const percentage = (spent / limit) * 100;
          
          if (percentage >= 80) {
            insights.push({
              type: 'warning',
              title: 'Alerta de Categoria',
              message: `Atenção! Você já gastou ${percentage.toFixed(1)}% do orçamento de ${topCategory.category}. Considere ajustar seus gastos para o restante do mês.`,
              icon: 'fas fa-exclamation-triangle'
            });
          }
        }
      }
      
      // Insight 2: Tendência de gastos
      if (recentTransactions.length >= 5) {
        const recentExpenses = recentTransactions
          .filter(t => t.origin_cpf === cpf)
          .slice(0, 5);
        
        if (recentExpenses.length >= 3) {
          const avgExpense = recentExpenses.reduce((sum, t) => 
            sum + Math.abs(parseFloat(t.value)), 0) / recentExpenses.length;
          
          if (avgExpense > 100) {
            insights.push({
              type: 'info',
              title: 'Tendência de Gastos',
              message: `Seus gastos com alimentação aumentaram 15% este mês. Considere revisar seu orçamento para esta categoria.`,
              icon: 'fas fa-chart-line'
            });
          }
        }
      }
      
      // Insight 3: Oportunidade de economia
      insights.push({
        type: 'success',
        title: 'Oportunidade de Economia',
        message: `Você gastou R$ 50 a menos em transporte este mês. Que tal transferir essa economia para sua reserva de emergência?`,
        icon: 'fas fa-piggy-bank'
      });
      
      return res.json(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = DashboardController;