import { FaEdit, FaTrash } from "react-icons/fa";

const CommonTable = ({ data, columns, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[#f5f5f5] table-fixed">
        <colgroup>
          {columns.map((col) => (
            <col key={`col-${col.key}`} />
          ))}
          <col key="col-action" />
        </colgroup>
        <thead className="bg-[#333] text-[#ababab] sticky top-0">
          <tr>
            {columns.map((col) => (
              <th key={`th-${col.key}`} className="p-3 text-left align-top">
                {col.label}
              </th>
            ))}
            <th className="p-3 text-right align-top">Action</th>
          </tr>
        </thead>
      </table>
      <div
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 150px)" }}
      >
        <table className="w-full text-[#f5f5f5] table-fixed">
          <colgroup>
            {columns.map((col) => (
              <col key={`col-data-${col.key}`} />
            ))}
            <col key="col-data-action" />
          </colgroup>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="p-3 text-center text-[#ababab]"
                >
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id || index} className="border-b border-[#444]">
                  {columns.map((col) => (
                    <td
                      key={`td-${col.key}-${index}`}
                      className="p-3 text-left align-top truncate"
                    >
                      {col.render
                        ? col.render(item[col.key], item, index)
                        : item[col.key]}
                    </td>
                  ))}
                  <td className="p-3 text-right align-top">
                    <div className="flex gap-12 justify-end">
                      <button
                        onClick={() => onEdit?.(item)}
                        className="text-blue-500 hover:text-blue-400 cursor-pointer"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDelete?.(item)}
                        className="text-red-500 hover:text-red-400 cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommonTable;
