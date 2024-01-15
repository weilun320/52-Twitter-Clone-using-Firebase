import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

export const fetchCommentByPost = createAsyncThunk(
  "comments/fetchByPost",
  async ({ userId, postId }) => {
    try {
      const commentsRef = collection(db, `users/${userId}/posts/${postId}/comments`);

      const querySnapshot = await getDocs(commentsRef);
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { postId, comments: docs };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const commentPost = createAsyncThunk(
  "comments/commentPost",
  async ({ userId, postId, currentUserId, commentContent }) => {
    try {
      const commentsRef = collection(db, `users/${userId}/posts/${postId}/comments`);

      const newCommentsRef = doc(commentsRef);
      await setDoc(newCommentsRef, { comment: commentContent, user_id: currentUserId });
      const newComment = await getDoc(newCommentsRef);

      const comment = {
        id: newComment.id,
        ...newComment.data(),
      };

      return { postId, comment };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const deleteAllCommentOfAPost = createAsyncThunk(
  "comments/deleteAllCommentOfAPost",
  async ({ userId, postId }) => {
    try {
      const commentsRef = collection(db, `users/${userId}/posts/${postId}/comments`);

      const querySnapshot = await getDocs(commentsRef);
      querySnapshot.forEach(async (doc) => {
        // Delete each comment document for a specific post
        await deleteDoc(doc.ref);
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentByPost.fulfilled, (state, action) => {
        // Organize comments by post by separating into individual state for each post
        const { postId, comments } = action.payload;
        state[postId] = comments || [];
      })
      .addCase(commentPost.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        state[postId] = [comment, ...state[postId]];
      });
  },
});

export default commentsSlice.reducer;
