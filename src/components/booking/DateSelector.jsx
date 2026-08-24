import "./DateSelector.css";

export default function DateSelector({ days, activeIndex, onSelect }) {
  return (
    <div className="date-selector">
      {days.map((day, i) => (
        <button
          key={day.date.iso}
          className={`date-selector__day ${i === activeIndex ? "is-active" : ""}`}
          onClick={() => onSelect(i)}
        >
          <span className="date-selector__weekday">{day.date.weekday}</span>
          <span className="date-selector__num">{day.date.day}</span>
          <span className="date-selector__month">{day.date.month}</span>
        </button>
      ))}
    </div>
  );
}
