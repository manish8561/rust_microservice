import User from './user.schema';
import * as Interfaces from '../../interfaces';
import { Helper } from '../../helpers';
import mongoose from 'mongoose';

const {
    Response: { errors },
    ResMsg: {
        errors: { SOMETHING_WENT_WRONG },
        user: { USER_NOT_FOUND }
    }
} = Helper;


class UserModel {

    constructor() { }

    /**
     * @function _createNewUser
     * @returns user
     */
    public async createUserInPostDB(_user: Interfaces.User): Promise<any> {
        try {
            const { _id } = _user;
            const user = new User({ user: _id });
            return user.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
   * @function consumeQueueToUpdateUser
   * @param _user 
   */
    public async consumeQueueToUpdateUser(_user: Interfaces.User): Promise<any> {
        try {
            const { _id, username, image } = _user;
            const user = await this.getUser(_id);
            if (!user) return errors(USER_NOT_FOUND);
            
            user.username = username;
            user.image = image;
            user.isProfileUpdated = true;
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
        public async userDetailsFromMsgeSrv(user: mongoose.Schema.Types.ObjectId): Promise<any> {
            try {
                return await User.findOne({ user });
            } catch (error) {
                return errors(SOMETHING_WENT_WRONG, error);
            }
        }

    /**
    * @function getUser
    * @param follower 
    * @returns 
    */
    public async getUser(_id: mongoose.Types.ObjectId): Promise<any> {
        return await User.findOne({ user: _id });
    }
}

export default new UserModel();