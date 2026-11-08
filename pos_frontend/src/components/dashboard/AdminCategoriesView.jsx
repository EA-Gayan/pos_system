import React, { useMemo, useState } from "react";
import { FaEdit, FaPlus, FaSearch, FaTrash, FaUtensils } from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import Table from "../shared/Table";

const AdminCategoriesView = ({
  categories = [],
  isLoading,
  onOpenAddModal,
  onOpenEditModal,
  onRequestDelete,
  onViewCategoryProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("all");

  const mealTypeLabels = {
    0: "All",
    1: "Breakfast",
    2: "Lunch",
    3: "Dinner",
    4: "Common",
  };

  const getMealTypeDisplay = (value) => {
    if (Array.isArray(value)) {
      return value.map((num) => mealTypeLabels[num] || "Unknown").join(", ");
    }
    return mealTypeLabels[value] || "Unknown";
  };

  // Counts by meal type
  const mealTypeCounts = useMemo(() => {
    const counts = { all: categories.length, 1: 0, 2: 0, 3: 0, 4: 0 };
    categories.forEach((cat) => {
      const types = Array.isArray(cat.mealType)
        ? cat.mealType
        : cat.mealType !== undefined
        ? [cat.mealType]
        : [];
      types.forEach((t) => {
        if (counts[t] !== undefined) counts[t]++;
      });
    });
    return counts;
  }, [categories]);

  // Filter categories by search term and selected meal type
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedMealType === "all") return true;

      const types = Array.isArray(cat.mealType)
        ? cat.mealType
        : cat.mealType !== undefined
        ? [cat.mealType]
        : [];
      return types.includes(Number(selectedMealType));
    });
  }, [categories, searchTerm, selectedMealType]);

  const headers = ["Category Name", "Meal Session", "Items", "Description", "Actions"];

  const renderRow = (row, index) => {
    const productCount = Array.isArray(row.products) ? row.products.length : 0;

    return (
      <tr
        key={row._id || index}
        className="border-b border-[#333] hover:bg-[#252525] transition-colors duration-150"
      >
        <td className="p-4 font-semibold text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[#2a2a2a] text-[#f6b100]">
              <MdCategory className="text-base" />
            </span>
            <span>{row.name}</span>
          </div>
        </td>
        <td className="p-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f6b100]/15 text-[#f6b100] border border-[#f6b100]/25">
            {getMealTypeDisplay(row.mealType)}
          </span>
        </td>
        <td className="p-4">
          <button
            onClick={() => onViewCategoryProducts && onViewCategoryProducts(row._id, row.name)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#1e293b] text-blue-300 hover:bg-blue-900/40 border border-blue-500/20 transition cursor-pointer"
            title="Click to view products in this category"
          >
            <FaUtensils className="text-[10px]" />
            <span>{productCount} {productCount === 1 ? "item" : "items"}</span>
          </button>
        </td>
        <td className="p-4 text-gray-400 text-sm max-w-xs truncate">
          {row.description || <span className="text-gray-600 italic">No description</span>}
        </td>
        <td className="p-4">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onOpenEditModal("Category", row)}
              className="p-2 rounded-lg text-blue-400 bg-blue-500/10 hover:bg-blue-500/25 transition cursor-pointer"
              title="Edit Category"
            >
              <FaEdit className="text-sm" />
            </button>
            <button
              onClick={() => onRequestDelete("category", row._id, row.name)}
              className="p-2 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/25 transition cursor-pointer"
              title="Delete Category"
            >
              <FaTrash className="text-sm" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Banner & Actions */}
      <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              Categories Management
            </h2>
            <span className="bg-[#f6b100]/20 text-[#f6b100] border border-[#f6b100]/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {categories.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Organize menu categories and assign them to meal sessions (Breakfast, Lunch, Dinner).
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => onOpenAddModal("Category")}
            className="flex items-center gap-2 bg-[#f6b100] hover:bg-yellow-400 text-black font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-yellow-500/20 cursor-pointer shrink-0"
          >
            <FaPlus className="text-xs" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Meal Type Session Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedMealType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              selectedMealType === "all"
                ? "bg-[#f6b100] text-black shadow-sm"
                : "bg-[#252525] text-gray-400 hover:text-white hover:bg-[#2f2f2f]"
            }`}
          >
            All ({mealTypeCounts.all})
          </button>
          <button
            onClick={() => setSelectedMealType("1")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              selectedMealType === "1"
                ? "bg-[#f6b100] text-black shadow-sm"
                : "bg-[#252525] text-gray-400 hover:text-white hover:bg-[#2f2f2f]"
            }`}
          >
            Breakfast ({mealTypeCounts[1]})
          </button>
          <button
            onClick={() => setSelectedMealType("2")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              selectedMealType === "2"
                ? "bg-[#f6b100] text-black shadow-sm"
                : "bg-[#252525] text-gray-400 hover:text-white hover:bg-[#2f2f2f]"
            }`}
          >
            Lunch ({mealTypeCounts[2]})
          </button>
          <button
            onClick={() => setSelectedMealType("3")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              selectedMealType === "3"
                ? "bg-[#f6b100] text-black shadow-sm"
                : "bg-[#252525] text-gray-400 hover:text-white hover:bg-[#2f2f2f]"
            }`}
          >
            Dinner ({mealTypeCounts[3]})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64 md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories..."
            className="w-full bg-[#242424] text-white text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-[#383838] focus:border-[#f6b100] focus:outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {filteredCategories.length > 0 ? (
            <Table
              headers={headers}
              data={filteredCategories}
              renderRow={renderRow}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
              <MdCategory className="text-4xl text-gray-600 mb-3" />
              <h3 className="text-base font-semibold text-gray-300">
                {searchTerm ? "No matching categories" : "No categories found"}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                {searchTerm
                  ? `No categories match "${searchTerm}". Try a different keyword.`
                  : "Start organizing your menu by adding your first category."}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-3 text-xs text-[#f6b100] hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              ) : (
                <button
                  onClick={() => onOpenAddModal("Category")}
                  className="mt-4 bg-[#f6b100] text-black text-xs font-semibold px-4 py-2 rounded-xl hover:bg-yellow-400 transition cursor-pointer"
                >
                  + Add First Category
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategoriesView;

