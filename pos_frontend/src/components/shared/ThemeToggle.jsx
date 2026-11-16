import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className={`bg-surface border border-line rounded-xl sm:rounded-[15px] p-2 sm:p-2.5 cursor-pointer hover:bg-muted transition-colors ${className}`}
    >
      {isDark ? (
        <MdLightMode className="text-accent text-xl sm:text-2xl" />
      ) : (
        <MdDarkMode className="text-fg text-xl sm:text-2xl" />
      )}
    </button>
  );
};

export default ThemeToggle;
