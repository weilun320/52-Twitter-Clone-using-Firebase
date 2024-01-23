import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "./features/posts/postsSlice";
import commentsReducer from "./features/comments/commentsSlice";
import profilesReducer from "./features/profiles/profilesSlice";
import followsReducer from "./features/follows/followsSlice";
import retweetsReducer from "./features/retweets/retweetsSlice";

export default configureStore({
  reducer: {
    posts: postsReducer,
    comments: commentsReducer,
    profiles: profilesReducer,
    follows: followsReducer,
    retweets: retweetsReducer,
  },
});
