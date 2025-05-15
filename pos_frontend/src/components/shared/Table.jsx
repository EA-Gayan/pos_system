import React from "react";

const Table = ({ headers, data, renderRow }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[#f5f5f5]">
        <thead className="bg-[#333] text-[#ababab]">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="p-3 last:flex last:justify-center">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <React.Fragment key={index}>
                {renderRow(row, index)}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="p-4 text-center text-gray-400"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
