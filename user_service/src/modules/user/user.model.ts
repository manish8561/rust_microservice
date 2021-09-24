import User from './user.schema';
import * as Helpers from "../../helpers";
import * as Interfaces from '../../interfaces';
import QueueService from '../../services/queue.service';
import mongoose from 'mongoose';

const {
    Response: { errors },
    Validate: { _validations },
    Utilities: { requestEncryption, generateJwt, generateOtp },
    ResMsg: {
        errors: { SOMETHING_WENT_WRONG, ALL_FIELDS_ARE_REQUIRED },
        auth: { BLOCKED },
        user: { MOBILE_ALREADY_VERIFIED, USER_NOT_FOUND, OTP_UNMATCHED, EMAIL_ALREADY_VERIFIED, USER_NAME_IS_ALREADY_IN_USE },
    }
} = Helpers;

class UserModel {

    constructor() { }

    /** 
     * @function checkUserAndMaybeRegister
     * @param user 
     * @returns user
     */
    public async checkUserAndMaybeRegister(_user: Interfaces.User): Promise<any> {
        try {
            const { email, wallet: { publicKey, seedHex, btcAddress } } = _user;

            let _errors = await _validations({ publicKey, seedHex, btcAddress });
            if ((email) && (email.trim().length > 0)) _errors = await _validations({ email, publicKey, seedHex, btcAddress });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            let isRegistered: Interfaces.User | any = await this._isPublicKeyExist(publicKey);

            /** changed to email if User exits */
            if ((email) && (email.trim().length > 0)) isRegistered = await this._isEmailExist(email);

            /**  Update isRecoveryPageSkipped to true, so it won't be shwon again on user side */
            if ((isRegistered) && (!isRegistered.isRecoveryPageSkipped)) {
                isRegistered.isRecoveryPageSkipped = true;
                isRegistered = await isRegistered.save();
            }

            /** return if user found */
            if (isRegistered) {
                /** return if user status is not active */
                if (!isRegistered.isAccountActived) return errors(BLOCKED);
                return isRegistered;
            }

            /** Create new user wallet */
            return await this._createNewUser(_user); /**  Register a new user */
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
 * @function _createNewUser
 * @param user 
 * @returns user
 */
    private async _createNewUser(_user: Interfaces.User): Promise<any> {
        try {
            let { email, wallet: { publicKey, seedHex, btcAddress } } = _user;
            /** Encrypting keys with crypto js */
            seedHex = requestEncryption(seedHex);
            btcAddress = requestEncryption(btcAddress);
            /** Creating a new User */
            let createUser: any = new User({ publicKey });
            /** chaging user object based on email */
            if ((email) && (email.trim().length > 0)) {
                createUser = new User({ publicKey, email, isEmailVerified: true, registeredWith: "GOOGLE" });
            }

            createUser = await createUser.save();
            if (createUser._id) {
                /** passing data to rabbit queue - wallet_queue_dev */
                let wallet: any = _user.wallet;
                wallet.user = createUser['_id']; /** adding user address to use in wallet service */
                wallet.seedHex = seedHex; /** re assign seedhex and btc address */
                wallet.btcAddress = btcAddress;

                /** creating queues for other services */
                QueueService.sendWalletDataToWalletQueue(wallet);
                QueueService.sendUserDataToComsumeInPostDb({ _id: createUser['_id'] });
                QueueService.sendUserDataToComsumeInMessageDb({ _id: createUser['_id'] });
            }

            return { 
                _id: createUser['_id'], 
                isProfileUpdated: createUser['isProfileUpdated'], 
                publicKey: createUser['publicKey'], 
                registeredWith: createUser.registeredWith, 
                isRecoveryPageSkipped: createUser.isRecoveryPageSkipped 
            };
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }


    /**
     * @function generateJwtToken
     * @param user 
     * @returns token
     */
    public async generateJwtToken(user: Interfaces.User | any): Promise<any> {
        const { _id, publicKey } = user;
        return await generateJwt({ publicKey, _id });
    }

    /**
     * @function addMobile
     * @param _user 
     * @returns mobile added 
     */
    public async addMobile(_user: Interfaces.User): Promise<any> {
        try {
            const { _id, mobile, countryCode } = _user;
            const _errors = await _validations({ mobile, countryCode });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            let user: any = await User.findOne({ _id });
            if (!user) return errors(USER_NOT_FOUND);
            if (user.isMobileVerified) return errors(MOBILE_ALREADY_VERIFIED);

            /** update user mobile if email is not verified already */
            user.mobile = mobile;
            user.countryCode = countryCode;
            user.otp = await generateOtp(6);
            return await user.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function verifyMobile
     * @param _user 
     * @returns verify mobile number
     */
    public async verifyMobile(_user: Interfaces.User): Promise<any> {
        try {
            const { _id, otp } = _user;
            const _errors = await _validations({ otp });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);
            const user: any = await User.findById(_id);
            /** return if users not matched */
            if (!user) return errors(USER_NOT_FOUND);
            /** Compate OTP */
            if (Number(user.otp) !== Number(otp)) return errors(OTP_UNMATCHED);
            /** Verify Mobile */
            user.isMobileVerified = true;
            user.otp = undefined;
            return await user.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function addEmail
     * @param _user 
     * @returns add email address
     */
    public async addEmail(_user: Interfaces.User): Promise<any> {
        try {
            const { _id, email } = _user;
            const _errors = await _validations({ email });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            const user: any = await User.findById(_id);
            /** return if users not matched */
            if (!user) return errors(USER_NOT_FOUND);
            if (user.isEmailVerified) return errors(EMAIL_ALREADY_VERIFIED);
            /** update user email if email is not verified already */
            user.email = email;
            user.otp = await generateOtp(6);
            return await user.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function verifyEmail
     * @param _user 
     * @returns verified email
     */
    public async verifyEmail(_user: Interfaces.User): Promise<any> {
        try {
            const { _id, otp } = _user;
            const _errors = await _validations({ otp });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            const user: any = await User.findById(_id);
            /** return if users not matched */
            if (!user) return errors(USER_NOT_FOUND);
            /** return if users not matched */
            if (Number(user.otp) !== Number(otp)) return errors(OTP_UNMATCHED);
            /** verify email */
            user.isEmailVerified = true;
            user.otp = undefined;
            return await user.save();

        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function userDetails
     * @param _id
     * @returns user Details
     */
    public async userDetails(_id: mongoose.Schema.Types.ObjectId): Promise<any> {
        try {
            return await User.findById(_id, {
                username: 1,
                description: 1,
                founderRewardPercentage: 1,
                image: 1,
                email: 1,
                mobile: 1,
                publicKey: 1,
                isEmailVerified: 1,
                isMobileVerified: 1,
                role: 1,
                isProfileUpdated: 1
            });
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function updateProfile
     * @param _user 
     * @returns update User
     */
    public async updateProfile(_user: Interfaces.User): Promise<any> {
        try {
            const { username, description, image, founderRewardPercentage, _id } = _user;
            /** checking username if it matched with current logged in user */
            const isUsernameUsed: Interfaces.User = await this._isUsernameExists(username);
            if ((isUsernameUsed) && (String(isUsernameUsed['_id']) !== String(_id))) return errors(USER_NAME_IS_ALREADY_IN_USE);

            /** finding user with logged in user id */
            let user: any = await this._findById(_id);
            if (!user) return errors(USER_NOT_FOUND);
            /** UPDATING USER INFO IF USER FOUND */
            user.username = username;
            user.description = description;
            user.founderRewardPercentage = founderRewardPercentage;
            user.image = image;
            user.isProfileUpdated = true;
            const isUpdated = await user.save();

            if (isUpdated) {
                const { _id, username, image, isProfileUpdated } = isUpdated;
                QueueService.createUserUpdateQueueToConsumeInPostSrv({ _id, username, image, isProfileUpdated });
                QueueService.createUserUpdateQueueToConsumeInMessageSrv({ _id, username, image, isProfileUpdated });
            }

            return isUpdated;
        } catch (error) {
            console.log(error);
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
    * @function _findById
    * @param _id 
    * @returns user
    */
    private async _findById(_id: mongoose.Types.ObjectId): Promise<any> {
        return await User.findOne({ _id });
    }

    /**
     * @function _isUsernameExists
     * @param username 
     * @returns user
     */
    private async _isUsernameExists(username: string): Promise<any> {
        return await User.findOne({ username });
    }

    /**
     * @function _isPublicKeyExist
     * @param publicKey 
     * @returns user
     */
    private async _isPublicKeyExist(publicKey: string): Promise<any> {
        return await User.findOne({ publicKey });
    }

    /**
     * @function _isEmailExist
     * @param email 
     * @returns 
     */
    private async _isEmailExist(email: string): Promise<any> {
        return await User.findOne({ email });
    }

}

export default new UserModel();