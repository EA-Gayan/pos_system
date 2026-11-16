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
        className="border-b border-line-strong hover:bg-elevated transition-colors duration-150"
      >
        <td className="p-4 font-semibold text-fg">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-muted text-accent">
              <BiSolidDish className="text-base" />
            </span>
            <div>
              <div className="font-semibold text-sm sm:text-base text-fg">
                {row.name}
              </div>
              {row.sName && (
                <span className="text-[11px] text-fg-dim bg-strong px-1.5 py-0.2 rounded font-mono">
                  Code: {row.sName}
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="p-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-amber-300 border border-amber-500/20">
            {row.categoryName || "Unassigned"}
          </span>
        </td>
        <td className="p-4 font-bold text-accent text-sm sm:text-base">
          Rs. {Number(row.price || 0).toLocaleString()}
        </td>
        <td className="p-4 text-fg-dim text-sm max-w-xs truncate">
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
      <div className="bg-surface border border-line rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-fg tracking-wide">
              Products & Menu Items
            </h2>
            <span className="bg-[#f6b100]/20 text-accent border border-[#f6b100]/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {allProducts.length} Total Items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-fg-dim mt-0.5">
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
      <div className="bg-app border border-line rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Selector Dropdown (Crucial for scaling to many categories!) */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 bg-elevated px-3 py-2 rounded-xl border border-line-strong text-xs text-fg-soft w-full sm:w-auto">
            <FaFilter className="text-fg-dim text-xs shrink-0" />
            <span className="text-fg-dim font-medium shrink-0">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-fg font-semibold text-xs focus:outline-none cursor-pointer w-full"
            >
              <option value="all" className="bg-elevated text-fg">
                All Categories ({allProducts.length})
              </option>
              {categories.map((cat) => {
                const count = Array.isArray(cat.products) ? cat.products.length : 0;
                return (
                  <option
                    key={cat._id}
                    value={cat._id}
                    className="bg-elevated text-fg"
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
            className="bg-elevated text-fg-soft border border-line-strong text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
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
            className="w-full bg-elevated text-fg text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-line-strong focus:border-[#f6b100] focus:outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-fg-dim hover:text-fg cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 bg-app border border-line rounded-2xl overflow-hidden flex flex-col min-h-0">
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
              <h3 className="text-base font-semibold text-fg-soft">
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
                  className="mt-3 text-xs text-accent hover:underline cursor-pointer"
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

