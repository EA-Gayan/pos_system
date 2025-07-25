const MiniCard = ({ title, icon, number, footerNum }) => {
  return (
    <div className="bg-[#1a1a1a] py-5 px-5 rounded-lg w-[50%]">
      <div className="flex items-start justify-between">
        <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
          {title}
        </h1>
        <button
          className={`${
            title === "Total Earnings" ? "bg-[#02ca3a]" : "bg-[#f6b100]"
          } p-3 rounded-lg text-[#f5f5f5] text-2xl`}
        >
          {icon}
        </button>
      </div>

      {/* Conditionally show Today Earnings in a flex row */}
      {title === "Today Earnings" ? (
        <div className="flex items-center justify-between mt-5">
          <h1 className="text-[#f5f5f5] text-4xl font-bold">Rs {number}</h1>
          {footerNum && (
            <h1 className="text-[#f5f5f5] text-sm">
              <span className="text-[#02ca3a]">{footerNum}</span> than yesterday
            </h1>
          )}
        </div>
      ) : (
        <>
          <h1 className="text-[#f5f5f5] text-4xl font-bold mt-5">
            {title === "Total Earnings" ? `Rs ${number}` : number}
          </h1>
          {footerNum && (
            <h1 className="text-[#f5f5f5] text-lg mt-4">
              <span className="text-[#02ca3a]">{footerNum}</span> than yesterday
            </h1>
          )}
        </>
      )}
    </div>
  );
};

export default MiniCard;
