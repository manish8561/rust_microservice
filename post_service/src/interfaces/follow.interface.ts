import mongoose from 'mongoose';

interface Follow {
    following: mongoose.Types.ObjectId;
    follower: mongoose.Types.ObjectId;
    isFollowedBack: boolean;
    _id: mongoose.Schema.Types.ObjectId;
    type: string;
}

export default Follow;