import * as Interfaces from '../interfaces';

class QueueService {
    
    private _walletModel = Object.create({});

    constructor() {
        /** await for a second so Helper error wont come in wallet.model.ts */
        setTimeout( async () => {
            this._walletModel =  (await import("../modules/wallet/wallet.model")).default;
        }, 1000);
    }

    /**
     * @function consumeCreateWalletHook
     * @param wallet 
     */
    public async consumeCreateWalletHook(wallet: Interfaces.Wallet) {
        const result = await this._walletModel.createWallet(wallet);
        if (result.errors) return console.log('\n \n Failed To create wallet ', ' => ', result, '\n');
        console.log('\n \n Wallet created ', result.user, ' => ', result['_id'], '\n');
    }

} 

export default new QueueService();