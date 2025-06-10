const express = require('express');
const router = express.Router();

const { getDataAccount } = require('../controllers/openFinanceController.js');
const { updateConsent } = require('../controllers/openFinanceController.js');

router.get('/open-finance/:cpf', getDataAccount);
router.patch('/open-finance/:cpf/consent', updateConsent);

module.exports = router;