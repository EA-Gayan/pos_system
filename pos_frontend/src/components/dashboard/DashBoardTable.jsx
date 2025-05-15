import { useParams } from "react-router-dom";
import BackButton from "../shared/BackButton";
import Table from "../shared/Table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCategories } from "../../https";
import { useEffect, useState } from "react";

const DashBoardTable = () => {
  const { section } = useParams();
  const [categoryData, setCategoryData] = useState([]);

  const { data: resData, isError } = useQuery({
    queryKey: ["category"],
    queryFn: async () => await getCategories(),
    placeholderData: keepPreviousData,
  });

  // all categories
  const categories = resData?.data?.data || [];
  useEffect(() => {
    setCategoryData(categories);
  }, [categories]);

  // Define table headers
  const categoryHeaders = ["Id", "Name", "Status", "Description"];

  // Function to render each row
  const renderCategoryRow = (row, index) => (
    <tr className="border-b border-[#444]" key={index}>
      <td className="p-3">{row.id}</td>
      <td className="p-3">{row.name}</td>
      <td className="p-3">{row.mealType}</td>
      <td className="p-3">{row.description}</td>
    </tr>
  );

  return (
    <div className="bg-[#262626] p-4 rounded-lg w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h2 className="text-lg sm:text-xl text-white capitalize">
            {section} Categories
          </h2>
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        <Table
          headers={categoryHeaders}
          data={categoryData}
          renderRow={renderCategoryRow}
        />
      </div>
    </div>
  );
};

export default DashBoardTable;
