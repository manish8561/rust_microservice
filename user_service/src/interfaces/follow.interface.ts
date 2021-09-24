import mongoose from 'mongoose';

interface Follow {
    following: mongoose.Types.ObjectId;
    follower: mongoose.Types.ObjectId;
    isFollowing: Follow;
    isFollower: Follow;
    type: string;
    _id: mongoose.Types.ObjectId;
    page: string | number;
    limit: string | number;
    follow: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
}

export default Follow;