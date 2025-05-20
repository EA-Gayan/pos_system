import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import {
  updateCategory,
  updateProduct,
  updateTable,
  getCategories,
} from "../../https";

const EditModal = ({ setIsTableModalOpen, labelType, currentData }) => {
  const [tableData, setTableData] = useState({
    tableId: null,
    tableNo: "",
    noOfSeats: null,
  });

  const [categoryData, setCategoryData] = useState({
    categoryId: null,
    categoryName: "",
    mealType: 0,
  });

  const [productData, setProductData] = useState({
    productId: null,
    name: "",
    price: "",
    description: "",
    categoryId: "",
  });

  const {
    data: resData,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getCategories();
    },
    placeholderData: keepPreviousData,
    enabled: labelType === "Product", // Only runs if labelType is "Product"
  });

  useEffect(() => {
    refetch();
  }, []);

  //current data setting
  useEffect(() => {
    console.log(currentData);
    if (labelType === "Table") {
      setTableData({
        tableId: currentData._id,
        tableNo: currentData.tableNo.toString(),
        noOfSeats: currentData.noOfSeats.toString(),
      });
    } else if (labelType === "Category") {
      setCategoryData({
        categoryId: currentData.id,
        categoryName: currentData.name,
        mealType: currentData.mealType.toString(),
      });
    } else if (labelType === "Product") {
      setProductData({
        productId: currentData._id,
        name: currentData.name,
        price: currentData.price.toString(),
        description: currentData.description,
        categoryId: currentData.category,
      });
    }
  }, [currentData]);

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  }, [isError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (labelType === "Table") {
      setTableData((prev) => ({ ...prev, [name]: value }));
    } else if (labelType === "Category") {
      setCategoryData((prev) => ({ ...prev, [name]: value }));
    } else {
      setProductData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handledropDownChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prev) => ({
      ...prev,
      [name]: parseInt(value, 10),
    }));
  };

  const handleProductDownChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (labelType === "Table") {
      tableUpdateMutation.mutate({
        tableId: tableData.tableId,
        tableNo: tableData.tableNo,
        noOfSeats: tableData.noOfSeats,
      });
    } else if (labelType === "Category") {
      categoryUpdateMutation.mutate({
        categoryId: categoryData.categoryId,
        categoryName: categoryData.categoryName,
        mealType: categoryData.mealType,
      });
    } else if (labelType === "Product") {
      productUpdateMutation.mutate({
        productId: productData.productId,
        name: productData.name,
        price: productData.price,
        description: productData.description,
        categoryId: productData.categoryId,
      });
    } else {
      return;
    }
  };

  const handleCloseModal = () => {
    setIsTableModalOpen(false);
  };

  // tableMutation section
  const tableUpdateMutation = useMutation({
    mutationFn: (reqData) => updateTable(reqData),
    onSuccess: (res) => {
      setIsTableModalOpen(false);
      const { data } = res;
      window.location.reload();

      enqueueSnackbar(data.message, { variant: "success" });
    },
    onError: (error) => {
      const { data } = error.response;
      enqueueSnackbar(data.message, { variant: "error" });
    },
  });

  // categoryMutation section
  const categoryUpdateMutation = useMutation({
    mutationFn: (reqData) => updateCategory(reqData),
    onSuccess: (res) => {
      setIsTableModalOpen(false);
      const { data } = res;
      window.location.reload();

      enqueueSnackbar(data.message, {
        variant: "success",
      });
    },
    onError: (err) => {
      enqueueSnackbar(err.response.message, {
        variant: "error",
      });
    },
  });

  // productMutation section
  const productUpdateMutation = useMutation({
    mutationFn: (reqData) => updateProduct(reqData),
    onSuccess: (res) => {
      setIsTableModalOpen(false);
      const { data } = res;
      window.location.reload();

      enqueueSnackbar(data.message, {
        variant: "success",
      });
    },
    onError: (err) => {
      enqueueSnackbar(err.response.message, {
        variant: "error",
      });
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#262626] p-6 rounded-lg shadow-lg w-96"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#f5f5f5] text-xl font-semibold">
            Add {labelType}
          </h2>
          <button
            onClick={handleCloseModal}
            className="text-[#f5f5f5] hover:text-red-500"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-10">
          {labelType === "Table" && (
            <>
              <div>
                <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                  Table Number
                </label>
                <div className="flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                  <input
                    type="number"
                    name="tableNo"
                    value={tableData.tableNo}
                    onChange={handleInputChange}
                    className="bg-transparent flex-1 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                  Number of Seats
                </label>
                <div className="flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                  <input
                    type="number"
                    name="noOfSeats"
                    placeholder={tableData.noOfSeats}
                    value={tableData.noOfSeats}
                    onChange={handleInputChange}
                    className="bg-transparent flex-1 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {labelType === "Category" && (
            <>
              <div>
                <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                  Category Name
                </label>
                <div className="flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                  <input
                    type="text"
                    name="categoryName"
                    placeholder={categoryData.categoryName}
                    value={categoryData.categoryName}
                    onChange={handleInputChange}
                    className="bg-transparent flex-1 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                  Session Type
                </label>
                <div className="flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                  <select
                    name="mealType"
                    value={categoryData.mealType}
                    onChange={handledropDownChange}
                    className="bg-[#1f1f1f] text-white w-full focus:outline-none"
                    required
                  >
                    {categoryData.mealType === 0 && (
                      <option value={0} disabled>
                        Select a session
                      </option>
                    )}
                    <option value={1}>Breakfast</option>
                    <option value={2}>Lunch</option>
                    <option value={3}>Dinner</option>
                    <option value={4}>Other</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {labelType === "Product" && (
            <>
              <div>
                <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                  Item Name
                </label>
                <div className="flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                  <input
                    type="text"
                    name="name"
                    placeholder={productData.name}
                    value={productData.name}
                    onChange={handleInputChange}
                    className="bg-transparent flex-1 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                  Item Price
                </label>
                <div className="flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                  <input
                    type="number"
                    name="price"
                    value={productData.price}
                    onChange={handleInputChange}
                    className="bg-transparent flex-1 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>{" "}
              <div>
                <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                  Description
                </label>
                <div className="flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                  <input
                    type="text"
                    name="description"
                    placeholder={productData.description}
                    value={productData.description}
                    onChange={handleInputChange}
                    className="bg-transparent flex-1 text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                  Category Type
                </label>

                <div className="flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                  <select
                    name="categoryId"
                    placeholder={productData.categoryId}
                    value={productData.categoryId}
                    onChange={handleProductDownChange}
                    className="bg-[#1f1f1f] text-white w-full focus:outline-none"
                    required
                  >
                    <option value="">Select a Category</option>
                    {resData?.data?.data.map((each) => (
                      <option key={each._id} value={each._id}>
                        {each.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full rounded-lg mt-10 mb-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold"
          >
            Add {labelType}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default EditModal;
