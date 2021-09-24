import mongoose from "mongoose";

interface Like {
    _id: string;
    isPostLiked: boolean;
    user: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
}

export default Like;