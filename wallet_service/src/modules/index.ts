import WalletController from "./wallet/wallet.controller";
import TransactionController from './transacction/transaction.controller';

export default [
    new WalletController(),
    new TransactionController()
]