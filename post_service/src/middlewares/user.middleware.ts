import { NextFunction, Response } from 'express';
import { Helper } from '../helpers';
import User from '../modules/user/user.schema';

/**
 * @function getUserDetailsFromUserDb
 * @param req 
 * @param res 
 * @param next 
 */
const TransformRequestUser = async (req: Request | any, res: Response, next: NextFunction) => {
    console.log('\n Hitting -> User Middleware On Request URL: ', req.url, '\n');
    const { _id, publicKey } = req.user;

    let user: any = await User.findOne({ user: _id });
    if (!user) {
        return Helper.Response._error(res, { status: 401, error: { message: "Something went wrong, Please login and try again." }  })
    }
    user = { _id: user['_id'], publicKey, user: _id };
    req.user = user;
    console.log('\n');
    next();
}

export default TransformRequestUser;