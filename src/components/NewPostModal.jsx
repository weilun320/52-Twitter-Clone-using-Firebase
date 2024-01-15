import { useContext, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { savePost } from "../features/posts/postsSlice";
import { AuthContext } from "./AuthProvider";

export default function NewPostModal({ show, handleClose }) {
  const [postContent, setPostContent] = useState("");
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser ? currentUser.uid : null;

  useEffect(() => {
    setErrorMessage("");
  }, [show]);

  const handleSave = () => {
    setErrorMessage("");

    if (!postContent) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Only JPEG, PNG and GIF images are allowed.");

      return;
    }

    dispatch(savePost({ userId, postContent, file }));
    handleClose();
    setPostContent("");
    setFile(null);
    setErrorMessage("");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  }

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="postContent">
              <Form.Control
                placeholder="What is happening?!"
                as="textarea"
                rows={3}
                onChange={(e) => setPostContent(e.target.value)}
              />
              <br />
              <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
            </Form.Group>
            {errorMessage && <p className="text-danger mt-3 mb-0">{errorMessage}</p>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            className="rounded-pill"
            onClick={handleSave}
          >
            Tweet
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
