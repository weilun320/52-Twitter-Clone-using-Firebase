import { Col, Container, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function ConnectPeopleSection() {
  return (
    <Col sm={4}>
      <Container>
        <ListGroup className="my-3">
          <ListGroup.Item className="border-bottom-0" variant="light">
            <h4>Who to follow</h4>
          </ListGroup.Item>
          <ListGroup.Item as={Link} to="/connect_people" className="text-primary" variant="light">
            Show more
          </ListGroup.Item>
        </ListGroup>
      </Container>
    </Col>
  );
}
