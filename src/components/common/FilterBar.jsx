import "./FilterBar.css";

// groups: [{ key, label, options: [{value,label}], value, onChange }]
export default function FilterBar({ groups }) {
  return (
    <div className="filter-bar">
      {groups.map((group) => (
        <div className="filter-bar__group" key={group.key}>
          <span className="filter-bar__label">{group.label}</span>
          <div className="filter-bar__pills">
            {group.options.map((opt) => (
              <button
                key={opt.value}
                className={`filter-pill ${group.value === opt.value ? "is-active" : ""}`}
                onClick={() => group.onChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
