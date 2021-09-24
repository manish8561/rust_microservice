import Message from './message.schema';
import * as Interfaces from '../../interfaces';
import { Helper } from '../../helpers';
import ChatModel from '../chat/chat.model';
import User from '../user/user.schema';
import { Constants } from '../../constants';
import mongoose from 'mongoose';

const {
    Validate: { _validations },
    Response: { errors },
    ResMsg: { errors: {ALL_FIELDS_ARE_REQUIRED, SOMETHING_WENT_WRONG }}
} = Helper;



class MessageModel {

    constructor() { }


    /**
     * @function getList
     * @param _message
     * @returns chats list
     */
     public async messagesList(_message: Interfaces.Message): Promise<any> {
        try {
            let { from, to, limit } = _message;
            limit = String(limit) || Constants.PAGE_LIMIT;

            const _errors = await _validations({ limit });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            /** get rebent posts only */
            const totalCounts = await Message.countDocuments({ $or: [ { from: from, to: to }, { from: to, to: from } ] });
            
            let page: number = Math.ceil(Number(totalCounts) / Number(limit)); /** convert string to number */
            page = page - 1;
            limit = Number(limit);

            const messages = await Message.find({ $or: [ { from: from, to: to }, { from: to, to: from } ] }).sort({ createdAt: 1 }).skip(page * (limit)).limit(Constants.PAGE_LIMIT).populate([
                {
                    path: "to", /** Populate User data */
                    select: "_id username image user",
                    model: "User",
                },
                {
                    path: "from", /** Populate User data */
                    select: "_id username image user",
                    model: "User",
                },
            ]);

            console.log({ message: messages.length, page, limit });
            return { messages, totalCounts };
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function addMessage
     * @param _msg 
     * @returns 
     */
    public async addMessage(_msg: Interfaces.Message): Promise<any> {
        try {
            const { message, from , to } = _msg;

            /** getting details of user on the basis of user to _id */
            const fromUser: any = await User.findOne({ user: from }); 
            const toUser: any = await User.findOne({ user: to });

            /** saving chat at first and update message regularly */
            let isChat: Interfaces.Chat | any = await ChatModel.findChat({ from: fromUser['_id'], to: toUser['_id'] });
            if (!isChat) {
                isChat = await ChatModel.addChat({ from: fromUser['_id'], to: toUser['_id'], message });                
                return await this.saveMessage(fromUser, toUser, message, isChat);
            } else if (isChat) {
                isChat.lastMsg = message;
                isChat.updatedAt = Date.now();
                isChat = await isChat.save();
                return await this.saveMessage(fromUser, toUser, message, isChat);
            }
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function saveMessage
     * @param fromUser 
     * @param toUser 
     * @param message 
     * @param isChat 
     * @returns 
     */
    private async saveMessage(fromUser: Interfaces.User, toUser: Interfaces.User, message: string, isChat: Interfaces.Chat): Promise<any> {
        try {
            const saveMsg = new Message({ from: fromUser['_id'] , to: toUser['_id'], message, chat: isChat['_id'] });
            return await saveMsg.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function updateIsRead
     * @param _msg 
     * @returns 
     */
    public async updateIsRead(_msg: Interfaces.Message): Promise<any> {
        try {
            const { from , to } = _msg;
            const fromUser: any = await User.findOne({ $or: [ {user: from}, { _id: from } ] }); 
            const toUser: any = await User.findOne({ $or: [ { user: to }, { _id: to } ] });
            /** updateing all messages sent by another user to logged in user to true */
            return await Message.updateMany(
                { to: fromUser['_id'], from: toUser['_id'], isRead: false }, 
                { $set: { isRead: true } },
                { upsert: false }
            );
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }
    
}

export default new MessageModel();