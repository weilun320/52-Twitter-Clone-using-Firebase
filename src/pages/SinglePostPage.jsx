import { useEffect } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProfileByUsername } from "../features/profiles/profilesSlice";
import { fetchSinglePost } from "../features/posts/postsSlice";
import ProfilePostCard from "../components/ProfilePostCard";
import { fetchCommentByPost } from "../features/comments/commentsSlice";
import CommentCard from "../components/CommentCard";

export default function SinglePostPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { username, postId } = useParams();
  const { profile } = useSelector((state) => state.profiles[username]) || {};
  const post = useSelector((state) => state.posts.posts);
  const error = useSelector((state) => state.posts.error);
  const comments = useSelector((state) => state.comments[postId]);

  useEffect(() => {
    dispatch(fetchProfileByUsername(username));
  }, [dispatch, username]);

  useEffect(() => {
    if (profile && profile.id) {
      dispatch(fetchSinglePost({ userId: profile.id, postId }));
      dispatch(fetchCommentByPost({ userId: profile.id, postId }));
    }
  }, [dispatch, postId, profile]);

  return (
    <Col sm={6} className="bg-light" style={{ border: "1px solid lightgrey" }}>
      <Row className="align-items-center">
        <Col sm="auto">
          <Button
            className="rounded-circle"
            variant="light"
            style={{ height: 42, width: 42 }}
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left"></i>
          </Button>
        </Col>
        <Col className="fs-4 fw-semibold">Post</Col>
      </Row>
      {error &&
        <div className="my-3">{error}</div>
      }
      {post && post.length > 0 && profile && comments &&
        <ProfilePostCard
          post={post[0]}
          user={profile}
          clickable={false}
        />
      }
      {comments && comments.length > 0 && comments.map((comment) =>
        <CommentCard key={comment.id} comment={comment} />
      )}
    </Col>
  );
}
