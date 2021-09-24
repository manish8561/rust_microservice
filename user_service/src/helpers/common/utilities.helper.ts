import * as jwt from "jsonwebtoken";
import * as bcrypt from 'bcryptjs';
const OtpGenerator = require('otp-generator');
import * as CryptoJS from 'crypto-js';

const ONE_DAY = 60 * 60 * 24 * 7; /** One day */

class Utilities {

    constructor() { }

    /**
     * @function generateJwt
     * @param jwtData 
     * @returns Promise
     */
    public async generateJwt(jwtData: object): Promise<any> {
        const secret: any = process.env.JWTSECRET;

        try {
            return await jwt.sign(jwtData, secret, { expiresIn: ONE_DAY });
        } catch (error) {
            return error;
        }
    }

    /**
     * @function requestEncryption
     * @param data 
     * @returns 
     */
    public requestEncryption(data: any) {
        const encryptionKey: any = process.env.ENCDECRYPTKEY;
        return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
    }

    /**
     * @function reqDeEncrypt
     * @param text 
     * @returns 
     */
    public reqDeEncrypt(data: any) {
        const reqEncKey: any = process.env.ENCDECRYPTKEY!;
        return CryptoJS.AES.decrypt(data, reqEncKey).toString(CryptoJS.enc.Utf8);
    }

    /**
     * @function randomString
     * @param length 
     * @returns string
     */
    public randomString(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i += 1) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    /**
     * @function generateHash
     * @param password 
     * @returns Promise
     */
    public async generateHash(address: any): Promise<any> {
        try {
            const saltRounds = 12;
            return await bcrypt.hash(address, saltRounds);
        } catch (error) {
            return error;
        }
    }

    /**
     * @function compareHash
     * @param passwordtext 
     * @param hash 
     * @returns 
     */
    public async compareHash(passwordtext: string, hash: string): Promise<any> {
        const saltRounds = 10;
        return await bcrypt.compare(passwordtext, hash);
    }

    public async generateOtp(limit: number): Promise<any> {
        return OtpGenerator.generate(limit, { upperCase: false, specialChars: false, alphabets: false });
    }
}

export default new Utilities();