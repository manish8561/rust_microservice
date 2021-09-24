import mongoose from "mongoose";

interface Post {
    _id: string;
    content: string;
    image: string;
    user: mongoose.Types.ObjectId | any; 
    transaction: mongoose.Types.ObjectId;
    file: File;
    page: string | number;
    limit: string | number;
    embedType: string;
    embedLink: string;
}

export default Post;