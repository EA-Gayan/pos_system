import { FaEdit, FaTrash } from "react-icons/fa";

const CommonTable = ({ data, columns, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[#f5f5f5]">
        <thead className="bg-[#333] text-[#ababab] sticky top-0">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="p-3">
                {col.label}
              </th>
            ))}
            <th className="p-3">Action</th>
          </tr>
        </thead>
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
                  <td key={col.key} className="p-3">
                    {col.render
                      ? col.render(item[col.key], item, index)
                      : item[col.key]}
                  </td>
                ))}
                <td className="p-3">
                  <div className="gap-10 flex justify-center">
                    <button
                      onClick={() => onEdit?.(item)}
                      className="text-blue-500 hover:text-blue-400"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => onDelete?.(item)}
                      className="text-red-500 hover:text-red-400 ml-4"
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
  );
};

export default CommonTable;
