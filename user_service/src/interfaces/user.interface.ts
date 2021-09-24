import mongoose from 'mongoose';

interface User {
    _id: mongoose.Types.ObjectId;
    wallet: { publicKey: string; seedHex: string; btcAddress: string; },
    email: string;
    mobile: string;
    isEmailVerified: boolean;
    isProfileUpdated: boolean;
    isAccountActived: boolean;
    isRecoveryPageSkipped: boolean;
    otp: string;
    countryCode: string;
    username: string;
    description: string;
    founderRewardPercentage: string;
    image: string;
}

export default User;