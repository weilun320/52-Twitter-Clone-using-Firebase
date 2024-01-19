import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import { Provider } from "react-redux";
import store from "./store";
import AuthProvider, { AuthContext } from "./components/AuthProvider";
import { getAuth } from "firebase/auth";
import { useContext, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import ProfileSideBar from "./components/ProfileSideBar";
import ConnectPeoplePage from "./pages/ConnectPeoplePage";
import ConnectPeopleSection from "./components/ConnectPeopleSection";
import "./App.css";

export function Layout() {
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
          <Outlet />
          {window.location.pathname !== "/connect_people" &&
            <ConnectPeopleSection />
          }
        </Row>
      </Container>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/profile" />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/connect_people" element={<ConnectPeoplePage />} />
            </Route>
            <Route path="/login" element={<AuthPage />} />
            <Route path="*" element={<AuthPage />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </AuthProvider>
  );
}
