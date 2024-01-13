import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup
} from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { Button, Col, Form, Image, Modal, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthProvider";

export default function AuthPage() {
  const loginImage = "https://sig1.co/img-twitter-1";
  // values: null (no modal show), "login", "signup"
  const [modalShow, setModalShow] = useState(null);
  const handleShowSignUp = () => setModalShow("signup");
  const handleShowLogin = () => setModalShow("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [responseMessage, setResponseMessage] = useState(null);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const navigate = useNavigate();
  const auth = getAuth();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) navigate("/profile");
  }, [currentUser, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        username,
        password
      );
      console.log(res.user);
    } catch (error) {
      console.error(error);

      setResponseMessage({ className: "text-danger", type: "signup" });
      switch (error.code) {
        case "auth/email-already-in-use":
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Please try another email.",
          }));
          break;
        case "auth/invalid-email":
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Please enter a valid email."
          }));
          break;
        case "auth/missing-password":
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Please enter a password.",
          }));
          break;
        case "auth/weak-password":
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Password should be at least 6 characters.",
          }));
          break;
        default:
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Something went wrong. Please try again later.",
          }));
          break;
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setResponseMessage(null);

    try {
      await signInWithEmailAndPassword(auth, username, password);
    } catch (error) {
      console.error(error);

      setResponseMessage({ className: "text-danger", type: "login" });
      switch (error.code) {
        case "auth/invalid-credential":
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Invalid username and/or password.",
          }));
          break;
        case "auth/invalid-email":
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Please enter a valid email."
          }));
          break;
        case "auth/missing-password":
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Please enter a password.",
          }));
          break;
        default:
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Something went wrong. Please try again later.",
          }));
          break;
      }
    }
  };

  const googleProvider = new GoogleAuthProvider();
  const handleGoogleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  const facebookProvider = new FacebookAuthProvider();
  const handleFacebookLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithPopup(auth, facebookProvider);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePasswordReset = async () => {
    setResponseMessage(null);

    try {
      await sendPasswordResetEmail(auth, username)
        .then(() =>
          setResponseMessage({
            message: "Password reset email sent!",
            className: "",
            type: "reset",
          })
        );
    } catch (error) {
      console.error(error);

      setResponseMessage({ className: "text-danger", type: "reset" });
      switch (error.code) {
        case "auth/missing-email":
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Please enter an email.",
          }));
          break;
        default:
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Something went wrong. Please try again later.",
          }));
          break;
      }
    }
  };

  const handlePhoneLogin = async () => {
    setResponseMessage(null);
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {});

    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);

      window.confirmationResult = confirmationResult;
      setShowVerification(true);
    } catch (error) {
      console.error("Phone authentication error:", error);

      setResponseMessage({ className: "text-danger", type: "phone" });
      switch (error.code) {
        case "auth/invalid-phone-number":
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Please enter a valid phone number.",
          }));
          break;
        default:
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Something went wrong. Please try again later.",
          }));
          break;
      }
    }
  };

  const handleVerificationCode = async (e) => {
    e.preventDefault();
    setResponseMessage(null);

    try {
      const res = await window.confirmationResult.confirm(verificationCode);
      console.log(res.user);
    } catch (error) {
      console.error(error);

      setResponseMessage({ className: "text-danger", type: "verify" });
      switch (error.code) {
        case "auth/invalid-verification-code":
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Invalid verification code.",
          }));
          break;
        default:
          setResponseMessage((prevMessage) => ({
            ...prevMessage,
            message: "Something went wrong. Please try again later.",
          }));
          break;
      }
    }
  };

  const handleClose = () => {
    setModalShow(null);
    setResponseMessage(null);
  };

  return (
    <Row>
      <Col sm={6}>
        <Image src={loginImage} fluid />
      </Col>
      <Col sm={6} className="p-4">
        <i
          className="bi bi-twitter"
          style={{ fontSize: 50, color: "dodgerblue" }}
        ></i>

        <p className="mt-5" style={{ fontSize: 64 }}>
          Happening Now
        </p>
        <h2 className="my-5" style={{ fontSize: 31 }}>
          Join Twitter today.
        </h2>
        <Col sm={5} className="d-grid gap-2">
          <Button
            className="rounded-pill"
            variant="outline-dark"
            onClick={handleGoogleLogin}
          >
            <i className="bi bi-google"></i> Sign up with Google
          </Button>
          <Button
            className="rounded-pill"
            variant="outline-dark"
            onClick={handleFacebookLogin}
          >
            <i className="bi bi-facebook"></i> Sign up with Facebook
          </Button>
          <Button className="rounded-pill" variant="outline-dark">
            <i className="bi bi-apple"></i> Sign up with Apple
          </Button>
          <p style={{ textAlign: "center" }}>or</p>
          <Button className="rounded-pill" onClick={handleShowSignUp}>
            Create an account
          </Button>
          <p style={{ fontSize: "12px" }}>
            By signing up, you agree to the Terms of Service and Privacy Policy including Cookie Use.
          </p>
          <p className="mt-5" style={{ fontWeight: "bold" }}>
            Already have an account?
          </p>
          <Button
            className="rounded-pill"
            variant="outline-primary"
            onClick={handleShowLogin}
          >
            Sign in
          </Button>
        </Col>
        <Modal
          show={modalShow !== null}
          onHide={handleClose}
          animation={false}
          centered
        >
          <Modal.Body>
            {showVerification ? (
              <>
                <h2 className="mb-4 fw-bold">
                  <span
                    className="fw-normal fs-3 me-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowVerification(false)}
                  >
                    <i className="bi bi-arrow-left"></i>
                  </span>
                  Verify your phone number
                </h2>

                <div className="px-5 text-center">
                  <p className="text-start">A verification code has been sent to your phone number.</p>

                  <Form.Group className="mb-3" controlId="verification-code">
                    <Form.Control
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter verification code"
                      type="text"
                    />
                  </Form.Group>

                  {responseMessage && responseMessage.type === "verify" &&
                    <p className={`${responseMessage.className} text-start`} style={{ fontSize: 15 }}>
                      {responseMessage.message}
                    </p>
                  }

                  <Button className="rounded-pill" onClick={handleVerificationCode}>
                    Verify phone number
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="mb-4" style={{ fontWeight: "bold" }}>
                  {modalShow === "signup"
                    ? "Create your account"
                    : "Log in to your account"}
                </h2>

                <Form
                  className="d-grid gap-2 px-5"
                  onSubmit={modalShow === "signup" ? handleSignUp : handleLogin}
                >
                  <Form.Group className="mb-3" controlId="username">
                    <Form.Control
                      onChange={(e) => setUsername(e.target.value)}
                      type="email"
                      placeholder="Enter email"
                    />
                  </Form.Group>

                  <Form.Group className={modalShow !== "login" ? "mb-3" : ""} controlId="password">
                    <Form.Control
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="Password"
                    />
                  </Form.Group>

                  {modalShow === "signup" ? (
                    <p style={{ fontSize: 12 }}>
                      By signing up, you agree to the Terms of Service and Privacy
                      Policy, including Cookie Use. SigmaTweets may use your contact
                      information, including your email address and phone number for
                      purposes outlined in our Privacy Policy, like keeping your
                      account secure and personalising our services, including ads.
                      Learn more. Others will be able to find you by email or phone
                      number, when provided, unless you choose otherwise here.
                    </p>
                  ) : (
                    <p
                      onClick={handlePasswordReset}
                      style={{ cursor: "pointer", fontSize: 14, width: "fit-content" }}
                    >
                      Forgot password?
                    </p>
                  )}

                  {responseMessage && responseMessage.type !== "phone" &&
                    <p className={responseMessage.className} style={{ fontSize: 15 }}>
                      {responseMessage.message}
                    </p>
                  }

                  <Button className="rounded-pill" type="submit">
                    {modalShow === "signup" ? "Sign up" : "Log in"}
                  </Button>
                </Form>
                {modalShow === "login" && (
                  <div className="px-5 text-center">
                    <p className="my-3">or</p>
                    <Button
                      className="mx-1 rounded-circle"
                      variant="outline-dark"
                      style={{ height: 42 }}
                      onClick={handleGoogleLogin}
                    >
                      <i className="bi bi-google"></i>
                    </Button>
                    <Button
                      className="mx-1 rounded-circle"
                      variant="outline-dark"
                      style={{ height: 42 }}
                      onClick={handleFacebookLogin}
                    >
                      <i className="bi bi-facebook"></i>
                    </Button>
                    <Button
                      className="mx-1 rounded-circle"
                      variant="outline-dark"
                      style={{ height: 42 }}
                    >
                      <i className="bi bi-apple"></i>
                    </Button>
                    <p className="my-3">or</p>
                    <Form.Group className="mb-3" controlId="phone-number">
                      <Form.Control
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        type="text"
                        placeholder="Enter phone number"
                      />
                    </Form.Group>

                    {responseMessage && responseMessage.type === "phone" &&
                      <p className={`${responseMessage.className} text-start`} style={{ fontSize: 15 }}>
                        {responseMessage.message}
                      </p>
                    }

                    <Button
                      className="rounded-pill"
                      variant="outline-dark"
                      onClick={handlePhoneLogin}
                    >
                      <i className="bi bi-phone"></i> Sign in with Phone
                    </Button>
                    <div className="mt-3" id="recaptcha-container"></div>
                  </div>
                )}
              </>
            )}
          </Modal.Body>
        </Modal>
      </Col>
    </Row>
  );
}
