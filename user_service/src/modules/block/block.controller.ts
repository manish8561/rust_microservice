import { NextFunction, Request, Response, Router } from "express";
import * as Helpers from "../../helpers";
import * as Interfaces from '../../interfaces';
import ValidateJWT from "../../middlewares/jwt.middleware";
import BlockModel from "./block.model";

const {
    Response: { _error, _success },
    ResMsg: {
        block: { BLOCKED_USER, UNBLOCK_USER, FETCHED_BLOCKED }
    }
} = Helpers;

class BlockController implements Interfaces.Controller {
    public path = '/block';
    public router = Router();

    constructor() { this.initializeRoutes(); }

    private async initializeRoutes() {
        this.router
            .all(`${this.path}/*`)
            .post(`${this.path}/blockUnblockUser`, ValidateJWT, this.blockUnblockUser)
            .post(`${this.path}/listOfBlockedUsers`, ValidateJWT, this.listOfBlockedUsers)
        }

    /**
     * @api blockUnblockUser
     * @param req 
     * @param res 
     * @param next 
     * @returns User
     */
    public async blockUnblockUser(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _block: Interfaces.Block = req.body;
            const { _id } = req.user;
            _block.blockingBy = _id;

            const result = await BlockModel.blockUnblockUser(_block);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });

            /** return seccess - registered user */
            return _success(res, { message: result['deletedCount'] ? UNBLOCK_USER : BLOCKED_USER });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    };

    /**
     * @api listOfBlockedUsers
     * @param req 
     * @param res 
     * @param next 
     * @returns User
     */
     public async listOfBlockedUsers(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _block: Interfaces.Block = req.body;
            const { _id } = req.user;
            _block.blockingBy = _id;

            let result = await BlockModel.listOfBlockedUsers(_block);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });

            result = { blockedUsers: result };
            /** return seccess - registered user */
            return _success(res, { message: FETCHED_BLOCKED, data: result });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    };

}

export default BlockController;