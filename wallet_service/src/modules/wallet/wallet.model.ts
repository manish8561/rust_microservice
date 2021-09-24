import mongoose from 'mongoose';
import Wallet from './wallet.schema';
import * as Interfaces from '../../interfaces';
import { Helper } from "../../helpers";

const {
    Response: { errors },
    Utilities: { generateHash },
    ResMsg: {
        errors: { SOMETHING_WENT_WRONG }
    }
} = Helper;

class WalletModel {

    constructor() { }

    /** 
     * @function createWallet
     * @param _wallet
     * @returns user
     */
    public async createWallet(_wallet: Interfaces.Wallet): Promise<any> {


        try {
            const { publicKey, user } = _wallet;
            const isWalletExists: Interfaces.Wallet = await this._isWalletExists(publicKey, user);

            /** return if user found */
            if (isWalletExists) return isWalletExists;

            /** Create new user wallet */
            return await this._createWallet(_wallet); /**  Generate a new user wallet */
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function _createWallet
     * @param user 
     * @returns user
     */
    private async _createWallet(_wallet: Interfaces.Wallet): Promise<any> {
        const { ResMsg: {
            errors: { SOMETHING_WENT_WRONG }
        } } = Helper;

        try {
            let { publicKey, seedHex, btcAddress, user } = _wallet;
            seedHex = await generateHash(seedHex);
            btcAddress = await generateHash(btcAddress);

            /** Creating a new User */
            const crateWallet: any = new Wallet({ publicKey, seedHex, btcAddress, user });
            return await crateWallet.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function _isWalletExists
     * @param publicKey: string
     * @param user: mongoose.Types.ObjectId
     * @returns wallet
     */
    private async _isWalletExists(publicKey: string, user: mongoose.Types.ObjectId): Promise<any> {
        return await Wallet.findOne({ publicKey, user });
    }
}

export default new WalletModel();