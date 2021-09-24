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
     * @function consumeFollowedQueueToAddDataInUser
     * @param _followed 
     * @returns 
     */
    public async consumeFollowedQueueToAddDataInUser(_followed: Interfaces.Follow): Promise<any> {
        try {
            const { follower, following, type } = _followed;
            const _follower: Interfaces.Follow | any = await this.getUser(follower);
            const _following: Interfaces.Follow = await this.getUser(following);
            /** return if users not matched */
            if ((!_follower) || (!_following)) return errors(USER_NOT_FOUND);

            /** remove followed user from array of user followings to disable posts in his feed */
            if (type === "UNFOLLOW") {
                const findIndex = _follower.followings.findIndex((followedId: any) => String(_following['_id']) == String(followedId));
                if (findIndex !== -1) _follower.followings.splice(findIndex, 1); /** remove followed user form array */
            } else {
                /** if not type = "UNFOLLOW" then push a user followed user to user following array */
                _follower.followings.push(_following['_id']);
            }

            /** save and update user followings array */
            return await _follower.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function consumeQueueToRmoveFollowOnBlock
     * @param _block 
     */
    public async consumeQueueToRmoveFollowOnBlock(_block: Interfaces.Block): Promise<any> {
        try {
            const { blockingUser, blockingBy, type } = _block;
            const _blockingUser: any = await this.getUser(blockingUser);
            const _blockingBy: any = await this.getUser(blockingBy);

            /** remove from both users following array and add that user to blockusers array so it wont show in feed. */

            if ((type === "BLOCK") && ((_blockingUser) || (_blockingBy))) {

                if (_blockingUser) {
                    /** blockingUser is other user document */
                    _blockingUser.blockUsers.push(_blockingBy['_id']);
                    const findIndex = _blockingUser.followings.findIndex((followedId: any) => String(_blockingBy['_id']) == String(followedId));
                    if (findIndex !== -1) _blockingUser.followings.splice(findIndex, 1);
                    await _blockingUser.save();
                }

                if (_blockingBy) {
                    /** blockingBy is logged in user document */
                    _blockingBy.blockUsers.push(_blockingUser['_id']);
                    const findIndex = _blockingBy.followings.findIndex((followedId: any) => String(_blockingUser['_id']) == String(followedId));
                    if (findIndex !== -1) _blockingBy.followings.splice(findIndex, 1);
                    await _blockingBy.save();
                }

                return type;

            } else if ((type === "UNBLOCK") && (_blockingBy)) {
                /** Unblocking other user from logged in user blockuser array */
                const findIndex = _blockingBy.blockUsers.findIndex((blockedId: any) => String(_blockingUser['_id']) == String(blockedId));
                if (findIndex !== -1) {
                    _blockingBy.blockUsers.splice(findIndex, 1);
                    await _blockingBy.save();
                }

                return type;
            }

            return false;
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
            if (user) {
                user.username = username;
                user.image = image;
                user.isProfileUpdated = true;
                return await user.save();
            }

            return user;
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

    /**
    * @function getUserWIthId
    * @param _id 
    * @returns user
    */
    public async getUserWIthId(_id: mongoose.Schema.Types.ObjectId): Promise<any> {
        return await User.findOne({ _id });
    }

    /**
    * @function getUserWIthUserId
    * @param _id 
    * @returns user
    */
    public async getUserWIthUserId(user: mongoose.Schema.Types.ObjectId): Promise<any> {
        return await User.findOne({ user });
    }
}

export default new UserModel();