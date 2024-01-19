import { useState } from "react";
import { Button, Col, Image, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { followUser, unfollowUser } from "../features/follows/followsSlice";

export default function UserCard({ user, currentUserId }) {
  const { id, username, name, bio, profileImageUrl } = user;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isFollowed, setIsFollowed] = useState(false);

  const handleFollow = async () => {
    if (!isFollowed) {
      await dispatch(followUser({ userId: currentUserId, followingId: id }));
      setIsFollowed(true);
    }
  };

  const handleUnfollow = async () => {
    if (isFollowed) {
      await dispatch(unfollowUser({ userId: currentUserId, followingId: id }));
      setIsFollowed(false);
    }
  };

  return (
    <div style={{ cursor: "pointer" }} onClick={() => navigate(`/profile/${username}`)}>
      <Row
        className="p-3"
        style={{
          borderTop: "1px solid #D3D3D3",
          borderBottom: "1px solid #D3D3D3"
        }}
      >
        <Col sm={1} className="px-0">
          {profileImageUrl ? (
            <Image
              className="object-fit-cover mx-auto"
              height={40}
              roundedCircle
              src={profileImageUrl}
              width={40}
            />
          ) : (
            <div
              className="position-absolute rounded-circle"
              style={{
                backgroundColor: "#ccc",
                border: "4px solid #F8F9FA",
                height: profileImageUrl ? "fit-content" : 150,
                marginLeft: 15,
                top: "130px",
                width: profileImageUrl ? "fit-content" : 150,
              }}
            >
            </div>
          )}
        </Col>

        <Col>
          <div className="fw-bold">{name}</div>
          <div className="text-secondary">@{username}</div>
          <div>{bio}</div>
        </Col>

        <Col sm={3} className="text-center">
          <Button
            className="rounded-pill"
            onClick={(e) => {
              e.stopPropagation();

              isFollowed ? handleUnfollow() : handleFollow();
            }}
            variant={isFollowed ? "outline-primary" : "primary"}
          >
            {isFollowed ? "Unfollow" : "Follow"}
          </Button>
        </Col>
      </Row>
    </div>
  );
}
