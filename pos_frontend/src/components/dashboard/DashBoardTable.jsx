import { useParams } from "react-router-dom";
import BackButton from "../shared/BackButton";
import Table from "../shared/Table";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteCategory,
  deleteProduct,
  deleteTable,
  getCategories,
  getTables,
} from "../../https";
import { useEffect, useState, useMemo } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Modal from "./Modal";
import ConfirmationPopup from "../shared/ConfirmationPopup";
import { enqueueSnackbar } from "notistack";
import FullScreenLoader from "../shared/FullScreenLoader";

const DashBoardTable = () => {
  const { section } = useParams();
  const queryClient = useQueryClient();

  const [tableData, setTableData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [labelType, setLabelType] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  // Determine API function and headers based on section
  const fetchFn = useMemo(() => {
    switch (section) {
      case "Total Categories":
        setHeaders(["Name", "Status", "Description", "Action"]);
        setLabelType("Category");
        return getCategories;
      case "Total Items":
        setHeaders(["Name", "Price", "Description", "Action"]);
        setLabelType("Dishes");
        return getCategories;
      case "Total Tables":
        setHeaders(["TableNo", "seats", "Action"]);
        setLabelType("Table");
        return getTables;
      default:
        return null;
    }
  }, [section]);

  const {
    data: resData,
    isError,
    isLoading: queryLoading,
  } = useQuery({
    queryKey: [section],
    queryFn: async () => {
      if (!fetchFn) return [];
      return await fetchFn();
    },
    enabled: !!fetchFn,
    placeholderData: keepPreviousData,
  });

  const records = resData?.data?.data || [];

  useEffect(() => {
    let transformedData = records;

    if (section === "Total Items") {
      transformedData = records.flatMap((category) =>
        (category.products || []).map((product) => ({
          ...product,
          categoryName: category.name,
        }))
      );
    }

    setTableData((prevData) => {
      const isSame =
        JSON.stringify(prevData) === JSON.stringify(transformedData);
      return isSame ? prevData : transformedData;
    });
  }, [records, section]);

  const deleteTableMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      enqueueSnackbar("Deleted successfully!", { variant: "success" });
      setSelectedId("");
      setPopupOpen(false);
      queryClient.invalidateQueries([section]);
    },
    onError: () => {
      enqueueSnackbar("Failed to delete record!", { variant: "error" });
    },
  });
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      enqueueSnackbar("Deleted successfully!", { variant: "success" });
      setSelectedId("");
      setPopupOpen(false);
      queryClient.invalidateQueries([section]);
    },
    onError: () => {
      enqueueSnackbar("Failed to delete record!", { variant: "error" });
    },
  });
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      enqueueSnackbar("Deleted successfully!", { variant: "success" });
      setSelectedId("");
      setPopupOpen(false);
      queryClient.invalidateQueries([section]);
    },
    onError: () => {
      enqueueSnackbar("Failed to delete record!", { variant: "error" });
    },
  });

  const handleEdit = (row) => {
    setIsTableModalOpen(true);
    console.log("Edit clicked", row);
  };

  const handleDelete = (row) => {
    setPopupOpen(true);
    setSelectedId(row._id);
  };

  const handleDeleteApiCall = () => {
    if (!selectedId) return;

    switch (section) {
      case "Total Items":
        deleteProductMutation.mutate(selectedId);
        break;
      case "Total Categories":
        deleteCategoryMutation.mutate(selectedId);
        break;
      case "Total Tables":
        deleteTableMutation.mutate(selectedId);
        break;
      default:
        break;
    }
  };

  const renderRow = (row, index) => (
    <tr className="border-b border-[#444]" key={index}>
      {section === "Total Categories" && (
        <>
          <td className="p-3">{row.name}</td>
          <td className="p-3">{row.mealType}</td>
          <td className="p-3">{row.description}</td>
        </>
      )}
      {section === "Total Items" && (
        <>
          <td className="p-3">{row.name}</td>
          <td className="p-3">{row.price}</td>
          <td className="p-3">{row.description}</td>
        </>
      )}
      {section === "Total Tables" && (
        <>
          <td className="p-3">Table {row.tableNo}</td>
          <td className="p-3">{row.noOfSeats}</td>
        </>
      )}
      <td className="p-3">
        <div className="gap-10 flex justify-center">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-500 hover:text-blue-400"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-red-500 hover:text-red-400 ml-4"
          >
            <FaTrash />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-[#262626] p-4 w-full h-screen">
      {queryLoading ? (
        <div className="flex justify-center items-center h-32 mt-30">
          <FullScreenLoader />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-10 py-4">
            <div className="flex items-center gap-4">
              <BackButton />
              <h2 className="text-lg sm:text-xl text-white capitalize">
                {section}
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table headers={headers} data={tableData} renderRow={renderRow} />
          </div>
          {isTableModalOpen && (
            <Modal
              setIsTableModalOpen={setIsTableModalOpen}
              labelType={labelType}
            />
          )}
          {popupOpen && (
            <ConfirmationPopup
              message="Are you sure you want to delete this record?"
              title="Delete Record"
              onConfirm={handleDeleteApiCall}
              onCancel={() => setPopupOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DashBoardTable;
