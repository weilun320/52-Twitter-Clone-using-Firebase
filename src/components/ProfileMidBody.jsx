import { useContext, useEffect, useState } from "react";
import { Button, Col, Image, Nav, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ProfilePostCard from "./ProfilePostCard";
import { fetchPostsByUser } from "../features/posts/postsSlice";
import { AuthContext } from "./AuthProvider";
import ProfileEditModal from "./ProfileEditModal";
import { fetchProfileByUserId, fetchProfileByUsername } from "../features/profiles/profilesSlice";
import { useNavigate, useParams } from "react-router-dom";

export default function ProfileMidBody() {
  const url =
    "https://pbs.twimg.com/profile_banners/83072625/1602845571/1500x500";
  const pic =
    "https://pbs.twimg.com/profile_images/1587405892437221376/h167Jlb2_400x400.jpg";

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.posts);
  const loading = useSelector((state) => state.posts.loading);
  const username = useParams().username || null;
  const { currentUser } = useContext(AuthContext);
  const currentUserId = currentUser ? currentUser.uid : null;

  const [show, setShow] = useState(false);
  const handleOpen = () => setShow(true);
  const handleClose = () => setShow(false);

  useEffect(() => {
    if (!username) {
      dispatch(fetchProfileByUserId(currentUserId));
      dispatch(fetchPostsByUser(currentUserId));
    }
    else {
      dispatch(fetchProfileByUsername(username));
    }
  }, [currentUserId, dispatch, username]);

  const profile = useSelector((state) => state.profiles.data);
  const status = useSelector((state) => state.profiles.status);
  const error = useSelector((state) => state.profiles.error);

  useEffect(() => {
    if (username && profile && profile.id) {
      dispatch(fetchPostsByUser(profile.id));
    }
  }, [dispatch, profile, username]);

  return (
    <>
      <Col sm={6} className="bg-light" style={{ border: "1px solid lightgrey" }}>
        {status === "loading" ? (
          <Spinner animation="border" className="mt-5" variant="primary" />
        ) : status === "error" && !username ? (
          <Row className="justify-content-between align-items-center my-3">
            <Col>{error}</Col>
            <Col xs="auto">
              <Button className="rounded-pill mt-2" variant="outline-secondary" onClick={handleOpen}>
                Edit Profile
              </Button>
            </Col>
          </Row>
        ) : status === "error" && username ? (
          <div className="my-3">{error}</div>
        ) : status === "success" ? (
          <>
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
              <Col>
                <div className="fw-bold fs-5">
                  {profile && profile.name}
                </div>
                <div className="text-secondary" style={{ fontSize: 14 }}>
                  {posts && posts.length > 1
                    ? `${posts.length} posts`
                    : `${posts.length} post`}
                </div>
              </Col>
            </Row>
            <div className="w-100 position-relative" style={{ backgroundColor: "#ccc", height: 181 }}>
              {profile && profile.bannerImageUrl &&
                <Image src={profile.bannerImageUrl} className="object-fit-cover w-100" height={181} />
              }
              <div
                className="position-absolute rounded-circle"
                style={{
                  backgroundColor: "#ccc",
                  border: "4px solid #F8F9FA",
                  height: profile && profile.profileImageUrl ? "fit-content" : 150,
                  marginLeft: 15,
                  top: "130px",
                  width: profile && profile.profileImageUrl ? "fit-content" : 150,
                }}
              >
                {profile && profile.profileImageUrl &&
                  <Image
                    className="object-fit-cover"
                    height={150}
                    roundedCircle
                    src={profile && profile.profileImageUrl}
                    width={150}
                  />
                }
              </div>
            </div>
            <br />

            <Row className="justify-content-end">
              <Col xs="auto">
                <Button className="rounded-pill mt-2" variant="outline-secondary" onClick={handleOpen}>
                  Edit Profile
                </Button>
              </Col>
            </Row>

            <p
              className="mt-5"
              style={{ margin: 0, fontWeight: "bold", fontSize: "15px" }}
            >
              {profile && profile.name}
            </p>
            <p className="text-secondary" style={{ marginBottom: "2px" }}>
              {profile && profile.username && `@${profile.username}`}
            </p>
            <p>
              {profile && profile.bio}
            </p>
            <p>
              <strong>271</strong> Following <strong>610</strong> Followers
            </p>
            <Nav variant="underline" defaultActiveKey="/home" justify>
              <Nav.Item>
                <Nav.Link eventKey="/home">Tweets</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="link-1">Replies</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="link-2">Highlights</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="link-3">Media</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="link-4">Likes</Nav.Link>
              </Nav.Item>
            </Nav>
            {loading && (
              <Spinner animation="border" className="ms-3 mt-3" variant="primary" />
            )}
            {posts && posts.length > 0 && posts.map((post) => (
              <ProfilePostCard key={post.id} post={post} />
            ))}
          </>
        ) : null}
      </Col>
      <ProfileEditModal show={show} handleClose={handleClose} userId={currentUserId} profile={profile} />
    </>
  );
}
