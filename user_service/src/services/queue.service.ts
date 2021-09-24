import * as Helpers from "../helpers";
import * as Interfaces from '../interfaces';
import FollowModel from '../modules/follow/follow.model';

class QueueService {
    constructor() { }

    /**
     * @function sendWalletDataToWalletQueue
     * @param wallet 
     */
    public sendWalletDataToWalletQueue(wallet: any) {
        Helpers.RabbitMq.createWalletQueue(wallet);
    }

    /**
     * @function sendUserDataToComsumeInPostDb
     * @param user 
     */
    public sendUserDataToComsumeInPostDb(user: any) {
        Helpers.RabbitMq.createUserQueueToComumeInPostDB(user);
    }

    /**
     * @function sendUserDataToComsumeInMessageDb
     * @param user 
     */
    public sendUserDataToComsumeInMessageDb(user: any) {
        Helpers.RabbitMq.sendUserDataToComsumeInMessageDb(user);
    }

    /**
     * @function createFollowQueueToFollowOtherUser
     * @param user 
     */
    public createFollowQueueToFollowUser(user: any) {
        Helpers.RabbitMq.createFollowQueueToFollowUser(user);
    }

    /**
   * @function createUserUpdateQueueToConsumeInPostSrv
   * @param user 
   */
    public createUserUpdateQueueToConsumeInPostSrv(user: any) {
        Helpers.RabbitMq.createUserUpdateQueueToConsumeInPostSrv(user);
    }

    /**
     * @function createUserUpdateQueueToConsumeInMessageSrv
     * @param user 
     */
    public createUserUpdateQueueToConsumeInMessageSrv(user: any) {
        Helpers.RabbitMq.createUserUpdateQueueToConsumeInMessageSrv(user);
    }

    /**
     * @function comsumeFollowQueueToFollow
     * @param follow 
     * @returns followed user
     */
    public async comsumeFollowQueueToFollow(_follow: Interfaces.Follow) {
        const result = await FollowModel._followUnfollowUser(_follow);
        if (result.errors) {
            return console.log('\n \n Failed To follow user ', ' => ', result, '\n');
        } else if (result.type === "FOLLOW") {
            console.log('\n \n User followed ', result.follower, ' => ', result.following, " => ", result['_id'], '\n');
        } else if (result.type === "FOLLOWING") {
            console.log('\n \n User followed back', result.follower, ' => ', result.following, " => ", result['_id'], '\n');
        } else {
            console.log('\n \n User unfollowed ', result.follower, ' => ', result.following, " => ", result['_id'], '\n');
        }

        this.createFollowQueuetoConsumeInpostSrv(result);
    }

    /**
    * @function createFollowQueuetoConsumeInpostSrv
    * @param followed User
    */
    private createFollowQueuetoConsumeInpostSrv(_follow: Interfaces.Follow) {
        Helpers.RabbitMq.createFollowQueuetoConsumeInpostSrv(_follow);
    }

    /**
     * @function createQueueForBlockUnblock
     * @param _block 
     */
    public createQueueForBlockUnblock(_block: Interfaces.Block) {
        Helpers.RabbitMq.createQueueForBlockUnblock(_block);
    }

    /**
     * @function consumeBlockQueueToDeleteFollows
     * @param _block 
     */
    public async consumeBlockQueueToDeleteFollows(_block: Interfaces.Block) {
        const result = await FollowModel.removeFollowersOnBlock(_block);
        if (result.errors) {
            return console.log('\n \n Failed To remove follow up user ', ' => ', result, '\n');
        } else if (result) {
            console.log('\n \n Removed from followers ', ' => ', result, '\n');
        } else if (!result) {
            console.log('\n \n Did not found any follow records ', ' => ', result, '\n');
        }

        /** passing data to post service to consume in user.model to save block users in array to hide feeds */
        this.createQueuetoRmoveFollowFromPostSrv(_block);
    }

    /**
     * @function createQueuetoRmoveFollowFromPostSrv
     * @param _block 
     */
    private createQueuetoRmoveFollowFromPostSrv(_block: Interfaces.Block) {
        Helpers.RabbitMq.createQueuetoRmoveFollowFromPostSrv(_block);
    }
}

export default new QueueService();