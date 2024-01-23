import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRetweetByPost } from "../features/retweets/retweetsSlice";
import { fetchProfileByUserId } from "../features/profiles/profilesSlice";
import ProfilePostCard from "./ProfilePostCard";

export default function ProfileRetweetCard({ retweet, user, userId }) {
  const { id: retweetId, postId, authorUserId } = retweet;
  const dispatch = useDispatch();

  const post = useSelector((state) => state.retweets.posts[postId]);
  const { profile } = useSelector((state) => state.profiles[authorUserId]) || {};

  useEffect(() => {
    dispatch(fetchRetweetByPost({ authorUserId, postId }));

    if (authorUserId !== userId) {
      dispatch(fetchProfileByUserId(authorUserId));
    }
  }, [authorUserId, dispatch, postId, userId]);

  return (
    post && Object.keys(post).length > 0 && (
      <ProfilePostCard
        post={post}
        user={userId !== authorUserId && profile ? profile : user}
        currentUserDetails={user}
        clickable={true}
        retweetId={retweetId}
      />
    )
  );
}
