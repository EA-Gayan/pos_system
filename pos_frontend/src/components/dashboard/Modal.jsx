import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { enqueueSnackbar } from "notistack";
import { addCategory, addProduct, getCategories } from "../../https";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

// Dummy mutation function (replace with actual)
const addTable = async (reqData) => {
  // Simulate API call
  return { data: { message: "Table added successfully!" } };
};

const Modal = ({ setIsTableModalOpen, labelType }) => {
  const [tableData, setTableData] = useState({
    tableNo: "",
    seats: "",
  });

  const [categoryData, setCategoryData] = useState({
    categoryName: "",
    mealType: 0,
  });

  const [productData, setProductData] = useState({
    productName: "",
    price: "",
    description: "",
    category: "",
  });

  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getCategories();
    },
    placeholderData: keepPreviousData,
  });

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
      tableMutation.mutate(tableData);
    } else if (labelType === "Category") {
      categoryMutation.mutate(categoryData);
    } else {
      console.log("productData", productData);
      // productMutation.mutate(productData);
    }
  };

  const handleCloseModal = () => {
    setIsTableModalOpen(false);
  };

  // tableMutation section
  const tableMutation = useMutation({
    mutationFn: (reqData) => addTable(reqData),
    onSuccess: (res) => {
      setIsTableModalOpen(false);
      const { data } = res;
      enqueueSnackbar(data.message, { variant: "success" });
    },
    onError: (error) => {
      const { data } = error.response;
      enqueueSnackbar(data.message, { variant: "error" });
    },
  });

  // categoryMutation section
  const categoryMutation = useMutation({
    mutationFn: (reqData) => addCategory(reqData),
    onSuccess: (res) => {
      const { data } = res;
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
  const productMutation = useMutation({
    mutationFn: (reqData) => addProduct(reqData),
    onSuccess: (res) => {
      const { data } = res;
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
                    name="seats"
                    value={tableData.seats}
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
                    <option value={0}>Select a session</option>
                    <option value={1}>Breakfast</option>
                    <option value={2}>Lunch</option>
                    <option value={3}>Dinner</option>
                    <option value={4}>Other</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {labelType === "Dishes" && (
            <>
              <div>
                <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                  Dish Name
                </label>
                <div className="flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                  <input
                    type="text"
                    name="productName"
                    value={productData.productName}
                    onChange={handleInputChange}
                    className="bg-transparent flex-1 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                  Dish Price
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
                    value={productData.description}
                    onChange={handleInputChange}
                    className="bg-transparent flex-1 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                  Category Type
                </label>

                <div className="flex items-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                  <select
                    name="category"
                    value={productData.category}
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

export default Modal;
