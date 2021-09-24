import { NextFunction, Request, Response, Router } from "express";
import { Helper } from "../../helpers";
import * as Interfaces from '../../interfaces';
import UserModel from './user.model';

const {
    Response: { _error, _success },
} = Helper;

class UserController implements Interfaces.Controller {
    public path = '/user';
    public router = Router();

    constructor() { this.initializeRoutes(); }

    private async initializeRoutes() {
        this.router
            .all(`${this.path}/*`)
            .post(`${this.path}/userDetailsFromMsgeSrv`, this.userDetailsFromMsgeSrv)
    }

    /**
     * @api userDetailsFromMsgeSrv
     * @param req 
     * @param res 
     * @param next 
     * @returns User
     */
    public async userDetailsFromMsgeSrv(req: Request | any, res: Response, next: NextFunction) {
        try {
            const { user } = req.body;
            let result = await UserModel.userDetailsFromMsgeSrv(user);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });
            result = { user: result };
            /** return seccess - registered user */
            return _success(res, { message: "", data: result });
        } catch (error) {
            return _error(res, { status: 400, error });
        }
    };

}

export default UserController;