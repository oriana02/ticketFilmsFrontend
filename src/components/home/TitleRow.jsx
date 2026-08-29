import TitleCard from "./TitleCard";
import "../../styles/TitleRow.css";

export default function TitleRow({ items, type }) {
  return (
    <div className="title-row">
      {items.map((item) => (
        <div className="title-row__item" key={item.id}>
          <TitleCard type={type} title={item} />
        </div>
      ))}
    </div>
  );
}
