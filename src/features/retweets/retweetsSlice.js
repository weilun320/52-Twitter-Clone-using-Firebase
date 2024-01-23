import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "../../firebase";

export const saveRetweetPost = createAsyncThunk(
  "retweets/saveRetweetPost",
  async ({ userId, authorUserId, postId }) => {
    try {
      const retweetsRef = collection(db, `retweets/${userId}/posts`);

      const newRetweetRef = doc(retweetsRef);
      await setDoc(newRetweetRef, { authorUserId, postId, createdAt: serverTimestamp() });
      const newRetweet = await getDoc(newRetweetRef);

      const retweet = {
        id: newRetweet.id,
        ...newRetweet.data(),
        createdAt: newRetweet.data()?.createdAt?.toMillis(),
      };

      return { userId, retweet };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const unsaveRetweetPost = createAsyncThunk(
  "retweets/unsaveRetweetPost",
  async ({ userId, retweetId, postId }) => {
    try {
      if (retweetId) {
        const retweetRef = doc(db, `retweets/${userId}/posts/${retweetId}`);

        await deleteDoc(retweetRef);

        return { userId, deletedRetweetId: retweetId };
      }
      else {
        const retweetRef = collection(db, `retweets/${userId}/posts`);
        const q = query(retweetRef, where("postId", "==", postId));

        const retweetSnap = await getDocs(q);

        if (!retweetSnap.empty) {
          const retweetDocRef = retweetSnap.docs[0].ref;
          const retweetDoc = await getDoc(retweetDocRef);

          if (retweetDoc.exists()) {
            await deleteDoc(retweetDocRef);

            return { userId, deletedRetweetId: retweetDoc.id };
          }
        }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const fetchRetweetsByUser = createAsyncThunk(
  "retweets/fetchByUser",
  async (userId) => {
    try {
      const retweetsRef = collection(db, `retweets/${userId}/posts`);

      const q = query(retweetsRef, orderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toMillis(),
      }));

      return { userId, retweets: docs };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const fetchRetweetByPost = createAsyncThunk(
  "retweets/fetchByPost",
  async ({ authorUserId, postId }) => {
    try {
      const postRef = doc(db, `users/${authorUserId}/posts/${postId}`);

      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        return {
          id: postSnap.id,
          ...postSnap.data(),
          createdAt: postSnap.data()?.createdAt?.toMillis(),
        };
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const removeAllRetweetsByPost = createAsyncThunk(
  "retweets/removeAllRetweetsByPost",
  async ({ userId, postId }) => {
    try {
      const postRef = doc(db, `users/${userId}/posts/${postId}`);
      const postDocSnap = await getDoc(postRef);

      if (postDocSnap.exists()) {
        const retweets = postDocSnap.data().retweets;

        retweets.forEach(async (user) => {
          const retweetRef = collection(db, `retweets/${user}/posts`);
          const q = query(retweetRef, where("postId", "==", postId));

          const retweetDocSnap = await getDocs(q);

          if (!retweetDocSnap.empty) {
            const retweetDoc = retweetDocSnap.docs[0];
            const retweetDocRef = retweetDoc.ref;

            await deleteDoc(retweetDocRef);
          }
        });

        return { userIds: retweets, postId };
      }
      else {
        return { userIds: [], postId };
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

const retweetsSlice = createSlice({
  name: "retweets",
  initialState: { retweets: {}, posts: {} },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRetweetsByUser.fulfilled, (state, action) => {
        const { userId, retweets } = action.payload;
        state.retweets[userId] = retweets;
      })
      .addCase(saveRetweetPost.fulfilled, (state, action) => {
        const { userId, retweet } = action.payload;
        state.retweets[userId] = state.retweets[userId] || [];
        state.retweets[userId] = [retweet, ...state.retweets[userId]];
      })
      .addCase(unsaveRetweetPost.fulfilled, (state, action) => {
        const { userId, deletedRetweetId } = action.payload;
        state.retweets[userId] = state.retweets[userId] || [];
        state.retweets[userId] = state.retweets[userId].filter((retweet) => retweet.id !== deletedRetweetId);
      })
      .addCase(fetchRetweetByPost.fulfilled, (state, action) => {
        const retweetData = action.payload;

        if (retweetData && retweetData.id) {
          state.posts[retweetData.id] = retweetData;
        }
      })
      .addCase(removeAllRetweetsByPost.fulfilled, (state, action) => {
        const { userIds, postId } = action.payload;

        userIds.forEach((userId) => {
          state.retweets[userId] = state.retweets[userId] || [];
          state.retweets[userId] = state.retweets[userId].filter((retweet) => retweet.postId !== postId);
        });
      });
  },
});

export default retweetsSlice.reducer;