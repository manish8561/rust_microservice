import { Helper } from '../helpers';
import * as Interfaces from '../interfaces';

class QueueService {

    private _messageMode: any = Object.create({});
    private _userModel: any = Object.create({});

    constructor() {
        setTimeout(async () => {
            this._messageMode = (await import("../modules/message/message.model")).default;
            this._userModel = (await import("../modules/user/user.model")).default;
        }, 1000);
    }


    /**
    * @function consumeQueueToUpdateUser
    * @param _user 
    * @returns updated user
    */
    public async consumeQueueToUpdateUser(_user: Interfaces.User) {
        const result = await this._userModel.consumeQueueToUpdateUser(_user);
        if (result.errors) return console.log('\n \n User:: Failed to update user', result);
        console.log('\n \n Profile Updated', result['user'], " => ", result['username'], '\n');
    }

    /**
    * @function consumeUserQueueToAdduserDetails
    * @param _user
    * @returns result
    */
    public async consumeUserQueueToAdduserDetails(_user: Interfaces.User) {
        const result = await this._userModel.createUserInPostDB(_user);
        if (result.errors) return console.log('\n \n User:: Failed to create User', result);
        console.log('\n \n User has been created successfully..!!', result['user'], " => ", result['_id'], '\n');
    }

    /**
   * @function createMessageQueue
   * @param _msg
   * @returns 
   */
    public async createMessageQueue(_msg: Interfaces.Message) {
        Helper.RabbitMq.createMessageQueue(_msg);
    }


    /**
   * @function createQueueToUpdateRead
   * @param _msg
   * @returns 
   */
    public async createQueueToUpdateRead(_msg: Interfaces.Message) {
        Helper.RabbitMq.createQueueToUpdateRead(_msg);
    }


    /**
     * @function createMessage
     * @param _user 
     * @returns result
     */
    public async consumeAddMessageQueue(_msg: Interfaces.Message) {
        const result = await this._messageMode.addMessage(_msg);
        if (result.errors) return console.log('\n \n User:: Failed to save message', result);
        console.log('\n \n Message saved successfully..!!', result['message'], '\n');
    }

    /**
 * @function comsumeUpdateIsReadQueue
 * @param _user 
 * @returns result
 */
    public async comsumeUpdateIsReadQueue(_msg: Interfaces.Message) {
        const result = await this._messageMode.updateIsRead(_msg);
        if (result.errors) return console.log('\n \n User:: Failed to update is read', result);
        console.log('\n \n Update is Read successfully..!!', result, '\n');
    }
}


export default new QueueService();