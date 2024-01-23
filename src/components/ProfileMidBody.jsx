import { useContext, useEffect, useState } from "react";
import { Button, Col, Image, Nav, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ProfilePostCard from "./ProfilePostCard";
import { fetchPostsByUser } from "../features/posts/postsSlice";
import { AuthContext } from "./AuthProvider";
import ProfileEditModal from "./ProfileEditModal";
import { fetchProfileByUserId, fetchProfileByUsername } from "../features/profiles/profilesSlice";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFollowers, fetchFollowing, followUser, unfollowUser } from "../features/follows/followsSlice";
import { fetchRetweetsByUser } from "../features/retweets/retweetsSlice";
import ProfileRetweetCard from "./ProfileRetweetCard";

export default function ProfileMidBody() {
  const url =
    "https://pbs.twimg.com/profile_banners/83072625/1602845571/1500x500";
  const pic =
    "https://pbs.twimg.com/profile_images/1587405892437221376/h167Jlb2_400x400.jpg";

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const username = useParams().username || null;
  const { currentUser } = useContext(AuthContext);
  const currentUserId = currentUser ? currentUser.uid : null;

  const { profile, status, error } = useSelector((state) => state.profiles[username || currentUserId]) || {};

  const followers = useSelector((state) => state.follows.followers);
  const following = useSelector((state) => state.follows.following);

  const posts = useSelector((state) => state.posts[profile && profile.id]);
  const loading = useSelector((state) => state.posts.loading);

  const retweets = useSelector((state) =>
    state.retweets.retweets[profile && profile.id || currentUserId]
  );
  const [combinedData, setCombinedData] = useState([]);

  const [isFollowed, setIsFollowed] = useState(false);

  const [show, setShow] = useState(false);
  const handleOpen = () => setShow(true);
  const handleClose = () => setShow(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) {
        await dispatch(fetchProfileByUserId(currentUserId));
      } else {
        await dispatch(fetchProfileByUsername(username));
      }
    };

    fetchUserProfile();
  }, [currentUserId, dispatch, username]);

  useEffect(() => {
    const fetchData = async () => {
      if (profile && profile.id) {
        await dispatch(fetchPostsByUser(profile.id));
        await dispatch(fetchRetweetsByUser(profile.id));
        await dispatch(fetchFollowers(profile.id));
        await dispatch(fetchFollowing(profile.id));
      }
    };

    fetchData();
  }, [dispatch, profile]);

  useEffect(() => {
    if (posts && retweets) {
      const postsWithType = posts.map((post) => ({ ...post, type: "post" }));
      const retweetsWithType = retweets.map((retweet) => ({ ...retweet, type: "retweet" }));

      const combinedArray = [...postsWithType, ...retweetsWithType];

      const sortedArray = combinedArray.sort((a, b) => {
        const createdAtA = new Date(a.createdAt);
        const createdAtB = new Date(b.createdAt);

        return createdAtB - createdAtA;
      });

      setCombinedData(sortedArray);
    }
  }, [posts, retweets]);

  useEffect(() => {
    if (username && profile && profile.id && followers && following) {
      setIsFollowed(followers.some((id) => id === currentUserId));
    }
  }, [currentUserId, followers, following, profile, username]);

  const handleFollow = async () => {
    if (profile && !isFollowed) {
      await dispatch(followUser({ userId: currentUserId, followingId: profile.id }));
      await dispatch(fetchFollowers(profile.id));
      setIsFollowed(true);
    }
  };

  const handleUnfollow = async () => {
    if (profile && isFollowed) {
      await dispatch(unfollowUser({ userId: currentUserId, followingId: profile.id }));
      await dispatch(fetchFollowers(profile.id));
      setIsFollowed(false);
    }
  };

  return (
    <>
      <Col sm={6} className="bg-light" style={{ border: "1px solid lightgrey" }}>
        {status === "loading" ? (
          <Spinner animation="border" className="mt-5" variant="primary" />
        ) : status === "error" && error && !username ? (
          <Row className="justify-content-between align-items-center my-3">
            <Col>{error}</Col>
            <Col xs="auto">
              <Button className="rounded-pill mt-2" variant="outline-secondary" onClick={handleOpen}>
                Edit Profile
              </Button>
            </Col>
          </Row>
        ) : status === "error" && error && username ? (
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
              <Col className="fs-4 fw-semibold">Profile</Col>
            </Row>
            <div className="my-3">{error}</div>
          </>
        ) : status === "success" && profile ? (
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
                  {combinedData && combinedData.length > 1
                    ? `${combinedData.length} posts`
                    : `${combinedData.length} post`}
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
                {username && profile && profile.id !== currentUserId
                  ? (
                    <Button
                      className="rounded-pill mt-2"
                      variant={isFollowed ? "outline-primary" : "primary"}
                      onClick={() => isFollowed ? handleUnfollow() : handleFollow()}
                    >
                      {isFollowed ? "Unfollow" : "Follow"}
                    </Button>
                  )
                  : (
                    <Button className="rounded-pill mt-2" variant="outline-secondary" onClick={handleOpen}>
                      Edit Profile
                    </Button>
                  )
                }
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
              <strong>{following ? following.length : 0}</strong> Following{" "}
              <strong>{followers ? followers.length : 0}</strong> Followers
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
            {combinedData && combinedData.length > 0 && combinedData.map((data) => (
              data.type === "post" ? (
                <ProfilePostCard
                  key={`post-${data.id}`}
                  post={data}
                  user={profile}
                  clickable={true}
                  retweeted={false}
                />
              ) : (
                <ProfileRetweetCard
                  key={`retweet-${data.id}`}
                  retweet={data}
                  user={profile}
                  userId={profile && profile.id ? profile.id : currentUserId}
                />
              )
            ))}
          </>
        ) : null}
      </Col>
      <ProfileEditModal show={show} handleClose={handleClose} userId={currentUserId} profile={profile} />
    </>
  );
}
