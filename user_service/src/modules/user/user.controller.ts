import { NextFunction, Request, Response, Router } from "express";
import * as Helpers from "../../helpers";
import * as Interfaces from '../../interfaces';
import RequestDecrypt from "../../middlewares/encryption.middleware";
import ValidateJWT from "../../middlewares/jwt.middleware";
import UserModel from './user.model';
import Constants from "../../constants";

const {
    Response: { _error, _success },
    Smtp: { transportEmail },
    ResMsg: { 
        auth: { SUCCESS },
        user: { OTP_SENT, MOBILE_VERIFIED, EMAIL_VERIFIED, UPDATED_PROFILE, FETCHED_USER_DETAILS },
    }
} = Helpers;

class UserController implements Interfaces.Controller {
    public path = '/user';
    public router = Router();

    constructor() { this.initializeRoutes(); }

    private async initializeRoutes() {
        this.router
            .all(`${this.path}/*`)
            .post(`${this.path}/checkUserAndMaybeRegister`, RequestDecrypt, this.checkUserAndMaybeRegister)
            .post(`${this.path}/addMobile`, RequestDecrypt, ValidateJWT, this.addMobile)
            .post(`${this.path}/verifyMobile`, RequestDecrypt, ValidateJWT, this.verifyMobile)
            .post(`${this.path}/addEmail`, RequestDecrypt, ValidateJWT, this.addEmail)
            .post(`${this.path}/verifyEmail`, RequestDecrypt, ValidateJWT, this.verifyEmail)
            .post(`${this.path}/updateProfile`, RequestDecrypt, ValidateJWT, this.updateProfile)
            .post(`${this.path}/userDetails`, this.userDetails)
    }

    /**
     * @api checkUserAndMaybeRegister
     * @param req 
     * @param res 
     * @param next 
     * @returns User
     */
    public async checkUserAndMaybeRegister(req: Request, res: Response, next: NextFunction) {
        try {
            const _user: Interfaces.User = req.body;
            let result = await UserModel.checkUserAndMaybeRegister(_user);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });

            /** Generate JWT token for authentication */
            const token: string = await UserModel.generateJwtToken(result);
            /** creating reponse object */
            result = { user: result };
            /** return seccess - registered user */
            return _success(res, { message: SUCCESS, data: result, token });
        } catch (error:any) {
            return _error(res, { status: 400, error });
        }
    };

    /**
     * @api addMobile
     * @param req 
     * @param res 
     * @param next 
     * @returns User
     */
    public async addMobile(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _user: Interfaces.User = req.body;
            const { _id } = req.user;
            _user['_id'] = _id;

            let result = await UserModel.addMobile(_user);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });

            /** creating reponse object */
            result = { user: { mobile: result.mobile, otp: result.otp } };
            /** return seccess - registered user */
            return _success(res, { message: OTP_SENT, data: result });
        } catch (error:any) {
            console.log(error);
            return _error(res, { status: 400, error });
        }
    };

    /**
     * @api verifyMobile
     * @param req 
     * @param res 
     * @param next 
     * @returns User
     */
    public async verifyMobile(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _user: Interfaces.User = req.body;
            const { _id } = req.user;
            _user._id = _id;

            let result = await UserModel.verifyMobile(_user);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });

            /** return seccess - registered user */
            return _success(res, { message: MOBILE_VERIFIED });
        } catch (error:any) {
            return _error(res, { status: 400, error });
        }
    };

    /**
        * @api addEmail
        * @param req 
        * @param res 
        * @param next 
        * @returns User
        */
    public async addEmail(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _user: Interfaces.User = req.body;
            const { _id } = req.user;
            _user._id = _id;
            const { email } = req.user;

            let result = await UserModel.addEmail(_user);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });

            /** creating reponse object */
            result = { user: { email: result.email, otp: result.otp } };

            /** Send otp using send email service */
            transportEmail({ 
                from: Constants.SMTP_FROM, 
                to: result.user.email,
                subject: "Email Verification",
                html: Constants.EMAIL_HTML(result.user.otp)
            });
            /** return seccess - registered user */
            return _success(res, { message: OTP_SENT, data: result });
        } catch (error:any) {
            return _error(res, { status: 400, error });
        }
    };

    /**
     * @api verifyEmail
     * @param req 
     * @param res 
     * @param next 
     * @returns User
     */
    public async verifyEmail(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _user: Interfaces.User = req.body;
            const { _id } = req.user;
            _user._id = _id;

            let result = await UserModel.verifyEmail(_user);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });

            /** return seccess - registered user */
            return _success(res, { message: EMAIL_VERIFIED });
        } catch (error:any) {
            return _error(res, { status: 400, error });
        }
    };

    /**
     * @api userDetails
     * @param req 
     * @param res 
     * @param next 
     * @returns User
     */
    public async userDetails(req: Request | any, res: Response, next: NextFunction) {
        try {
            const { _id } = req.body;
            let result = await UserModel.userDetails(_id);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });
            result = { user: result };
            /** return seccess - registered user */
            return _success(res, { message: FETCHED_USER_DETAILS, data: result });
        } catch (error:any) {
            return _error(res, { status: 400, error });
        }
    };

     /**
     * @api updateProfile
     * @param req 
     * @param res 
     * @param next 
     * @returns User
     */
      public async updateProfile(req: Request | any, res: Response, next: NextFunction) {
        try {
            let _user: Interfaces.User = req.body;
            const { _id } = req.user;
            _user['_id'] = _id;

            let result = await UserModel.updateProfile(_user);
            /** return error - failed status */
            if (result.errors) return _error(res, { status: 400, error: result.errors });

            result = { user: result };
            /** return seccess - registered user */
            return _success(res, { message: UPDATED_PROFILE, data: result });
        } catch (error:any) {
            return _error(res, { status: 400, error });
        }
    };
}

export default UserController;