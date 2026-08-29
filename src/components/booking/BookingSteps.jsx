import "../../styles/BookingSteps.css";

const STEPS = ["Función", "Asientos", "Resumen", "Confirmación"];

export default function BookingSteps({ current }) {
  return (
    <ol className="booking-steps">
      {STEPS.map((label, i) => {
        const index = i + 1;
        const state = index < current ? "done" : index === current ? "current" : "todo";
        return (
          <li key={label} className={`booking-steps__item is-${state}`}>
            <span className="booking-steps__frame">{String(index).padStart(2, "0")}</span>
            <span className="booking-steps__label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
