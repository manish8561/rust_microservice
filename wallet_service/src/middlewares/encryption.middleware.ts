
import * as CryptoJS from 'crypto-js';
import { NextFunction, Request, Response } from 'express';
import { Helper } from '../helpers';

/**
 * @function RequestDecrypt
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const RequestDecrypt = (req: Request, res: Response, next: NextFunction) => {
    console.log('\n Hitting -> Encryption Request URL: ', req.url, '\n');
    
    const { data } = req.body;
    const isEncryptEnabled = process.env.ENCRYPTION_ENABLED;
    if (isEncryptEnabled) {
        try {
            const dataFields = reqDeEncrypt(data);
            req.body = JSON.parse(dataFields);
            next();
        } catch (error) {
            return Helper.Response._error(res, { status: 500, error });
        }
    } else {
        req.body = data;
        next();
    }
}

/**
 * @function reqDeEncrypt
 * @param text 
 * @returns 
 */
const reqDeEncrypt = (text: any) => {
    const reqEncKey: string = process.env.ENCDECRYPTKEY!;
    const bytes = CryptoJS.AES.decrypt(text, reqEncKey);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext;
}

export default RequestDecrypt;
