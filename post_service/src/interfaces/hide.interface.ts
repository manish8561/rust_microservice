import mongoose from "mongoose";

interface Hide {
    _id: string;
    isPostHidden: boolean;
    user: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
    hideFrom: string;
}

export default Hide;