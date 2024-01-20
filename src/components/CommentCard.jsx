import { useContext, useEffect, useState } from "react";
import { Button, Col, Image, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthProvider";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfileByUserId } from "../features/profiles/profilesSlice";

export default function CommentCard({ comment }) {
  const { userId, comment: content, createdAt } = comment;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUser } = useContext(AuthContext);
  const currentUserId = currentUser ? currentUser.uid : null;

  const profile = useSelector((state) => state.profiles.profiles[userId]);
  const [commentCreatedAt, setCommentCreatedAt] = useState("");

  useEffect(() => {
    dispatch(fetchProfileByUserId(userId));

    const getCommentCreatedTime = () => {
      const createdTime = new Date(createdAt);

      const currentDate = new Date();
      const timeDifference = Math.abs(currentDate - createdTime) / (1000 * 60 * 60);

      if (createdTime.getFullYear() !== new Date().getFullYear()) {
        // Comment created year is not current year
        setCommentCreatedAt(`${createdTime.toLocaleString("default", { month: "short" })} ${createdTime.getDate()}, ${createdTime.getFullYear()}`);
      }
      else if (timeDifference >= 24) {
        // Comment created time is more than 1 day
        setCommentCreatedAt(`${createdTime.toLocaleString("default", { month: "short" })} ${createdTime.getDate()}`);
      }
      else if (timeDifference >= 1) {
        // Comment created time is more than 60 minutes
        setCommentCreatedAt(`${Math.floor(timeDifference)}h`);
      }
      else if (Math.floor(timeDifference * 60) === 0) {
        // Comment created time less than 1 minute
        setCommentCreatedAt("Just now");
      }
      else {
        // Comment created time more than 1 minute but less than 60 minutes
        setCommentCreatedAt(`${Math.floor(timeDifference * 60)}m`);
      }
    };

    getCommentCreatedTime();

    const intervalId = setInterval(getCommentCreatedTime, 60000);

    return () => clearInterval(intervalId);
  }, [createdAt, dispatch, userId]);

  const handleNavigateUser = () => {
    if (userId !== currentUserId) {
      navigate(`/profile/${profile.username}`);
    }
    else {
      navigate("/profile");
    }
  };

  return (
    <Row
      className="p-3"
      style={{
        borderTop: "1px solid #D3D3D3",
        borderBottom: "1px solid #D3D3D3"
      }}
    >
      <Col sm={1} className="px-0">
        {profile && profile.profileImageUrl ? (
          <Image
            className="object-fit-cover mx-auto darker"
            height={40}
            roundedCircle
            src={profile.profileImageUrl}
            width={40}
            onClick={(e) => {
              e.stopPropagation();
              handleNavigateUser();
            }}
          />
        ) : (
          <div
            className="rounded-circle mx-auto darker"
            style={{
              backgroundColor: "#ccc",
              height: 40,
              width: 40,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleNavigateUser();
            }}
          >
          </div>
        )}
      </Col>

      <Col>
        <strong
          className="text-link active"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigateUser();
          }}
        >
          {profile && profile.name}
        </strong>{" "}
        <span
          className="text-secondary text-link"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigateUser();
          }}
        >
          @{profile && profile.username}
        </span>
        <span className="text-secondary"> · {commentCreatedAt}</span>
        <p>{content}</p>
        <div className="d-flex justify-content-between mt-2">
          <Button variant="light">
            <i className="bi bi-chat"></i>
          </Button>
          <Button variant="light">
            <i className="bi bi-repeat"></i>
          </Button>
          <Button variant="light">
            <i className="bi bi-heart"></i>
          </Button>
          <Button variant="light">
            <i className="bi bi-graph-up"></i>
          </Button>
          <Button variant="light">
            <i className="bi bi-upload"></i>
          </Button>
        </div>
      </Col>
    </Row>
  );
}
