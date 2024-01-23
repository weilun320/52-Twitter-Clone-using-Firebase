import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

// Async thunk for fetching a user's posts
export const fetchPostsByUser = createAsyncThunk(
  "posts/fetchByUser",
  async (userId) => {
    try {
      const postsRef = collection(db, `users/${userId}/posts`);

      const q = query(postsRef, orderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toMillis(),
      }));

      return docs;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const fetchSinglePost = createAsyncThunk(
  "posts/fetchSinglePost",
  async ({ userId, postId }, { rejectWithValue }) => {
    try {
      const postRef = doc(db, `users/${userId}/posts/${postId}`);

      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        return {
          id: postSnap.id,
          ...postSnap.data(),
          createdAt: postSnap.data()?.createdAt?.toMillis(),
        };
      }
      else {
        return rejectWithValue("Post does not exist");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const savePost = createAsyncThunk(
  "posts/savePost",
  async ({ userId, postContent, file }) => {
    try {
      let imageUrl = "";
      console.log(file);

      if (file !== null) {
        const imageRef = ref(storage, `posts/${file.name}`);
        const response = await uploadBytes(imageRef, file);
        imageUrl = await getDownloadURL(response.ref);
      }

      const postsRef = collection(db, `users/${userId}/posts`);
      console.log(`users/${userId}/posts`);
      // Since no ID is given, Firestore auto generate a unique ID for this new document
      const newPostRef = doc(postsRef);
      console.log(postContent);
      await setDoc(newPostRef, {
        content: postContent,
        likes: [],
        imageUrl,
        createdAt: serverTimestamp(),
        retweets: [],
      });
      const newPost = await getDoc(newPostRef);

      const post = {
        id: newPost.id,
        ...newPost.data(),
        createdAt: newPost.data()?.createdAt?.toMillis(),
      };

      return post;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ userId, postId, newPostContent, newFile }) => {
    try {
      // Upload the new file to the storage if it exists and get its URL
      let newImageUrl;

      if (newFile) {
        const imageRef = ref(storage, `posts/${newFile.name}`);
        const response = await uploadBytes(imageRef, newFile);
        newImageUrl = await getDownloadURL(response.ref);
      }
      // Reference to the existing post
      const postRef = doc(db, `users/${userId}/posts/${postId}`);
      // Get the current post data
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();
        // Update the post content and the image URL
        const updatedData = {
          ...postData,
          content: newPostContent || postData.content,
          imageUrl: newImageUrl || postData.imageUrl,
        };
        // Update the existing document in Firestore
        await updateDoc(postRef, updatedData);
        // Return the post with updated data
        const updatedPost = { id: postId, ...updatedData };
        return updatedPost;
      }
      else {
        throw new Error("Post does not exist");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async ({ userId, postId }) => {
    try {
      // Reference to the post
      const postRef = doc(db, `users/${userId}/posts/${postId}`);
      // Delete the post
      await deleteDoc(postRef);
      // Return the ID of the deleted post
      return postId;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const likePost = createAsyncThunk(
  "posts/likePost",
  async ({ userId, authorUserId, postId }) => {
    try {
      const postRef = doc(db, `users/${authorUserId}/posts/${postId}`);

      const docSnap = await getDoc(postRef);

      if (docSnap.exists()) {
        const postData = docSnap.data();
        const likes = [...postData.likes, userId];

        await setDoc(postRef, { ...postData, likes });
      }

      return { userId: authorUserId, postId };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const removeLikeFromPost = createAsyncThunk(
  "posts/removeLikeFromPost",
  async ({ userId, authorUserId, postId }) => {
    try {
      const postRef = doc(db, `users/${authorUserId}/posts/${postId}`);

      const docSnap = await getDoc(postRef);

      if (docSnap.exists()) {
        const postData = docSnap.data();
        const likes = postData.likes.filter((id) => id !== userId);

        await setDoc(postRef, { ...postData, likes });
      }

      return { userId: authorUserId, postId };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const fetchRetweetsByPost = createAsyncThunk(
  "posts/fetchRetweetsByPost",
  async ({ userId, postId }) => {
    try {
      const postRef = doc(db, `users/${userId}/posts/${postId}`);
      const postDocSnap = await getDoc(postRef);

      if (postDocSnap.exists()) {
        const data = {
          id: postId,
          ...postDocSnap.data(),
          createdAt: postDocSnap.data()?.createdAt?.toMillis(),
        };

        return { postId: data.id, retweets: data.retweets };
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const retweetPost = createAsyncThunk(
  "posts/retweetPost",
  async ({ userId, authorUserId, postId }) => {
    try {
      const postRef = doc(db, `users/${authorUserId}/posts/${postId}`);

      const docSnap = await getDoc(postRef);

      if (docSnap.exists()) {
        const postData = docSnap.data();
        const retweets = [...postData.retweets, userId];

        await setDoc(postRef, { ...postData, retweets });
      }

      return { postId, userId };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const removeRetweetFromPost = createAsyncThunk(
  "posts/removeRetweetFromPost",
  async ({ userId, authorUserId, postId }) => {
    try {
      const postRef = doc(db, `users/${authorUserId}/posts/${postId}`);

      const docSnap = await getDoc(postRef);

      if (docSnap.exists()) {
        const postData = docSnap.data();
        const retweets = postData.retweets.filter((id) => id !== userId);

        await setDoc(postRef, { ...postData, retweets });
      }

      return { postId, userId };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

// Slice
const postsSlice = createSlice({
  name: "posts",
  initialState: { posts: [], loading: true, error: null, retweets: {} },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostsByUser.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
      })
      .addCase(fetchSinglePost.fulfilled, (state, action) => {
        state.posts = [action.payload];
      })
      .addCase(fetchSinglePost.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(savePost.fulfilled, (state, action) => {
        state.posts = [action.payload, ...state.posts];
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        // Find and update the post in the state
        const postIndex = state.posts.findIndex((post) =>
          post.id === updatedPost.id
        );

        if (postIndex !== -1) {
          state.posts[postIndex] = updatedPost;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const deletedPostId = action.payload;
        // Filter out the deleted post from state
        state.posts = state.posts.filter((post) => post.id !== deletedPostId);
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const { userId, postId } = action.payload;

        const postIndex = state.posts.findIndex((post) => post.id === postId);

        if (postIndex !== -1) {
          state.posts[postIndex].likes.push(userId);
        }
      })
      .addCase(removeLikeFromPost.fulfilled, (state, action) => {
        const { userId, postId } = action.payload;

        const postIndex = state.posts.findIndex((post) => post.id === postId);

        if (postIndex !== -1) {
          state.posts[postIndex].likes = state.posts[postIndex].likes.filter((id) =>
            id !== userId
          );
        }
      })
      .addCase(fetchRetweetsByPost.fulfilled, (state, action) => {
        if (action.payload) {
          const { postId, retweets } = action.payload;
          state.retweets[postId] = retweets || [];
        }
      })
      .addCase(retweetPost.fulfilled, (state, action) => {
        const { postId, userId } = action.payload;
        state.retweets[postId] = state.retweets[postId] || [];
        state.retweets[postId].push(userId);
      })
      .addCase(removeRetweetFromPost.fulfilled, (state, action) => {
        const { postId, userId } = action.payload;
        state.retweets[postId] = state.retweets[postId] || [];
        state.retweets[postId] = state.retweets[postId].filter((id) => id !== userId);
      });
  },
});

export default postsSlice.reducer;
