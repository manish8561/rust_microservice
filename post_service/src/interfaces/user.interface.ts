import mongoose from 'mongoose';

interface User {
    _id: mongoose.Types.ObjectId;
    username: string;
    image: string;
    user: mongoose.Types.ObjectId;
    followings: Array<mongoose.Types.ObjectId>;
    hiddenPosts: Array<mongoose.Types.ObjectId>;
    blockUsers: Array<mongoose.Types.ObjectId>;
}

export default User;