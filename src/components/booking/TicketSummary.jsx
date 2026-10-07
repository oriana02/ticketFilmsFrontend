import { QRCodeSVG } from "qrcode.react";
import { formatMoney } from "../../data/showtimes";
import "../../styles/Ticket.css";

function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-CL", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Boleto tal como lo devuelve ms-boletos (BoletoResponseDto).
export default function TicketSummary({ boleto }) {
  return (
    <article className="ticket-card">
      <div className="ticket-card__main">
        <div className="ticket-card__top">
          <span className="ticket-card__brand">TicketFilms</span>
          <span className="ticket-card__status">{boleto.estado}</span>
        </div>

        <h3 className="ticket-card__title">{boleto.tituloEvento}</h3>

        <dl className="ticket-card__specs">
          <div>
            <dt>Función</dt>
            <dd>{formatDateTime(boleto.fechaHoraFuncion)} hrs</dd>
          </div>
          <div>
            <dt>Asientos</dt>
            <dd className="ticket-card__seats">
              {boleto.asientos?.map((a) => (
                <span key={a}>{a}</span>
              ))}
            </dd>
          </div>
          <div>
            <dt>Total pagado</dt>
            <dd>{formatMoney(boleto.precioTotal)}</dd>
          </div>
          <div>
            <dt>Comprado el</dt>
            <dd>{formatDateTime(boleto.fechaCompra)}</dd>
          </div>
        </dl>
      </div>

      <div className="ticket-card__stub">
        <div className="ticket-card__qr">
          <QRCodeSVG value={boleto.codigoBoleto} size={112} />
        </div>
        <span className="ticket-card__code">{boleto.codigoBoleto}</span>
        <span className="ticket-card__hint">
          Presenta este código en la entrada
        </span>
      </div>
    </article>
  );
}
