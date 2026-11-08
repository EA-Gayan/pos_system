import React, { useMemo, useState } from "react";
import { BiSolidDish } from "react-icons/bi";
import { FaEdit, FaFilter, FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import Table from "../shared/Table";

const AdminProductsView = ({
  categories = [],
  initialCategoryFilter = "all",
  onOpenAddModal,
  onOpenEditModal,
  onRequestDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryFilter);
  const [sortBy, setSortBy] = useState("default");

  // Flatten products from categories
  const allProducts = useMemo(() => {
    return categories.flatMap((cat) =>
      (cat.products || []).map((product) => ({
        ...product,
        categoryName: cat.name,
        categoryId: cat._id,
      }))
    );
  }, [categories]);

  // Filter products by selected category and search term
  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.categoryId === selectedCategory;

      if (!matchesCategory) return false;

      const term = searchTerm.toLowerCase();
      const matchesSearch =
        product.name?.toLowerCase().includes(term) ||
        product.sName?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.categoryName?.toLowerCase().includes(term);

      return matchesSearch;
    });

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return result;
  }, [allProducts, selectedCategory, searchTerm, sortBy]);

  const headers = ["Product Name", "Category", "Price", "Description", "Actions"];

  const renderRow = (row, index) => {
    return (
      <tr
        key={row._id || index}
        className="border-b border-[#333] hover:bg-[#252525] transition-colors duration-150"
      >
        <td className="p-4 font-semibold text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[#2a2a2a] text-[#f6b100]">
              <BiSolidDish className="text-base" />
            </span>
            <div>
              <div className="font-semibold text-sm sm:text-base text-white">
                {row.name}
              </div>
              {row.sName && (
                <span className="text-[11px] text-gray-400 bg-[#333] px-1.5 py-0.2 rounded font-mono">
                  Code: {row.sName}
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="p-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2a2a2a] text-amber-300 border border-amber-500/20">
            {row.categoryName || "Unassigned"}
          </span>
        </td>
        <td className="p-4 font-bold text-[#f6b100] text-sm sm:text-base">
          Rs. {Number(row.price || 0).toLocaleString()}
        </td>
        <td className="p-4 text-gray-400 text-sm max-w-xs truncate">
          {row.description || <span className="text-gray-600 italic">No description</span>}
        </td>
        <td className="p-4">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onOpenEditModal("Product", row)}
              className="p-2 rounded-lg text-blue-400 bg-blue-500/10 hover:bg-blue-500/25 transition cursor-pointer"
              title="Edit Product"
            >
              <FaEdit className="text-sm" />
            </button>
            <button
              onClick={() => onRequestDelete("product", row._id, row.name)}
              className="p-2 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/25 transition cursor-pointer"
              title="Delete Product"
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
              Products & Menu Items
            </h2>
            <span className="bg-[#f6b100]/20 text-[#f6b100] border border-[#f6b100]/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {allProducts.length} Total Items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Manage food & drink prices, descriptions, and assign items to categories.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => onOpenAddModal("Product")}
            className="flex items-center gap-2 bg-[#f6b100] hover:bg-yellow-400 text-black font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-yellow-500/20 cursor-pointer shrink-0"
          >
            <FaPlus className="text-xs" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Selector Dropdown (Crucial for scaling to many categories!) */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 bg-[#242424] px-3 py-2 rounded-xl border border-[#383838] text-xs text-gray-300 w-full sm:w-auto">
            <FaFilter className="text-gray-400 text-xs shrink-0" />
            <span className="text-gray-400 font-medium shrink-0">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer w-full"
            >
              <option value="all" className="bg-[#242424] text-white">
                All Categories ({allProducts.length})
              </option>
              {categories.map((cat) => {
                const count = Array.isArray(cat.products) ? cat.products.length : 0;
                return (
                  <option
                    key={cat._id}
                    value={cat._id}
                    className="bg-[#242424] text-white"
                  >
                    {cat.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#242424] text-gray-300 border border-[#383838] text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="default">Sort by: Default</option>
            <option value="name-asc">Sort by: Name (A-Z)</option>
            <option value="price-asc">Sort by: Price (Low to High)</option>
            <option value="price-desc">Sort by: Price (High to Low)</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products, codes..."
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
          {filteredProducts.length > 0 ? (
            <Table
              headers={headers}
              data={filteredProducts}
              renderRow={renderRow}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
              <BiSolidDish className="text-4xl text-gray-600 mb-3" />
              <h3 className="text-base font-semibold text-gray-300">
                {searchTerm || selectedCategory !== "all"
                  ? "No matching products found"
                  : "No products added yet"}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search query or selecting a different category."
                  : "Start populating your menu by clicking the Add Product button."}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="mt-3 text-xs text-[#f6b100] hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductsView;

