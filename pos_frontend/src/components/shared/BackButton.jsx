import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const BackButton = ({ label = "Back", to, className = "" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`group inline-flex items-center gap-1.5 bg-gradient-to-r from-[#f6b100] to-[#e5a400] text-[#1a1a1a] text-xs font-bold rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 cursor-pointer shadow-sm hover:shadow-md hover:shadow-yellow-500/20 hover:brightness-105 active:scale-95 transition-all duration-200 border border-yellow-200/30 select-none shrink-0 ${className}`}
      title="Go Back"
    >
      <IoArrowBack className="text-sm sm:text-base transition-transform duration-200 group-hover:-translate-x-0.5 shrink-0" />
      <span className="tracking-wide text-xs sm:text-xs font-bold leading-none">{label}</span>
    </button>
  );
};

export default BackButton;
