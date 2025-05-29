import express from "express";
const router = express.Router();

import UserController from "../app/controllers/UserController.js";
import InstitutionController from "../app/controllers/InstitutionController.js";
import AccountController from "../app/controllers/AccountController.js";
import Transaction from "../app/controllers/TransactionController.js";
import TransactionController from "../app/controllers/TransactionController.js";

router.get("/users/:user_cpf/balance", AccountController.getBalance);
router.get("/users/:user_cpf/statement", AccountController.getStatement);
router.get("/listInstitutions", InstitutionController.listInstitutions);
router.get("/listUsers", UserController.listUsers);

router.post("/newuser", UserController.createUser);
router.post("/newInstitution", InstitutionController.store);
router.post("/users/:user_cpf/accounts", AccountController.createAccount);
router.post(
  "/users/:origin_cpf/transaction",
  TransactionController.newTransaction
);
router.post("/users/:user_cpf/deposit", AccountController.newDeposit);
router.post("/users/:user_cpf/withdrawal", AccountController.newWithdrawal);

export default router;
