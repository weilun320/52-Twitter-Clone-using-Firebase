import { useContext, useEffect, useState } from "react";
import { Button, Col, Image, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "./AuthProvider";
import { likePost, removeLikeFromPost } from "../features/posts/postsSlice";
import UpdatePostModal from "./UpdatePostModal";
import DeletePostModal from "./DeletePostModal";
import { fetchCommentByPost } from "../features/comments/commentsSlice";
import NewCommentModal from "./NewCommentModal";
import { useNavigate } from "react-router-dom";

export default function ProfilePostCard({ post, user, userId }) {
  const { username, name, profileImageUrl } = user;
  const { content, id: postId, imageUrl } = post;

  const [likes, setLikes] = useState(post.likes || []);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const comments = useSelector((state) => state.comments[postId]);

  const { currentUser } = useContext(AuthContext);
  const currentUserId = currentUser ? currentUser.uid : null;

  // User has liked the post if their ID is in the likes  array
  const isLiked = likes.includes(currentUserId);

  const pic = "https://pbs.twimg.com/profile_images/1587405892437221376/h167Jlb2_400x400.jpg";

  const [showModal, setShowModal] = useState(null);

  const handleShowUpdate = () => setShowModal("update");
  const handleShowDelete = () => setShowModal("delete");
  const handleShowNewComment = () => setShowModal("comment");
  const handleClose = () => setShowModal(null);

  const handleLike = () => (isLiked ? removeFromLikes() : addToLikes());

  // Add userId to likes array
  const addToLikes = () => {
    setLikes([...likes, currentUserId]);
    dispatch(likePost({ currentUserId, postId }));
  };

  // Remove userId from likes array and update the backend
  const removeFromLikes = () => {
    setLikes(likes.filter((id) => id !== currentUserId));
    dispatch(removeLikeFromPost({ currentUserId, postId }));
  };

  useEffect(() => {
    dispatch(fetchCommentByPost({ currentUserId, postId }));
  }, [dispatch, postId, currentUserId]);

  const handleNavigateUser = () => {
    if (userId !== currentUserId) {
      navigate(`/profile/${username}`);
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
        {profileImageUrl ? (
          <Image
            className="object-fit-cover mx-auto darker"
            height={40}
            roundedCircle
            src={profileImageUrl}
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
          {name}
        </strong>{" "}
        <span
          className="text-secondary text-link"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigateUser();
          }}
        >
          @{username}
        </span>
        <span className="text-secondary"> · Apr 16</span>
        <p>{content}</p>
        <Image src={imageUrl} style={{ width: 150 }} />
        <div className="d-flex justify-content-between mt-3">
          <Button variant="light" onClick={handleShowNewComment}>
            <i className="bi bi-chat me-1"></i>
            {comments && comments.length}
          </Button>
          <Button variant="light">
            <i className="bi bi-repeat"></i>
          </Button>
          <Button variant="light" onClick={handleLike}>
            {isLiked ? (
              <i className="bi bi-heart-fill text-danger me-1"></i>
            ) : (
              <i className="bi bi-heart me-1"></i>
            )}
            {likes.length}
          </Button>
          <Button variant="light">
            <i className="bi bi-graph-up"></i>
          </Button>
          <Button variant="light">
            <i className="bi bi-upload"></i>
          </Button>
          {userId === currentUserId && (
            <>
              <Button variant="light" onClick={handleShowUpdate}>
                <i className="bi bi-pencil-square"></i>
              </Button>
              <Button variant="light" onClick={handleShowDelete}>
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
            userId={currentUserId}
            postId={postId}
          />
        </div>
      </Col>
    </Row>
  )
}

