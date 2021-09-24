import PostController from "./post/post.controller";
import QuoteController from "./quote/quote.controller";
import CommentController from "./comment/comment.controller";
import LikeController from "./like/like.controller";
import HideController from './hide/hide.controller';
import ReportController from "./report/report.controller";

export default [
    new PostController(),
    new QuoteController(),
    new CommentController(),
    new LikeController(),
    new HideController(),
    new ReportController(),
]