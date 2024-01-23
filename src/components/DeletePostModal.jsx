import { Button, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { deletePost } from "../features/posts/postsSlice";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import { deleteAllCommentOfAPost } from "../features/comments/commentsSlice";
import { removeAllRetweetsByPost } from "../features/retweets/retweetsSlice";

export default function DeletePostModal({ show, handleClose, postId }) {
  const dispatch = useDispatch();
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser ? currentUser.uid : null;

  const handleDelete = async () => {
    // Delete the comments under the post
    await dispatch(deleteAllCommentOfAPost({ userId, postId }));
    await dispatch(removeAllRetweetsByPost({ userId, postId }));
    await dispatch(deletePost({ userId, postId }));
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this post?
        </Modal.Body>
        <Modal.Footer>
          <Button className="rounded-pill" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button className="rounded-pill" variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
