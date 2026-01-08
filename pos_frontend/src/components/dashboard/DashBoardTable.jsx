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
import { FaEdit, FaTrash, FaBan } from "react-icons/fa";
import EditModal from "./EditModal";
import ConfirmationPopup from "../shared/ConfirmationPopup";
import { enqueueSnackbar } from "notistack";
import FullScreenLoader from "../shared/FullScreenLoader";
import { useSelector } from "react-redux";
import { setProductList } from "../../redux/slices/productSlice";
import { useDispatch } from "react-redux";
import { MealTypes as MealTypeEnum } from "../../enum/mealTypes";
import { setCategoryList } from "../../redux/slices/CategorySlice";

const DashBoardTable = () => {
  const { section } = useParams();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const [tableData, setTableData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [labelType, setLabelType] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [selectedRow, setSelectedRow] = useState({});
  const [selectedMealType, setSelectedMealType] = useState(MealTypeEnum.ALL);

  const searchProductList = useSelector((state) => state.product.searchList);
  const searchCategoryList = useSelector((state) => state.category.searchList);

  // Determine API function based on section
  const fetchFn = useMemo(() => {
    switch (section) {
      case "total-categories":
        return getCategories;
      case "total-items":
        return getCategories;
      case "total-tables":
        return getTables;
      default:
        return null;
    }
  }, [section]);

  // Set headers and label type based on section
  useEffect(() => {
    switch (section) {
      case "total-categories":
        setHeaders(["Name", "Status", "Description", "Action"]);
        setLabelType("Category");
        break;
      case "total-items":
        setHeaders(["Name", "Price", "Description", "Action"]);
        setLabelType("Product");
        break;
      case "total-tables":
        setHeaders(["TableNo", "seats", "Action"]);
        setLabelType("Table");
        break;
      default:
        break;
    }
  }, [section]);

  const {
    data: resData,
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

  const records = useMemo(() => resData?.data?.data || [], [resData]);

  useEffect(() => {
    if (resData) {
      dispatch(setProductList(resData?.data?.data));
    }
  }, [resData, dispatch]);

  useEffect(() => {
    if (resData) {
      dispatch(setCategoryList(resData?.data?.data));
    }
  }, [resData, dispatch]);

  // UseEffect to handle search results
  useEffect(() => {
    if (section === "total-items" && searchProductList && searchProductList.length > 0) {
      // Show product search results
      setTableData(searchProductList);
    }

    if (section === "total-categories" && searchCategoryList && searchCategoryList.length > 0) {
      // Show category search results
      setTableData(searchCategoryList);
    }
  }, [searchProductList, section, searchCategoryList]);

  // UseEffect to handle normal data (when no search)
  useEffect(() => {
    // Check for section-specific search results
    const hasProductSearch = section === "total-items" && searchProductList && searchProductList.length > 0;
    const hasCategorySearch = section === "total-categories" && searchCategoryList && searchCategoryList.length > 0;

    // Only set normal data if there are no active search results for this section
    if (hasProductSearch || hasCategorySearch) {
      return; // Skip normal data update when search is active
    }

    let transformedData = records;

    if (section === "total-items") {
      transformedData = records.flatMap((category) =>
        (category.products || []).map((product) => ({
          ...product,
          categoryName: category.name,
        }))
      );
    }

    setTableData(transformedData);
  }, [records, section, searchProductList, searchCategoryList]);

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
    setSelectedRow(row);
    setIsTableModalOpen(true);
  };

  const handleDelete = (row) => {
    setPopupOpen(true);
    setSelectedId(row._id);
  };

  const handleDeleteApiCall = () => {
    if (!selectedId) return;

    switch (section) {
      case "total-items":
        deleteProductMutation.mutate(selectedId);
        break;
      case "total-categories":
        deleteCategoryMutation.mutate(selectedId);
        break;
      case "total-tables":
        deleteTableMutation.mutate(selectedId);
        break;
      default:
        break;
    }
  };

  const statusGetting = (value) => {
    const toLabel = (num) => {
      switch (num) {
        case 0:
          return "All";
        case 1:
          return "Breakfast";
        case 2:
          return "Lunch";
        case 3:
          return "Dinner";
        case 4:
          return "Common";
        default:
          return "Unknown";
      }
    };

    if (Array.isArray(value)) {
      return value.map(toLabel).join(", ");
    }
    return toLabel(value);
  };

  const renderRow = (row, index) => (
    <tr className="border-b border-[#444] hover:bg-[#2a2a2a] transition-colors duration-200" key={index}>
      {section === "total-categories" && (
        <>
          <td className="p-4 font-medium">{row.name}</td>
          <td className="p-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#f6b100] bg-opacity-20 text-[#f6b100]">
              {statusGetting(row.mealType)}
            </span>
          </td>
          <td className="p-4 text-gray-400">{row.description}</td>
        </>
      )}
      {section === "total-items" && (
        <>
          <td className="p-4 font-medium">{row.name}</td>
          <td className="p-4 text-[#f6b100] font-semibold">Rs. {row.price}</td>
          <td className="p-4 text-gray-400">{row.description}</td>
        </>
      )}
      {section === "total-tables" && (
        <>
          <td className="p-4 font-medium">Table {row.tableNo}</td>
          <td className="p-4">{row.noOfSeats}</td>
        </>
      )}
      <td className="p-4">
        <div className="gap-3 flex justify-center">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-400 hover:text-blue-300 cursor-pointer bg-blue-500 bg-opacity-10 hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200 hover:scale-110"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-red-400 hover:text-red-300 cursor-pointer bg-red-500 bg-opacity-10 hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200 hover:scale-110"
            title="Delete"
          >
            <FaTrash />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-gray-400 hover:text-gray-300 cursor-pointer bg-gray-500 bg-opacity-10 hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200 hover:scale-110"
            title="Disable"
          >
            <FaBan />
          </button>
        </div>
      </td>
    </tr>
  );

  const readableTitle = section
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="bg-[#262626] p-6 w-full h-full overflow-hidden">
      {queryLoading ? (
        <div className="flex justify-center items-center h-32">
          <FullScreenLoader />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-5 gap-3 bg-[#1f1f1f] rounded-lg shadow-md mb-4">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-4">
              <BackButton />
              <h2 className="text-xl sm:text-2xl text-white font-bold tracking-wide">{readableTitle}</h2>
            </div>

            {/* Center: Filter Buttons */}

            {/* Right: Result Count */}
            {section === "total-items" && (
              <span className="text-sm text-gray-400 mt-2 sm:mt-0 bg-[#2a2a2a] px-4 py-2 rounded-full">
                Showing <span className="text-[#f6b100] font-semibold">{tableData.length}</span> result(s)
              </span>
            )}
          </div>

          <div className="overflow-x-auto h-[calc(100%-80px)]">
            <Table headers={headers} data={tableData} renderRow={renderRow} />
          </div>
          {isTableModalOpen && selectedRow && (
            <EditModal
              currentData={selectedRow}
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
