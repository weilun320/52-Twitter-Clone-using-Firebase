import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AuthContext } from "./AuthProvider";
import { updatePost } from "../features/posts/postsSlice";
import { Button, Form, Modal } from "react-bootstrap";

export default function UpdatePostModal({ show, handleClose, postId, originalPostContent }) {
  const [newPostContent, setNewPostContent] = useState(originalPostContent);
  const [newFile, setNewFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser ? currentUser.uid : null;

  useEffect(() => {
    setErrorMessage("");
  }, [show]);

  const handleUpdate = () => {
    setErrorMessage("");

    if (!newPostContent) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (newFile && !allowedTypes.includes(newFile.type)) {
      setErrorMessage("Only JPEG, PNG and GIF images are allowed.");

      return;
    }

    dispatch(updatePost({ userId, postId, newPostContent, newFile }));
    handleClose();
    setNewPostContent(newPostContent);
    setNewFile(null);
    setErrorMessage("");
  };

  const handleNewFileChange = (e) => {
    setNewFile(e.target.files[0]);
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="post-content">
              <Form.Control
                as="textarea"
                defaultValue={originalPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
              />
              <br />
              <Form.Control type="file" accept="image/*" onChange={handleNewFileChange} />
            </Form.Group>
            {errorMessage && <p className="text-danger mt-3 mb-0">{errorMessage}</p>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="rounded-pill" onClick={handleUpdate} variant="primary">
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
