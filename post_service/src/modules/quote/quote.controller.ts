import { NextFunction, Response, Request, Router } from "express";
import { Helper } from "../../helpers";
import * as Interfaces from '../../interfaces';
import ValidateJWT from "../../middlewares/jwt.middleware";
import TransformRequestUser from "../../middlewares/user.middleware";
import QuoteModel from './quote.model';

const {
    Response: { _error, _success },
    ResMsg: {
        post: { POST_QUOTED_SUCCESS, FETCHED_REBENTS }
    }
} = Helper;

class QuoteController implements Interfaces.Controller {
    public path = '/quote';
    public router = Router();

    constructor() { this.initializeRoutes(); }

    private async initializeRoutes() {
        this.router
            .all(`${this.path}/*`)
            .post(`${this.path}/createQuotePost`, ValidateJWT, TransformRequestUser, this.createQuotePost)
            .post(`${this.path}/rebentPosts`, ValidateJWT, TransformRequestUser, this.rebentPosts)
    }

    /**
     * @api createPost
     * @param req 
     * @param res 
     * @param next 
     * @returns quote/rebent post
     */
    private async createQuotePost(req: Request | any, res: Response, next: NextFunction) {
        try {
            let quote: Interfaces.Quote = req.body;
            const { _id } = req.user;
            quote.user = _id; /** adding user id to incoming object */

            const result: any = await QuoteModel.createQuotePost(quote);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result });
            /** return seccess - registered user */
            return _success(res, { message: POST_QUOTED_SUCCESS });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }

    /**
     * @api rebentPosts
     * @param req 
     * @param res 
     * @param next 
     * @returns list of Rebent Posts
     */
    private async rebentPosts(req: Request | any, res: Response, next: NextFunction) {
        try {
            let quote: Interfaces.Quote = req.body;
            const { _id } = req.user;
            quote.user = _id; /** adding user id to incoming object */

            let result: any = await QuoteModel.rebentPosts(quote);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result });
            result = { rebents: result };
            /** return seccess - registered user */
            return _success(res, { message: FETCHED_REBENTS, data: result });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    }

}

export default QuoteController;