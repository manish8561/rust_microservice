import Follow from './follow.schema';
import * as Helpers from "../../helpers";
import * as Interfaces from '../../interfaces';
import QueueService from '../../services/queue.service';
import mongoose from 'mongoose';
import Constants from '../../constants';
import Block from '../block/block.schema';

const {
    Response: { errors },
    // Validate: { _validations },
    ResMsg: {
        errors: { ALL_FIELDS_ARE_REQUIRED, FOLLOW_CANT_BE_A_SAME_USER, SOMETHING_WENT_WRONG },
        block: { USER_BLOCKED, USER_BLOCKED_BY_OTHER },
        follow: { USER_ALREADY_FOLLOWED }
    }
} = Helpers;

class FollowModel {

    constructor() { }

    /** 
     * @function followUnfollowUser
     * @param user 
     * @returns followed user
     */
    public async followUnfollowUser(_follow: Interfaces.Follow): Promise<any> {
        try {
            let { following, follower, type } = _follow;
            /** Default type = FOLLOW, follower is logged in user id, following that we are following */

            /** Validation incomding params - req.body */
            const _errors = await Helpers.Validate._validations({ following, type });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            /** logged in user and following id can not be same */
            if (String(follower) === String(following)) {
                return errors(FOLLOW_CANT_BE_A_SAME_USER);
            }

            /** checking if user has block that user */
            const isBlockedByYou = await Block.findOne({ blockingUser: following, blockingBy: follower });
            if (isBlockedByYou) {
                return errors(USER_BLOCKED);
            }

            /** checking if user blocked by other user */
            const isBlockedByOther = await Block.findOne({ blockingUser: follower, blockingBy: following });
            if (isBlockedByOther) {
                return errors(USER_BLOCKED_BY_OTHER);
            }

            /** G etting document for loggedin user of following other user && if other user followed back */
            const isFollowing = await this.findFollowedUser(following, follower);
            const isFollower = await this.findFollowedUser(follower, following);

            if (((isFollowing) && ((type === "FOLLOW") && (isFollowing.type === "FOLLOW")) && (String(isFollowing.follower) === String(follower)) || ((isFollower) && ((type === "FOLLOW") && (isFollower.type === "FOLLOW")) && (String(isFollower.follower) === String(follower))))) {
                /** return if already followed to a user */
                return errors(USER_ALREADY_FOLLOWED);
            } else if ((isFollowing) && ((type === "FOLLOW") && (isFollowing.type === "UNFOLLOW"))) {
                /** change type t o followed if found other user is already friend */
                _follow.type = "FOLLOWED_FOUND";
                _follow['_id'] = isFollowing['_id'];

            } else if ((isFollower) && ((type === "FOLLOW") && (isFollower.type === "UNFOLLOW"))) {
                /** change type t o followed if found other user is already friend */
                _follow.type = "FOLLOWED_FOUND";
                _follow['_id'] = isFollower['_id'];

            } else if (type === "UNFOLLOW") {
                if (String(isFollowing.follower) === String(follower)) {
                    /** CHECKING WHICH USER LOGGED IN AND CHANGE ID ACCORDING TO PARTICULAR DOCUMENT */
                    _follow['_id'] = isFollowing
                } else if (String(isFollower.follower) === String(follower)) {
                    _follow['_id'] = isFollower['_id'];
                }
            }

            /** creating a queue service to consume in post service to add data in user data required fields */
            QueueService.createFollowQueueToFollowUser(_follow);
            return _follow;
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /** 
    * @function _followUnfollowUser
    * @param user 
    * @returns followed user
    */
    public async _followUnfollowUser(_follow: Interfaces.Follow | any): Promise<any> {
        try {
            let { following, follower, type, _id } = _follow;
            let isFollowing: any = await Follow.findOne({ _id });

            switch (type) {
                case "UNFOLLOW":
                    /** UNFOLLOWING A USER */
                    isFollowing.type = "UNFOLLOW";
                    return await isFollowing.save();

                case "FOLLOWED_FOUND":
                    /** Use FOLLOWED_BACK type to follow again after user had unfollowed */
                    isFollowing.type = "FOLLOW";
                    return await isFollowing.save();

                default:
                    /** creating a new fpllpw request or if already exist then accept previous req */
                    let followingUser = new Follow({ following, follower, type });
                    followingUser = await followingUser.save();
                    if (followingUser) {
                        /** after creating new following back it will update on previous user followed document */
                        let isFollower = await this.findFollowedUser(follower, following);
                        if (isFollower) {
                            isFollower.follow = followingUser['_id'];
                            isFollower = await isFollower.save();
                            /** update back follow document id after save in followers document */
                            let isFollowing = await this.findFollowedUser(following, follower);
                            isFollowing.follow = isFollower['_id'];
                            await isFollowing.save();
                        }

                    }

                    return followingUser;
            }
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /** 
     * @function followingsList
     * @param user 
     * @returns followed user
     */
    public async followingsList(_follow: Interfaces.Follow): Promise<any> {
        try {
            let { page, limit, follower } = _follow;
            /** follower = logged in user */
            page = String(page); /** convert to string to validate */
            limit = String(limit);

            const _errors = await Helpers.Validate._validations({ page, limit });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            page = Number(page); /** convert to number again to proceed in mongo query */
            limit = Number(limit) || Constants.PAGE_LIMIT;
            /** FIND AN RETURN LIST OF FOLLOWED REQUEST */
            return await Follow.find({ follower, type: "FOLLOW" }).skip(page * (limit)).limit(limit).populate([
                {
                    path: "follower",
                    select: "_id username image",
                    model: "User"
                },
                {
                    path: "following",
                    select: "_id username image",
                    model: "User"
                },
                {
                    path: "follow",
                    select: "_id type following follower",
                    model: "Follow"
                },
            ]);
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /** 
     * @function followersList
     * @param user 
     * @returns followed user
     */
    public async followersList(_follow: Interfaces.Follow): Promise<any> {
        try {
            let { page, limit, follower } = _follow;
            /** follower = logged in user */
            page = String(page); /** convert to string to validate */
            limit = String(limit);

            const _errors = await Helpers.Validate._validations({ page, limit });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            page = Number(page); /** convert to number again to proceed in mongo query */
            limit = Number(limit) || Constants.PAGE_LIMIT;

            /** FIND AN RETURN LIST OF FOLLOWED FRIEND LIST - where follower = logged in user */
            return await Follow.find({ following: follower, type: "FOLLOW" }).skip(page * (limit)).limit(limit).populate([
                {
                    path: "following",
                    select: "_id username image",
                    model: "User"
                },
                {
                    path: "follower",
                    select: "_id username image",
                    model: "User"
                },
                {
                    path: "follow",
                    select: "_id type following follower",
                    model: "Follow"
                },
            ]);
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function removeFollowersOnBlock
     * @param _block 
     * @returns removed followed
     */
    public async removeFollowersOnBlock(_block: Interfaces.Block): Promise<any> {
        try {
            const { blockingUser, blockingBy, type } = _block;
            /** finding both docuemnt in follow table */
            const isLoggedinUserFollowed = await this.findFollowedUser(blockingUser, blockingBy);
            const isOtherUserFollowed = await this.findFollowedUser(blockingBy, blockingUser);

            /** checking if both user had followd or not, if found delete document from follow table */
            if ((type === "BLOCK") && ((isLoggedinUserFollowed) || (isOtherUserFollowed))) {
                if (isLoggedinUserFollowed) {
                    const { _id } = isLoggedinUserFollowed;
                    await Follow.deleteOne({ _id });
                }

                if (isOtherUserFollowed) {
                    const { _id } = isOtherUserFollowed;
                    await Follow.deleteOne({ _id });
                }

                return true;
            }

            return false;
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function findFollowedUser
     * @param following 
     * @returns followed user
     */
    private async findFollowedUser(following: mongoose.Types.ObjectId, follower: mongoose.Types.ObjectId): Promise<any> {
        return await Follow.findOne({ following, follower });
    }

}

export default new FollowModel();