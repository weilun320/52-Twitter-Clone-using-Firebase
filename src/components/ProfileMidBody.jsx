import { useContext, useEffect, useState } from "react";
import { Button, Col, Image, Nav, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ProfilePostCard from "./ProfilePostCard";
import { fetchPostsByUser } from "../features/posts/postsSlice";
import { AuthContext } from "./AuthProvider";
import ProfileEditModal from "./ProfileEditModal";
import { fetchProfileByUser } from "../features/profiles/profilesSlice";

export default function ProfileMidBody() {
  const url =
    "https://pbs.twimg.com/profile_banners/83072625/1602845571/1500x500";
  const pic =
    "https://pbs.twimg.com/profile_images/1587405892437221376/h167Jlb2_400x400.jpg";

  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.posts);
  const loading = useSelector((state) => state.posts.loading);
  const profile = useSelector((state) => state.profiles.profile);
  const profileLoading = useSelector((state) => state.profiles.loading);
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser ? currentUser.uid : null;

  const [show, setShow] = useState(false);
  const handleOpen = () => setShow(true);
  const handleClose = () => setShow(false);

  useEffect(() => {
    dispatch(fetchPostsByUser(userId));
    dispatch(fetchProfileByUser(userId));
  }, [userId, dispatch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!profile || !profile.name || !profile.username) {
        handleOpen();
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [profile]);

  return (
    <>
      <Col sm={6} className="bg-light" style={{ border: "1px solid lightgrey" }}>
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

        {profileLoading &&
          <Spinner animation="border" className="mt-5" variant="primary" />
        }
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
      </Col>
      <ProfileEditModal show={show} handleClose={handleClose} userId={userId} profile={profile} />
    </>
  );
}
