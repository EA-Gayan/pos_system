const MiniCard = ({ title, icon, number, footerNum }) => {
  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#262626] py-6 px-6 rounded-xl w-[50%] shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-[#333]">
      <div className="flex items-start justify-between">
        <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
          {title}
        </h1>
        <button
          className={`${title === "Total Earnings" ? "bg-gradient-to-br from-[#02ca3a] to-[#01a830]" : "bg-gradient-to-br from-[#f6b100] to-[#e5a400]"
            } p-3 rounded-xl text-[#f5f5f5] text-2xl cursor-pointer hover:scale-110 transition-transform duration-200 shadow-md`}
        >
          {icon}
        </button>
      </div>

      {/* Conditionally show Today Earnings in a flex row */}
      {title === "Today Earnings" ? (
        <div className="flex items-center justify-between mt-6">
          <h1 className="text-[#f5f5f5] text-4xl font-bold">Rs {number}</h1>
          {footerNum && (
            <h1 className="text-[#f5f5f5] text-sm">
              <span className="text-[#02ca3a] font-semibold">{footerNum}</span> than yesterday
            </h1>
          )}
        </div>
      ) : (
        <>
          <h1 className="text-[#f5f5f5] text-4xl font-bold mt-6">
            {title === "Total Earnings" ? `Rs ${number}` : number}
          </h1>
          {footerNum && (
            <h1 className="text-[#f5f5f5] text-sm mt-4">
              <span className="text-[#02ca3a] font-semibold">{footerNum}</span> than yesterday
            </h1>
          )}
        </>
      )}
    </div>
  );
};

export default MiniCard;
