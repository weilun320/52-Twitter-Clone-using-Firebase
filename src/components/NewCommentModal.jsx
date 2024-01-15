import { useContext, useState } from "react";
import { AuthContext } from "./AuthProvider";
import { Button, Form, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { commentPost } from "../features/comments/commentsSlice";

export default function NewCommentModal({ show, handleClose, userId, postId }) {
  const { currentUser } = useContext(AuthContext);
  const currentUserId = currentUser.uid;

  const [commentContent, setCommentContent] = useState("");
  const dispatch = useDispatch();

  const handleReplyComment = () => {
    if (!commentContent) {
      return;
    }

    dispatch(commentPost({ userId, postId, currentUserId, commentContent }));
    handleClose();
    setCommentContent("");
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="postContent">
              <Form.Control
                placeholder="Post your reply"
                as="textarea"
                rows={3}
                onChange={(e) => setCommentContent(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="rounded-pill" variant="primary" onClick={handleReplyComment}>
            Reply
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
