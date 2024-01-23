import { useContext, useEffect, useState } from "react";
import { Button, Col, Image, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "./AuthProvider";
import { fetchLikeByPost, fetchRetweetsByPost, likePost, removeLikeFromPost, removeRetweetFromPost, retweetPost } from "../features/posts/postsSlice";
import UpdatePostModal from "./UpdatePostModal";
import DeletePostModal from "./DeletePostModal";
import { fetchCommentByPost } from "../features/comments/commentsSlice";
import NewCommentModal from "./NewCommentModal";
import { useNavigate } from "react-router-dom";
import { saveRetweetPost, unsaveRetweetPost } from "../features/retweets/retweetsSlice";

export default function ProfilePostCard({ post, user, currentUserDetails, clickable, retweetId }) {
  const { id: userId, username, name, profileImageUrl } = user;
  const { content, id: postId, imageUrl, createdAt } = post;

  const [isRetweeted, setIsRetweeted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [postCreatedAt, setPostCreatedAt] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const comments = useSelector((state) => state.comments[postId]);
  const retweets = useSelector((state) => state.posts.retweets[postId]);
  const likes = useSelector((state) => state.posts.likes[postId]);

  const { currentUser } = useContext(AuthContext);
  const currentUserId = currentUser ? currentUser.uid : null;

  const pic = "https://pbs.twimg.com/profile_images/1587405892437221376/h167Jlb2_400x400.jpg";

  const [showModal, setShowModal] = useState(null);

  const handleShowUpdate = () => setShowModal("update");
  const handleShowDelete = () => setShowModal("delete");
  const handleShowNewComment = () => setShowModal("comment");
  const handleClose = () => setShowModal(null);

  const handleLike = () => (isLiked ? removeFromLikes() : addToLikes());
  const handleRetweet = () => (isRetweeted ? removeFromRetweets() : addToRetweets());

  // Add userId to likes array
  const addToLikes = () => {
    dispatch(likePost({ userId: currentUserId, authorUserId: userId, postId }));
  };

  // Remove userId from likes array and update the backend
  const removeFromLikes = () => {
    dispatch(removeLikeFromPost({ userId: currentUserId, authorUserId: userId, postId }));
  };

  const addToRetweets = () => {
    dispatch(retweetPost({ userId: currentUserId, authorUserId: userId, postId }));
    dispatch(saveRetweetPost({ userId: currentUserId, authorUserId: userId, postId }));
  };

  const removeFromRetweets = () => {
    dispatch(unsaveRetweetPost({ userId: currentUserId, retweetId, postId }));
    dispatch(removeRetweetFromPost({ userId: currentUserId, authorUserId: userId, postId }));
  };

  useEffect(() => {
    dispatch(fetchRetweetsByPost({ userId, postId }));
    dispatch(fetchCommentByPost({ userId, postId }));
    dispatch(fetchLikeByPost({ userId, postId }));

    const getPostCreatedTime = () => {
      const createdTime = new Date(createdAt);

      if (clickable) {
        const currentDate = new Date();
        const timeDifference = Math.abs(currentDate - createdTime) / (1000 * 60 * 60);

        if (createdTime.getFullYear() !== new Date().getFullYear()) {
          // Post created year is not current year
          setPostCreatedAt(`${createdTime.toLocaleString("default", { month: "short" })} ${createdTime.getDate()}, ${createdTime.getFullYear()}`);
        }
        else if (timeDifference >= 24) {
          // Post created time is more than 1 day
          setPostCreatedAt(`${createdTime.toLocaleString("default", { month: "short" })} ${createdTime.getDate()}`);
        }
        else if (timeDifference >= 1) {
          // Post created time is more than 60 minutes
          setPostCreatedAt(`${Math.floor(timeDifference)}h`);
        }
        else if (Math.floor(timeDifference * 60) === 0) {
          // Post created time less than 1 minute
          setPostCreatedAt("Just now");
        }
        else {
          // Post created time more than 1 minute but less than 60 minutes
          setPostCreatedAt(`${Math.floor(timeDifference * 60)}m`);
        }
      }
      else {
        const createdAtTime = `${createdTime.toLocaleString("default", {
          hour12: true,
          hour: "numeric",
          minute: "2-digit"
        })}`;
        const createdAtDate = `${createdTime.toLocaleString("default", { month: "short" })} ${createdTime.getDate()}, ${createdTime.getFullYear()}`;

        setPostCreatedAt(`${createdAtTime} · ${createdAtDate}`);
      }
    };

    getPostCreatedTime();

    const intervalId = setInterval(getPostCreatedTime, 60000);

    return () => clearInterval(intervalId);
  }, [clickable, createdAt, dispatch, postId, userId]);

  useEffect(() => {
    if (retweets) {
      setIsRetweeted(retweets.includes(currentUserId));
    }

    if (likes) {
      setIsLiked(likes.includes(currentUserId));
    }
  }, [currentUserId, likes, retweets]);

  const handleNavigateUser = (userId) => {
    if (userId === currentUserId) {
      navigate(`/profile`);
    }
    else if (currentUserDetails && userId === currentUserDetails.id) {
      navigate(`/profile/${currentUserDetails.username}`);
    }
    else {
      navigate(`/profile/${username}`);
    }
  };

  const handleNavigatePost = () => {
    navigate(`/${username}/post/${postId}`);
  };

  return (
    <div
      style={{ cursor: clickable && "pointer" }}
      onClick={clickable && showModal === null ? handleNavigatePost : null}
    >
      <Row
        className="p-3"
        style={{
          borderTop: "1px solid #D3D3D3",
          borderBottom: "1px solid #D3D3D3"
        }}
      >
        {retweetId &&
          <Row className="text-secondary">
            <Col sm={1}>
              <i className="bi bi-repeat"></i>
            </Col>
            <Col>
              <span
                className="text-link active"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateUser(currentUserDetails.id);
                }}
              >
                {currentUserDetails.name} retweeted
              </span>
            </Col>
          </Row>
        }
        {clickable ? (
          <Col sm={1} className="px-0 text-center">
            {profileImageUrl ? (
              <Image
                className="object-fit-cover darker"
                height={40}
                roundedCircle
                src={profileImageUrl}
                width={40}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateUser(userId);
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
                  handleNavigateUser(userId);
                }}
              >
              </div>
            )}
          </Col>
        ) : (
          <Col sm={12} className="d-flex mb-2">
            {profileImageUrl ? (
              <Image
                className="object-fit-cover darker"
                height={40}
                roundedCircle
                src={profileImageUrl}
                width={40}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateUser(userId);
                }}
              />
            ) : (
              <div
                className="rounded-circle darker"
                style={{
                  backgroundColor: "#ccc",
                  height: 40,
                  width: 40,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateUser(userId);
                }}
              >
              </div>
            )}
            <div className="ms-3">
              <div
                className="fw-bold text-link active"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateUser(userId);
                }}
              >
                {name}
              </div>
              <div
                className="text-secondary text-link"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateUser(userId);
                }}
              >
                @{username}
              </div>
            </div>
          </Col>
        )}

        <Col>
          {clickable && (
            <>
              <strong
                className="text-link active"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateUser(userId);
                }}
              >
                {name}
              </strong>{" "}
              <span
                className="text-secondary text-link"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateUser(userId);
                }}
              >
                @{username}
              </span>
              <span className="text-secondary"> · {postCreatedAt}</span>
            </>
          )}
          <p>{content}</p>
          <Image src={imageUrl} style={{ width: 150 }} />
          {!clickable &&
            <div className="mt-2 text-secondary">{postCreatedAt}</div>
          }
          <div className="d-flex justify-content-between mt-2">
            <Button
              variant="light"
              onClick={(e) => {
                e.stopPropagation();
                handleShowNewComment();
              }}
            >
              <i className="bi bi-chat me-1"></i>
              {comments && comments.length}
            </Button>
            <Button
              variant="light"
              onClick={(e) => {
                e.stopPropagation();
                handleRetweet();
              }}
            >
              {isRetweeted ? (
                <i className="bi bi-repeat text-success me-1"></i>
              ) : (
                <i className="bi bi-repeat me-1"></i>
              )}
              {retweets && retweets.length}
            </Button>
            <Button
              variant="light"
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            >
              {isLiked ? (
                <i className="bi bi-heart-fill text-danger me-1"></i>
              ) : (
                <i className="bi bi-heart me-1"></i>
              )}
              {likes && likes.length}
            </Button>
            <Button variant="light">
              <i className="bi bi-graph-up"></i>
            </Button>
            <Button variant="light">
              <i className="bi bi-upload"></i>
            </Button>
            {userId === currentUserId && (
              <>
                <Button
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowUpdate();
                  }}
                >
                  <i className="bi bi-pencil-square"></i>
                </Button>
                <Button
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowDelete();
                  }}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </>
            )}
            <UpdatePostModal
              show={showModal === "update"}
              handleClose={handleClose}
              postId={postId}
              originalPostContent={content}
            />
            <DeletePostModal
              show={showModal === "delete"}
              handleClose={handleClose}
              postId={postId}
            />
            <NewCommentModal
              show={showModal === "comment"}
              handleClose={handleClose}
              userId={userId}
              postId={postId}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}

