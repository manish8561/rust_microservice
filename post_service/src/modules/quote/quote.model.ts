import * as Interfaces from '../../interfaces';
import Quote from './quote.schema';
import Validator from 'validator';
import { Helper } from '../../helpers';
import QueueService from '../../services/queue.service';
import { Constants } from '../../constants';

const {
    Response: { errors },
    Validate: { _validations },
    ResMsg: {
        errors: { SOMETHING_WENT_WRONG, ALL_FIELDS_ARE_REQUIRED },
    }
} = Helper;

class QuoteModel {

    constructor() { }

    /**
     * @function _createQuotePost
     * @param _quote 
     * @returns quotedPost/RebentPost
     */
    public async createQuotePost(_quote: Interfaces.Quote): Promise<any> {
        try {
            let { content, post, type } = _quote;
            let _errors = await _validations({ post });
            if (type === "QUOTE") {
                _errors = await _validations({ content, post });
                _quote.type = "QUOTE";
            }

            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            QueueService.createQuoteQueue(_quote);
            return true;
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }
    /**
     * @function _createQuotePost
     * @param _quote 
     * @returns quotedPost/RebentPost
     */
    public async _createQuotePost(_quote: Interfaces.Quote): Promise<any> {
        try {
            /** creating a post using data from queue */
            const { content, post, user, type } = _quote;
            const quote =  new Quote({ content, user, post, type });
            return await quote.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }

    /**
     * @function rebentPosts
     * @param _quote 
     * @returns 
     */
    public async rebentPosts(_quote: Interfaces.Quote): Promise<any> {
        try {
            let { post, page, limit } = _quote;
            page = String(page); /** convert to string for validation check */
            limit = String(limit) || Constants.PAGE_LIMIT;

            const _errors = await _validations({ post, page, limit });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            page = Number(page); /** convert string to number */
            limit = Number(limit);
           
            /** get rebent posts only */
            return await Quote.find({ post }).sort({ createdAt: -1 }).skip(page * (limit)).limit(limit).populate([
                {
                    path: "user", /** Populate User data */
                    select: "_id username fullName image",
                    model: "User",
                },
                {
                    path: "post", /** Populate post data */
                    select: "_id content image createdAt updatedAt",
                    model: "Post",
                    populate: { /** Nested populate data from post */
                        path: "user",
                        select: "_id username fullName image",
                        model: "User"
                    }
                },
            ]);
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }
}

export default new QuoteModel();