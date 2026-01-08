import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 bg-[#f6b100] text-[#1a1a1a] text-sm font-semibold rounded-md px-3 py-2 cursor-pointer hover:bg-[#e5a400] hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      <IoArrowBackOutline className="text-lg" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;
