
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./ModuleBackButton.css";

function ModuleBackButton() {
  return (
    <Link to="/dashboard" className="module-back-button">
      <ArrowLeft size={18} />
      <span>Back to Dashboard</span>
    </Link>
  );
}

export default ModuleBackButton;
