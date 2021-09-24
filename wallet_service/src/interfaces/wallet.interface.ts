import mongoose from "mongoose";

interface Wallet {
    _id: string;
    publicKey: string;
    seedHex: string;
    btcAddress: string;
    user: mongoose.Types.ObjectId;
}

export default Wallet;