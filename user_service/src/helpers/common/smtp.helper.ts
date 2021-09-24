import * as NodeMailer from 'nodemailer';
const NodemailSendgridTransport = require('nodemailer-sendgrid-transport');

class Smtp {

    constructor() { }

    /**
     * @function initSmtp
     * @returns instance of nodemailer
     */
    private async initSmtp(): Promise<any> {
        return NodeMailer.createTransport(NodemailSendgridTransport({
            auth: { api_key: process.env.SENDGRID_API_KEY }
        }));
    }
    /**
     * @function sendMail
     * @returns sendMail
     */
    public async transportEmail(data: any): Promise<any> {
        /** init _smtp */
        const _smtp = await this.initSmtp();
        const { from, to, subject, html } = data;
        /** send mail to requested email */
        _smtp.sendMail({ from, to, subject, html })
        .then((res: any) => console.log('Email has been sent to requested email'))
        .catch((error: any) => console.log('\n Failed to send Email', error));
    }
}

export default new Smtp();