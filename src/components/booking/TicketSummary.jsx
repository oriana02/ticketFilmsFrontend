import { formatMoney } from "../../data/showtimes";
import "../../styles/Checkout.css";

function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-CL", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", hour12: false });
}

// Boleto tal como lo devuelve ms-boletos (BoletoResponseDto).
export default function TicketSummary({ boleto }) {
  return (
    <div className="ticket">
      <div className="ticket__head">
        <span className="ticket__code">{boleto.codigoBoleto}</span>
        <span className="ticket__status">{boleto.estado}</span>
      </div>
      <h3 className="ticket__title">{boleto.tituloEvento}</h3>
      <dl className="ticket__specs">
        <div className="ticket__spec"><dt>Función</dt><dd>{formatDateTime(boleto.fechaHoraFuncion)} hrs</dd></div>
        <div className="ticket__spec"><dt>Asientos</dt><dd>{boleto.asientos?.join(", ")}</dd></div>
        <div className="ticket__spec"><dt>Total pagado</dt><dd>{formatMoney(boleto.precioTotal)}</dd></div>
        <div className="ticket__spec"><dt>Comprado el</dt><dd>{formatDateTime(boleto.fechaCompra)}</dd></div>
      </dl>
    </div>
  );
}
