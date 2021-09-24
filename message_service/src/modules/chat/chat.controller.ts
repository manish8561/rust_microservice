import { NextFunction, Request, Response, Router } from "express";
import { Helper } from "../../helpers";
import * as Interfaces from '../../interfaces';
import ValidateJWT from "../../middlewares/jwt.middleware";
import TransformRequestUser from "../../middlewares/user.middleware";
import ChatModel from "./chat.model";

const { 
    Response: { _success, _error },
    ResMsg: { chat: { FETCHED_CHATS } }
} = Helper;

class ChatController implements Interfaces.Controller {
    public path = '/chat';
    public router = Router();

    constructor() { this.initializeRoutes(); }

    private async initializeRoutes() {
        this.router
            .all(`${this.path}/*`)
            .post(`${this.path}/chatList`, ValidateJWT, TransformRequestUser, this.chatList)
        }

    /**
     * @api chatList
     * @param req 
     * @param res 
     * @param next 
     * @returns User
     */
    public async chatList(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _chat: Interfaces.Chat = req.body;
            const { _id } = req.user;
            _chat.from = _id;

            let result = await ChatModel.chatList(_chat);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });

            result = { chats: result };
            /** return seccess - registered user */
            return _success(res, { message: FETCHED_CHATS, data: result });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    };


}

export default ChatController;