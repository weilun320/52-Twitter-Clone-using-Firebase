import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

export const followUser = createAsyncThunk(
  "follows/followUser",
  async ({ userId, followingId }) => {
    try {
      const followsDocRef = doc(db, `follows/${userId}`);
      await setDoc(followsDocRef, { following: [followingId] });

      const followersDocRef = doc(db, `follows/${followingId}`);
      await setDoc(followersDocRef, { followers: [userId] });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const unfollowUser = createAsyncThunk(
  "follows/unfollowUser",
  async ({ userId, followingId }) => {
    try {
      const followsRef = doc(db, `follows/${userId}`);
      const followsDocSnap = await getDoc(followsRef);

      if (followsDocSnap.exists()) {
        const followsData = followsDocSnap.data();
        const following = followsData.following.filter((id) => id !== followingId);
        await setDoc(followsRef, { ...followsData, following });

        const followersDocRef = doc(db, `follows/${followingId}`);
        const followersDocSnap = await getDoc(followersDocRef);
        const followersData = followersDocSnap.data();
        const followers = followersData.followers.filter((id) => id !== userId);
        await setDoc(followersDocRef, { ...followersData, followers });
      }
      else {
        throw new Error("User not found.");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const fetchFollowers = createAsyncThunk(
  "follows/fetchFollowers",
  async (userId) => {
    try {
      const followsRef = doc(db, `follows/${userId}`);
      const followsDocSnap = await getDoc(followsRef);

      if (followsDocSnap.exists()) {
        return followsDocSnap.data().followers;
      }
      else {
        return [];
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  "follows/fetchFollowing",
  async (userId) => {
    try {
      const followsRef = doc(db, `follows/${userId}`);
      const followsDocSnap = await getDoc(followsRef);

      if (followsDocSnap.exists()) {
        return followsDocSnap.data().following;
      }
      else {
        return [];
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const fetchAllUsersWithUsername = createAsyncThunk(
  "follows/fetchAllUsersWithUsername",
  async (userId) => {
    try {
      const usersRef = collection(db, `users`);

      const querySnapshot = await getDocs(usersRef);
      const docs = querySnapshot.docs
        .filter((doc) => doc.data().username && doc.id !== userId)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      return docs;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

const followsSlice = createSlice({
  name: "follows",
  initialState: { followers: [], following: [], allUsers: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followers = action.payload;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.following = action.payload;
      })
      .addCase(fetchAllUsersWithUsername.fulfilled, (state, action) => {
        state.allUsers = action.payload;
      });
  },
});

export default followsSlice.reducer;