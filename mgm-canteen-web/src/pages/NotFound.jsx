import { Link } from "react-router-dom";
import { Empty } from "../components/Notice.jsx";

export default function NotFound() {
  return (
    <Empty title="That page does not exist">
      <Link to="/" className="btn btn-primary">Go to the menu</Link>
    </Empty>
  );
}
