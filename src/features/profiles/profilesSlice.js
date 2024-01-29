import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { db, storage } from "../../firebase";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export const fetchProfileByUsername = createAsyncThunk(
  "profiles/fetchByUsername",
  async (username, { rejectWithValue }) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userId = querySnapshot.docs[0].id;

        const userDocRef = doc(db, `users/${userId}`);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = {
            id: userId,
            ...userDoc.data(),
          };
          return data;
        }
        else {
          return rejectWithValue("User has not set a profile.");
        }
      }
      else {
        return rejectWithValue("User not found.");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const fetchProfileByUserId = createAsyncThunk(
  "profiles/fetchByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const profileDocRef = doc(db, `users/${userId}`);
      const profileDocSnap = await getDoc(profileDocRef);

      if (profileDocSnap.exists()) {
        const profileData = profileDocSnap.data();

        if ("username" in profileData) {
          const data = {
            id: userId,
            ...profileDocSnap.data(),
          };
          return data;
        }
        else {
          return rejectWithValue("Please set your profile.");
        }
      }
      else {
        return rejectWithValue("Please set your profile.");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const saveProfile = createAsyncThunk(
  "profiles/saveProfile",
  async ({ userId, data }, { rejectWithValue }) => {
    const { username, name, bio, profileImageFile, bannerImageFile } = data;

    try {
      const usersRef = collection(db, "users");

      // Check if the username is already in use across all user profiles
      const usernameQuery = query(usersRef, where("username", "==", username));
      const existingProfiles = await getDocs(usernameQuery);

      // Username is unique or belongs to the current user, proceed with updating or creating the user profile
      if (existingProfiles.size === 0 || (existingProfiles.size === 1 && existingProfiles.docs[0].id === userId)) {
        let profileImageUrl = "";
        if (profileImageFile !== null) {
          const imageRef = ref(storage, `profiles/${profileImageFile.name}`);
          const response = await uploadBytes(imageRef, profileImageFile);
          profileImageUrl = await getDownloadURL(response.ref);
        }

        let bannerImageUrl = "";
        if (bannerImageFile !== null) {
          const imageRef = ref(storage, `profiles/${bannerImageFile.name}`);
          const response = await uploadBytes(imageRef, bannerImageFile);
          bannerImageUrl = await getDownloadURL(response.ref);
        }

        const userProfileDocRef = doc(usersRef, userId);
        const userProfileDoc = await getDoc(userProfileDocRef);
        const userProfileData = userProfileDoc.data();
        await setDoc(userProfileDocRef, {
          username,
          name,
          bio,
          profileImageUrl: profileImageUrl ? profileImageUrl : userProfileData.profileImageUrl,
          bannerImageUrl: bannerImageUrl ? bannerImageUrl : userProfileData.bannerImageUrl,
        });
      }
      else {
        return rejectWithValue("Username has been taken, please try another username.");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

const profilesSlice = createSlice({
  name: "profiles",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileByUserId.pending, (state, action) => {
        const userId = action.meta.arg; // Get userId argument parsed from async thunk
        state[userId] = { status: "loading", error: null, profile: null };
      })
      .addCase(fetchProfileByUserId.fulfilled, (state, action) => {
        const userId = action.meta.arg;
        state[userId] = { status: "success", error: null, profile: action.payload };
      })
      .addCase(fetchProfileByUserId.rejected, (state, action) => {
        const userId = action.meta.arg;
        state[userId] = { status: "error", error: action.payload, profile: null };
      })
      .addCase(fetchProfileByUsername.pending, (state, action) => {
        const username = action.meta.arg; // Get username argument parsed from async thunk
        state[username] = { status: "loading", error: null, profile: null };
      })
      .addCase(fetchProfileByUsername.fulfilled, (state, action) => {
        const username = action.meta.arg;
        state[username] = { status: "success", error: null, profile: action.payload };
      })
      .addCase(fetchProfileByUsername.rejected, (state, action) => {
        const username = action.meta.arg;
        state[username] = { status: "error", error: action.payload, profile: null };
      });
  },
});

export default profilesSlice.reducer;