import { NextFunction, Request, Response, Router } from "express";
import { Helper } from "../../helpers";
import * as Interfaces from '../../interfaces';
import ValidateJWT from "../../middlewares/jwt.middleware";
import TransformRequestUser from "../../middlewares/user.middleware";
import MessageModel from "./message.model";

const { 
    Response: { _success, _error },
    ResMsg: { message: { FETCHED_CHATS, UUPDATED_IS_READS } }
} = Helper;

class MessageController implements Interfaces.Controller {
    public path = '/message';
    public router = Router();

    constructor() { this.initializeRoutes(); }

    private async initializeRoutes() {
        this.router
            .all(`${this.path}/*`)
            .post(`${this.path}/messagesList`, ValidateJWT, TransformRequestUser, this.messagesList)
            .post(`${this.path}/updateIsReads`, ValidateJWT, TransformRequestUser, this.updateIsReads)
        }

    /**
     * @api chatList
     * @param req 
     * @param res 
     * @param next 
     * @returns User
     */
    public async messagesList(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _message: Interfaces.Message = req.body;
            const { _id } = req.user;
            _message.from = _id;

            let result = await MessageModel.messagesList(_message);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });
            /** return seccess - registered user */
            return _success(res, { message: FETCHED_CHATS, data: result });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    };

    /**
     * @function updateIsReads
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    public async updateIsReads(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _message: Interfaces.Message = req.body;
            const { _id } = req.user;
            _message.from = _id;

            let result = await MessageModel.updateIsRead(_message);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });
            /** return seccess - registered user */
            return _success(res, { message: UUPDATED_IS_READS });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    };


}

export default MessageController;