import mongoose from 'mongoose';
import * as AWS from "aws-sdk";

class S3Service {

    constructor() {
        this.initS3();
    }

    /**
     * @function initS3
     * @returns S3
     */
    private async initS3(): Promise<any> {
        AWS.config.update({
            accessKeyId: process.env.S3_ACCESS_ID,
            secretAccessKey: process.env.S3_SECRET_ID,
            region: process.env.S3_REGION,
        });
    }

    /**
     * @function uploadFileToS3Bucket
     * @param file 
     * @returns error | data
     */
    public async uploadFileToS3Bucket(file: any, _id: mongoose.Schema.Types.ObjectId): Promise<any> {
        return new Promise( async (resolve, reject) => {
            const bucketName: any = process.env.S3_BUCKET_NAME;
            const ext = file.originalname.split(".")[1];
            let fileName = file.originalname.split(".")[0].split(" ").join("-");
            fileName = `${fileName}-${new Date().getTime()}-${_id}.${ext}`; 

            const params = { 
                Bucket: bucketName, 
                Key: fileName,
                Body: file.buffer,
                ACL: "public-read",
                ContentType: file['mimetype'],            
            };

            const s3 = new AWS.S3();
            s3.upload(params, (error: any, data: any) => {
                if (error) reject(error); /** return error if any otherwise, return data */
                resolve(data);
            });
        });
    }

    // public async deleteFileFromAWS(s3FileName:string) {
    //     try {
    //         return new Promise((resolve, reject) => {
    //             let deleteParams={
    //                 Bucket: process.env.S3_BUCKET_NAME,
    //                 Key: s3FileName.substr(1),
    //             };
    //             const s3 = new AWS.S3();
    //             s3.deleteObject(deleteParams, (err: any, data: any) => {
    //                 if (err) { console.log("s3=====deleteFileFromAWS======err",err);
    //                   return reject(err);
    //                 };console.log("s3=====deleteFileFromAWS======data",data);
    //                 resolve(data);
    //             });
    //         });            
    //     } catch (err) { 
    //       throw new Error(err);
    //     }
    // }
}

export default new S3Service();

