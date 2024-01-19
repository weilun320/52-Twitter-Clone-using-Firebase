import { useContext, useEffect, useState } from "react";
import { Col } from "react-bootstrap";
import { AuthContext } from "../components/AuthProvider";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsersWithUsername, fetchFollowing } from "../features/follows/followsSlice";
import UserCard from "../components/UserCard";

export default function ConnectPeoplePage() {
  const { currentUser } = useContext(AuthContext);
  const currentUserId = currentUser ? currentUser.uid : null;

  const dispatch = useDispatch();
  const allUsersWithUsername = useSelector((state) => state.follows.allUsers);
  const followingUsers = useSelector((state) => state.follows.following);
  const [nonFollowingUsers, setNonFollowingUsers] = useState([]);

  useEffect(() => {
    dispatch(fetchAllUsersWithUsername(currentUserId));
    dispatch(fetchFollowing(currentUserId));
  }, [currentUserId, dispatch]);

  useEffect(() => {
    if (allUsersWithUsername && followingUsers) {
      setNonFollowingUsers(allUsersWithUsername
        .filter((user) => !followingUsers.some((followingUser) => followingUser === user.id)));
    }
  }, [allUsersWithUsername, followingUsers]);

  return (
    <Col sm={6} className="bg-light" style={{ border: "1px solid lightgrey" }}>
      {nonFollowingUsers && nonFollowingUsers.length > 0 && nonFollowingUsers.map((user) => (
        <UserCard key={user.id} user={user} currentUserId={currentUserId} />
      ))}
    </Col>
  );
}
