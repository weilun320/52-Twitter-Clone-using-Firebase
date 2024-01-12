import { useContext, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ProfileSideBar from "../components/ProfileSideBar";
import ProfileMidBody from "../components/ProfileMidBody";
import { getAuth } from "firebase/auth";
import { AuthContext } from "../components/AuthProvider";

export default function ProfilePage() {
  const auth = getAuth();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    // Check if currentUser is logged in
    if (!currentUser) {
      navigate("/login"); // Redirect to login if user not logged in
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <>
      <Container>
        <Row>
          <ProfileSideBar handleLogout={handleLogout} />
          <ProfileMidBody />
        </Row>
      </Container>
    </>
  );
}
