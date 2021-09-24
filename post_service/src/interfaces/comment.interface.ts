import mongoose from "mongoose";

interface Comment {
    _id: string;
    comment: string;
    user: mongoose.Schema.Types.ObjectId;
    post: mongoose.Schema.Types.ObjectId;
    page: number | string,
    limit: number | string
}

export default Comment;