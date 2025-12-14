import { useState, useRef, useEffect } from "react";

export default function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Select items",
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    let updated = [...selectedValues];

    if (updated.includes(value)) {
      updated = updated.filter((v) => v !== value);
    } else {
      updated.push(value);
    }

    onChange(updated);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-[#ababab] mb-2 text-sm font-medium">
          {label}
        </label>
      )}

      {/* Dropdown button */}
      <div
        onClick={() => setOpen(!open)}
        className="w-full rounded-lg p-3 bg-[#1f1f1f] text-white cursor-pointer"
      >
        {selectedValues.length === 0
          ? placeholder
          : `${selectedValues.length} selected`}
      </div>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute mt-1 w-full bg-[#1f1f1f] text-white rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 p-2">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 p-2 hover:bg-[#272727] rounded-lg cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(opt.value)}
                onChange={() => handleSelect(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
