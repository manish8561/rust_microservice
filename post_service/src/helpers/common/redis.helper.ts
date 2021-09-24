import * as redis from 'redis';

class Redis {
    private client!: redis.RedisClient;

    constructor() { this._connectClient(); }

    /**
     * @function _connectClient
     * @returns client
     */
    private async _connectClient() {
        const host: any = process.env.REDIS_HOSTNAME!;
        const port: string = process.env.REDIS_PORT!;

        this.client = redis.createClient(port, host);
        this.client.on('connect', () => console.log('Redis::Connected Successfully..!!'));
    }

    /**
     * @function setString
     * @param key 
     * @param value 
     * @param expires 
     * @param database 
     * @returns 
     */
    public async setString(key: string, value: string, expires: number = 0, database: string = ''): Promise<any> {
        try {
            if (database !== '') { this.client.select(database); }
            this.client.set(key, value, (error: any, success: any) => {
                if (error) return error;
                /** Add expire time if provided */
                if (expires !== 0) this.client.expire(key, (expires * 60));
                /** return inserted success */
                return success;
            });
        } catch (error) {
            return error;
        }

    }
    
    /**
     * @function getString
     * @param key 
     * @param database 
     * @returns 
     */
    public async getString(key: string, database: string = '0'): Promise<any> {
        try  {
            if (database !== '') { this.client.select(database); }
            this.client.get(key, (error, success) => {
                if (error) return error;
                return success;
            });
        } catch (error) {
            return error;
        }
    }

    /**
     * @function deleteKey
     * @param key 
     * @returns 
     */
    public async deleteKey(key: string): Promise<any> {
        try {
            this.client.del(key, (error, success) => {
                if (success === 1) return success;
                else return error;
            });
        } catch (error) {
            return error;
        }
    }
}

export default new Redis();