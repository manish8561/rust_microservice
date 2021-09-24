import User from '../user/user.schema';
import Block from './block.schema';
import * as Helpers from "../../helpers";
import * as Interfaces from '../../interfaces';
import QueueService from '../../services/queue.service';
import mongoose from 'mongoose';
import Constants from '../../constants';

const {
    Response: { errors },
    Validate: { _validations },
    ResMsg: {
        errors: { ALL_FIELDS_ARE_REQUIRED, SOMETHING_WENT_WRONG },
        user: { USER_NOT_FOUND },
        block: { BLOCK_ALREADY, HAVE_NOT_BLOCKED }
    }
} = Helpers;

class BlockModel {

    constructor() { }

    /** 
     * @function blockUnblockUser
     * @param _block 
     * @returns blockUser
     */
    public async blockUnblockUser(_block: Interfaces.Block): Promise<any> {
        try {
            let { blockingUser, blockingBy, type } = _block;
            /** Validation incomding params - req.body */
            const _errors = await _validations({ blockingUser, type });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            /** checking if user exits the one id is comeing in body */
            const isUserExist = await User.findOne({ _id: blockingUser });
            if (!isUserExist) {
                return errors(USER_NOT_FOUND);
            }

            /** checking if logged in user has blocked other user already */
            let isBlockedBefore = await this.isUsserBlocked(blockingUser, blockingBy);
            if ((type === "BLOCK") && (isBlockedBefore)) {
                return errors(BLOCK_ALREADY);
            } else if ((type === "UNBLOCK") && (!isBlockedBefore)) {
                return errors(HAVE_NOT_BLOCKED);
            } else if ((type === "UNBLOCK") && (isBlockedBefore)) {
                _block['_id'] = isBlockedBefore['_id'];
            }

            /** calling private function */
            return this._blockUnblockUser(_block);
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function _blockUnblockUser
     * @param _block 
     * @returns 
     */
    private async _blockUnblockUser(_block: Interfaces.Block): Promise<any> {
        try {
            const { blockingUser, blockingBy, type, _id } = _block;
            let block: any = null;
            if (type === "BLOCK") {
                block = new Block({ blockingUser, blockingBy });
                block = await block.save();
            } else if (type === "UNBLOCK") {
                block = await Block.deleteOne({ _id });
            }

            /** if block document save then pass data to rabbitmq to communicate in toher tables */
            if (block) QueueService.createQueueForBlockUnblock(_block);
            return block;
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function listOfBlockedUsers
     * @param _block 
     * @returns 
     */
    public async listOfBlockedUsers(_block: Interfaces.Block): Promise<any> {
        try {
            let { page, limit, blockingBy } = _block;
            /** follower = logged in user */
            page = String(page); /** convert to string to validate */
            limit = String(limit);

            const _errors = await _validations({ page, limit });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            page = Number(page); /** convert to number again to proceed in mongo query */
            limit = Number(limit) || Constants.PAGE_LIMIT;
            /** FIND AN RETURN LIST OF FOLLOWED REQUEST */
            return await Block.find({ blockingBy }).skip(page * (limit)).limit(limit).populate([{
                path: "blockingUser",
                select: "_id username image user",
                model: "User"
            }]);
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function isUsserBlocked
     * @param blockUser 
     * @param user 
     * @returns 
     */
    public async isUsserBlocked(blockingUser: mongoose.Types.ObjectId, blockingBy: mongoose.Types.ObjectId): Promise<any> {
        return await Block.findOne({ blockingUser, blockingBy });
    }

}

export default new BlockModel();