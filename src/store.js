import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "./features/posts/postsSlice";
import commentsReducer from "./features/comments/commentsSlice";
import profilesReducer from "./features/profiles/profilesSlice";

export default configureStore({
  reducer: {
    posts: postsReducer,
    comments: commentsReducer,
    profiles: profilesReducer,
  },
});
