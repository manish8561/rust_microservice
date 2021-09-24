import * as amqp from 'amqplib/callback_api';
import QueueService from '../../services/queue.service';

class RabbitMq {
    private channel!: amqp.Channel;
    private walletQueueHook = `wallet_queue_${process.env.ENVIROMENT}`.toLowerCase();
    private userQueueHook = `user_queue_${process.env.ENVIROMENT}`.toLowerCase();
    private followQueueHook = `follow_queue_${process.env.ENVIROMENT}`.toLowerCase();
    private followedWebHook = `followed_queue_${process.env.ENVIROMENT}`.toLowerCase();
    private blockUnblockWebHook = `blockUnblock_queue_${process.env.ENVIROMENT}`.toLowerCase();
    private removeFollowOnBlockWebHook = `remove_follow_on_block_queue_${process.env.ENVIROMENT}`.toLowerCase();
    private updateUserProfile = `update_user_profile_${process.env.ENVIROMENT}`.toLowerCase();
    private userMessageWebHook = `user_message_web_hook_${process.env.ENVIROMENT}`.toLowerCase();
    private updateUserProfileInMessageSrv = `user_update_message_web_hook_${process.env.ENVIROMENT}`.toLowerCase();
    
    constructor() { this._connect(); }

    /**
     * @function _connect
     * @returns connection
     */
    public _connect() {
        try {
            const rabbitMq: string = process.env.RabbitMq!;
            amqp.connect(rabbitMq, (_error: Error, _conn: amqp.Connection) => {
                if (_error) { return _error; }
                /** Creating channel */
                _conn.createChannel((_error: Error, channel: amqp.Channel) => {
                    if (_error) { return (_error); }
                    console.log('RabbiMq::Connected Successfully..!!');
                    /** init channel */
                    this.channel = channel;
                    this._initQueue();
                });
            });
        } catch (error) {
            return error
        }
    }

    /**
     * @function _initQueue
     */
    private async _initQueue() {
        this._assertQueue(this.walletQueueHook); /** assert wallet queue */
        this._assertQueue(this.userQueueHook); /** assert user queue */
        this._assertQueue(this.followQueueHook); /** asset follow queue */
        this.consumeQueue(this.followQueueHook); /** comuse follow queue */
        this._assertQueue(this.followedWebHook); /** assert followed user queue to consume in post service */
        this._assertQueue(this.blockUnblockWebHook); /** asseting queue for block unblock */
        this.consumeQueue(this.blockUnblockWebHook); /** comsuming queue for block unblock */
        this._assertQueue(this.removeFollowOnBlockWebHook) /** assert queue remove follow on blick */
        this._assertQueue(this.updateUserProfile) /** assert queue update User profile */
        this._assertQueue(this.userMessageWebHook) /** assert queue to add user data in message service */
        this._assertQueue(this.updateUserProfileInMessageSrv) /** assert queue to add user data in message service */
    }

    /**
     * @function createQueue
     * @returns null
     */
    public createQueue(queue: any, data: any) {
        console.log('\n Hitting -> Creating Queue: ', queue, ' => ', data, '\n');
        this.channel.sendToQueue(queue, Buffer.from(data));
    }

    /**
     * @function consumeQueue
     * @param queue 
     * @returns data
     */
    public async consumeQueue(queue: string) {
        this.channel.consume(queue, async (msg: any) => {
            const data = JSON.parse(msg.content.toString());
            console.log('\n Hitting -> Consume Queue: ', queue, ' => ', JSON.stringify(data), '\n');
            switch (queue) {
                case this.followQueueHook:
                    QueueService.comsumeFollowQueueToFollow(data)
                    this.channel.ack(msg);
                    break;

                case this.blockUnblockWebHook:
                    QueueService.consumeBlockQueueToDeleteFollows(data)
                    this.channel.ack(msg);
                    break;
            }
        }, { noAck: false });
    }

    /**
     * @function _assertQueue
     * @param queue 
     */
    private _assertQueue(queue: string) {
        this.channel.assertQueue(queue, { durable: false });
    }

    /**
     * @function createWalletQueue
     * @param data 
     */
    public createWalletQueue(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.walletQueueHook, data);
    }

    /**
     * @function createUserQueueToComumeInPostDB
     * @param data 
     */
    public createUserQueueToComumeInPostDB(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.userQueueHook, data);
    }

    /**
     * @function sendUserDataToComsumeInMessageDb
     * @param data 
     */
    public sendUserDataToComsumeInMessageDb(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.userMessageWebHook, data);
    }

    /**
     * @function createFollowQueueToFollowUser
     * @param data 
     */
    public createFollowQueueToFollowUser(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.followQueueHook, data);
    }

    /**
 * @function createFollowQueuetoConsumeInpostSrv
 * @param data 
 */
    public createFollowQueuetoConsumeInpostSrv(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.followedWebHook, data);
    }

    /**
     * @function createQueueForBlockUnblock
     * @param data 
     */
    public createQueueForBlockUnblock(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.blockUnblockWebHook, data);
    }

    /**
     * @function createQueuetoRmoveFollowFromPostSrv
     * @param data
     */
    public createQueuetoRmoveFollowFromPostSrv(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.removeFollowOnBlockWebHook, data);
    }

    /**
     * @function createUserUpdateQueueToConsumeInPostSrv
     * @param data 
     */
    public createUserUpdateQueueToConsumeInPostSrv(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.updateUserProfile, data);
    }

    /**
     * @function createUserUpdateQueueToConsumeInMessageSrv
     * @param data 
     */
    public createUserUpdateQueueToConsumeInMessageSrv(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.updateUserProfileInMessageSrv, data);
    }

}

export default new RabbitMq();