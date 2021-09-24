import Chat from './chat.schema';
import * as Interfaces from '../../interfaces';
import { Helper } from '../../helpers';
import { Constants } from '../../constants';
import mongoose from 'mongoose';

const {
    Validate: { _validations },
    Response: { errors },
    ResMsg: {
        errors: { ALL_FIELDS_ARE_REQUIRED, SOMETHING_WENT_WRONG }
    }
} = Helper;

class ChatModel {

    constructor() { }

    /**
     * @function chatList
     * @param _chat
     * @returns chats list
     */
    public async chatList(_chat: Interfaces.Chat | any): Promise<any> {
        try {
            let { from, page, limit } = _chat;
            page = String(page); /** convert to string for validation check */
            limit = String(limit) || Constants.PAGE_LIMIT;

            const _errors = await _validations({ page, limit });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            page = Number(page); /** convert string to number */
            limit = Number(limit);

            /** get rebent posts only */
            const query: any = [
                { $match: { $or: [ { from: from }, { to: from } ] } },
                { $sort: { updatedAt: -1 } },
                { $skip: page * (limit) },
                { $limit: limit },
                { $lookup: {
                    from: 'users',
                    localField: "from",
                    foreignField: "_id",
                    as: "from"
                }},
                { $unwind: { path: "$from", preserveNullAndEmptyArrays: true } },
                { $lookup: {
                    from: 'users',
                    localField: "to",
                    foreignField: "_id",
                    as: "to"
                }},
                { $unwind: { path: "$to", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'messages', 
                        let: { "chatId": "$_id" }, 
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and : [
                                            { $eq: ["$chat", "$$chatId"] },
                                            { $eq: ["$to", mongoose.Types.ObjectId(from)] },
                                            { $eq: ["$isRead", false] },
                                        ]
                                    }
                                }
                            },
                            {
                                $group: {
                                  _id: {
                                    chat: "$chat",
                                    from: "$from",
                                    to: "$to",
                                    isRead: "$isRead"
                                  }, count: { $sum: 1 }
                                }
                              },
                              { $project: { "count": 1, "_id": 0 } }
                        ],
                        as: "counts"
                    }
                },
                { $unwind: { path: "$counts", preserveNullAndEmptyArrays: true } },
            ];

            return await Chat.aggregate(query);
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function addChat
     * @param _chat 
     * @returns 
     */
    public async addChat(_chat: Interfaces.Chat | any): Promise<any> {
        try {
            const { from, to, message } = _chat;
            const chat = new Chat({ from, to, lastMsg: message });
            return await chat.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function findChat
     * @param _chat 
     * @returns 
     */
    public async findChat(_chat: Interfaces.Chat | any): Promise<any> {
        const { from, to } = _chat;
        return await Chat.findOne({ $or: [ { from: from, to: to }, { from: to, to: from }] });
    }
}

export default new ChatModel();