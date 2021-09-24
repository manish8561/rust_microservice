import UserController from "./user/user.controller";
import FollowController from "./follow/follow.controller";
import BlockController from "./block/block.controller";

export default [
    new UserController(),
    new BlockController(),
    new FollowController()
]