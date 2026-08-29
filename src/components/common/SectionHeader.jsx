import { Link } from "react-router-dom";
import "../../styles/SectionHeader.css";

export default function SectionHeader({ eyebrow, title, note, to, toLabel }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="section-header__title">{title}</h2>
        {note && <p className="section-header__note">{note}</p>}
      </div>
      {to && (
        <Link to={to} className="section-header__link">
          {toLabel || "Ver todo"} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
