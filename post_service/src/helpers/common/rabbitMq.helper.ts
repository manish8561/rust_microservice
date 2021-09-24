import * as amqp from 'amqplib/callback_api';
import QueueService from '../../services/queue.service';

class RabbitMq {
    private channel!: amqp.Channel;
    private postQueueHook = `post_queue_${process.env.ENVIROMENT}`.toLowerCase();
    private likeQueueHook = `like_queue_${process.env.ENVIROMENT}`.toLowerCase();
    private commentQueueHook = `comment_queue_${process.env.ENVIROMENT}`.toLowerCase();
    private userQueueHook = `user_queue_${process.env.ENVIROMENT}`.toLowerCase();
    private quoteQueueHook = `quote_queue_${process.env.ENVIROMENT}`.toLowerCase();
    private followedWebHook = `followed_queue_${process.env.ENVIROMENT}`.toLowerCase();
    private removeFollowOnBlockWebHook = `remove_follow_on_block_queue_${process.env.ENVIROMENT}`.toLowerCase();
    private updateUserProfile = `update_user_profile_${process.env.ENVIROMENT}`.toLowerCase();

    constructor() { this._connect(); }

    /**
     * @function _connect
     * @returns 
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
        this._assertQueue(this.postQueueHook); /** assert post queue */
        this.consumeQueue(this.postQueueHook); /** consume post queue */
        this._assertQueue(this.likeQueueHook); /** assert like queue */
        this.consumeQueue(this.likeQueueHook); /** consume like queue */
        this._assertQueue(this.commentQueueHook); /** assert comment queue */
        this.consumeQueue(this.commentQueueHook); /** consume comment queue */
        this._assertQueue(this.userQueueHook); /** assert user queue */
        this.consumeQueue(this.userQueueHook); /** consume user queue */
        this._assertQueue(this.quoteQueueHook); /** asset qoute queue */
        this.consumeQueue(this.quoteQueueHook); /** consume qoute queue */
        this._assertQueue(this.followedWebHook); /** assert followed queue */
        this.consumeQueue(this.followedWebHook); /** consume followed queue coming from user service */
        this._assertQueue(this.removeFollowOnBlockWebHook); /** assert remove follow on block queue */
        this.consumeQueue(this.removeFollowOnBlockWebHook); /** consume followed queue coming from user service */
        this._assertQueue(this.updateUserProfile); /** assert update user profile */
        this.consumeQueue(this.updateUserProfile); /** consume update user profile to update user */
    }

    /**
     * @function createQueue
     * @returns -
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
            /** consuming queue data */
            switch (queue) {
                case this.postQueueHook:
                    QueueService.consumePostQueueToCreatePost(data);
                    this.channel.ack(msg);
                    break;

                case this.likeQueueHook:
                    QueueService.consumeLikeQueueToLikePost(data);
                    this.channel.ack(msg);
                    break;

                case this.commentQueueHook:
                    QueueService.consumeCommentQueueToPostComment(data);
                    this.channel.ack(msg);
                    break;

                case this.userQueueHook:
                    QueueService.consumeUserQueueToCreateUserinPostDB(data);
                    this.channel.ack(msg);
                    break;

                case this.quoteQueueHook:
                    QueueService.consumeQuoteQueueToCreateQuoteInPost(data);
                    this.channel.ack(msg);
                    break;

                case this.followedWebHook:
                    QueueService.consumeFollowedQueueToAddDataInUser(data);
                    this.channel.ack(msg);
                    break;

                case this.removeFollowOnBlockWebHook:
                    QueueService.consumeQueueToRmoveFollowOnBlock(data);
                    this.channel.ack(msg);
                    break;

                case this.updateUserProfile:
                    QueueService.consumeQueueToUpdateUser(data);
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
     * @function createPostQueue
     * @param data 
     */
    public async createPostQueue(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.postQueueHook, data);
    }

    /**
     * @function createLikeQueue
     * @param data 
     */
    public async createLikeQueue(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.likeQueueHook, data);
    }

    /**
     * @function createCommentQueue
     * @param data 
     */
    public async createCommentQueue(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.commentQueueHook, data);
    }

    /**
     * @function createCommentQueue
     * @param data 
     */
    public async createQuoteQueue(data: any) {
        data = JSON.stringify(data);
        this.createQueue(this.quoteQueueHook, data);
    }


}

export default new RabbitMq();