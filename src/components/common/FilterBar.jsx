import "../../styles/FilterBar.css";

// groups: [{
//   key, label,
//   type?: "pills" | "select" | "date",   // default: "pills"
//   options?: [{ value, label }],
//   value, onChange,
//   disabled?: boolean,
//   placeholder?: string
// }]
export default function FilterBar({ groups }) {
  return (
    <div className="filter-bar">
      {groups.map((group) => {
        const type = group.type || "pills";

        return (
          <div className="filter-bar__group" key={group.key}>
            <span className="filter-bar__label">{group.label}</span>

            {/* ── PILLS (comportamiento original) ── */}
            {type === "pills" && (
              <div className="filter-bar__pills">
                {group.options.map((opt) => (
                  <button
                    key={opt.value}
                    className={`filter-pill ${
                      group.value === opt.value ? "is-active" : ""
                    }`}
                    onClick={() => group.onChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── SELECT (para listas largas o dependientes) ── */}
            {type === "select" && (
              <select
                className="filter-bar__select"
                value={group.value}
                disabled={group.disabled}
                onChange={(e) => group.onChange(e.target.value)}
              >
                {group.placeholder && (
                  <option value="">{group.placeholder}</option>
                )}
                {group.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {/* ── DATE ── */}
            {type === "date" && (
              <input
                type="date"
                className="filter-bar__date"
                value={group.value}
                onChange={(e) => group.onChange(e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
