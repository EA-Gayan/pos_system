import React from "react";

const Table = ({ headers, data, renderRow }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-lg">
      <table className="w-full text-left text-[#f5f5f5]">
        <thead className="bg-gradient-to-r from-[#333] to-[#3a3a3a] text-[#f6b100] sticky top-0 shadow-md">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="p-4 font-semibold text-sm uppercase tracking-wider last:flex last:justify-center">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#444]">
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
                className="p-8 text-center"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-400 font-medium">No data available</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
