import { useEffect, useRef, useState } from "react";
import { Button, FloatingLabel, Form, Image, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { fetchProfileByUser, saveProfile } from "../features/profiles/profilesSlice";

export default function ProfileEditModal({ show, handleClose, userId, profile }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setName(profile.name || "");
      setBio(profile.bio || "");
      setProfileImage(profile.profileImageUrl || null);
      setBannerImage(profile.bannerImageUrl || null);
    }
  }, [profile]);

  const profileImageInputRef = useRef();
  const bannerImageInputRef = useRef();

  const handleProfileImageClick = () => profileImageInputRef.current.click();
  const handleBannerImageClick = () => bannerImageInputRef.current.click();

  const handleProfileImageChange = (e) => {
    const selectedFile = e.target.files[0];
    setErrorMessage("");

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(selectedFile?.type)) {
      setErrorMessage("Only JPEG, PNG and GIF images are allowed.");

      return;
    }

    setProfileImageFile(selectedFile);
    setProfileImage(URL.createObjectURL(selectedFile));
  };

  const handleBannerImageChange = (e) => {
    const selectedFile = e.target.files[0];
    setErrorMessage("");

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(selectedFile?.type)) {
      setErrorMessage("Only JPEG, PNG and GIF images are allowed.");

      return;
    }

    setBannerImageFile(selectedFile);
    setBannerImage(URL.createObjectURL(selectedFile));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username) {
      setErrorMessage("Please set a username.");
      return;
    }
    else if (!name) {
      setErrorMessage("Please set a name.");
      return;
    }

    dispatch(saveProfile({ userId, data: { username, name, bio, profileImageFile, bannerImageFile } }))
      .unwrap()
      .then(() => {
        dispatch(fetchProfileByUser(userId));
        handleClose();
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage(error);
      });
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <Form>
            <div
              className="w-100 position-relative"
              style={{ backgroundColor: "#ccc", height: 150 }}
            >
              {bannerImage &&
                <Image src={bannerImage} className="w-100 object-fit-cover" style={{ height: 150 }} />
              }
              <div className="position-absolute top-50 start-50 translate-middle">
                <Form.Control
                  accept="image/*"
                  onChange={handleBannerImageChange}
                  ref={bannerImageInputRef}
                  style={{ display: "none" }}
                  type="file"
                />
                <Button
                  className="rounded-circle"
                  onClick={handleBannerImageClick}
                  style={{ backgroundColor: "rgba(0, 0, 0, .5)", height: 42, width: 42 }}
                  variant="dark"
                >
                  <i className="bi bi-camera"></i>
                </Button>
              </div>
              <div
                className="position-absolute rounded-circle"
                style={{
                  backgroundColor: "#ccc",
                  border: "3px solid #F8F9FA",
                  height: profileImage ? "fit-content" : 100,
                  marginLeft: 14,
                  top: 110,
                  width: profileImage ? "fit-content" : 100,
                }}
              >
                {profileImage &&
                  <Image
                    src={profileImage}
                    roundedCircle
                    className="object-fit-cover"
                    height={100}
                    width={100}
                  />
                }
                <div className="position-absolute top-50 start-50 translate-middle">
                  <Form.Control
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    ref={profileImageInputRef}
                    style={{ display: "none" }}
                    type="file"
                  />
                  <Button
                    className="rounded-circle"
                    onClick={handleProfileImageClick}
                    style={{ backgroundColor: "rgba(0, 0, 0, .5)", height: 42, width: 42 }}
                    variant="dark"
                  >
                    <i className="bi bi-camera"></i>
                  </Button>
                </div>
              </div>
            </div>
            <br />
            <FloatingLabel className="mt-5 mb-3" controlId="username" label="Username">
              <Form.Control
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                type="text"
                value={username}
              />
            </FloatingLabel>
            <FloatingLabel className="mb-3" controlId="name" label="Name">
              <Form.Control
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                type="text"
                value={name}
              />
            </FloatingLabel>
            <FloatingLabel className="mb-3" controlId="bio" label="Bio">
              <Form.Control
                as="textarea"
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
                style={{ height: 100, resize: "none" }}
                type="text"
                value={bio}
              />
            </FloatingLabel>
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="rounded-pill" variant="primary" onClick={handleSaveProfile}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
