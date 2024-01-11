import { Button } from "react-bootstrap";

export default function IconButton({
  isTop,
  isBottom,
  className,
  onClick,
  text,
}) {
  let margin;

  if (isTop) {
    margin = `light rounded-pill`;
  } else if (isBottom) {
    margin = `light mt-auto rounded-pill`;
  } else {
    margin = `light rounded-pill`;
  }
  const iconMargin = text ? " me-3" : " ";
  return (
    <Button variant={margin} onClick={onClick}>
      <i
        className={className + iconMargin}
        style={{ fontSize: "24px", color: isTop ? "dodgerblue" : "black" }}
      ></i>
      {text}
    </Button>
  );
}
