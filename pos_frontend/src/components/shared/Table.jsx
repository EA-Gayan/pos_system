import React from "react";

const Table = ({ headers, data, renderRow }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-lg scrollbar-thin scrollbar-thumb-[#3a3a3a]">
      <table className="w-full min-w-[500px] text-left text-fg">
        <thead className="bg-gradient-to-r from-strong to-strong text-accent sticky top-0 shadow-md">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="p-4 font-semibold text-sm uppercase tracking-wider last:flex last:justify-center">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line-stronger">
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
                  <p className="text-fg-dim font-medium">No data available</p>
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
