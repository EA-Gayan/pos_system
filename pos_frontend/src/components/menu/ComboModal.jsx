import React, { useState } from "react";
import { FaTimes, FaPlus, FaShoppingCart } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useSelector } from "react-redux";

const ComboModal = ({ isOpen, onClose, onCreateCombo }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [multiplier, setMultiplier] = useState("");
  const categories = useSelector((state) => state?.product?.productList);

  // Get selectedStatus from localStorage (same as MenuContainer)
  const selectedStatus = parseInt(localStorage.getItem("selectedStatus"), 10);

  // Filter categories based on selectedStatus
  const filteredCategories = categories?.filter(
    (category) => category.mealType?.includes(selectedStatus) || category.mealType?.includes(4)
  ) || [];

  // Flatten all products from filtered categories
  const allProducts = filteredCategories.flatMap(cat => cat.products || []);

  const addProductToCombo = (product) => {
    const existing = selectedProducts.find(p => p._id === product._id);
    if (!existing) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const removeProductFromCombo = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
  };

  const calculateTotalPrice = () => {
    const basePrice = selectedProducts.reduce((total, p) => total + p.price, 0);
    return basePrice * (multiplier || 0);
  };

  const calculateTotalItems = () => {
    return selectedProducts.length * (multiplier || 0);
  };

  const handleCreateCombo = () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product for the combo");
      return;
    }

    if (!multiplier || multiplier <= 0) {
      alert("Please enter a multiplier (minimum 1)");
      return;
    }

    // Create products array with multiplier applied
    const productsWithMultiplier = selectedProducts.map(p => ({
      ...p,
      quantity: multiplier
    }));

    // Create name by concatenating product names
    const productNames = selectedProducts.map(p => p.name).join(" + ");
    const comboName = `${productNames} × ${multiplier}`;

    const comboData = {
      name: comboName,
      products: productsWithMultiplier,
      totalPrice: calculateTotalPrice(),
      totalItems: calculateTotalItems()
    };

    onCreateCombo(comboData);
    
    // Reset form
    setSelectedProducts([]);
    setMultiplier("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden border border-[#333]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#f6b100] to-[#e0a100] p-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1a1a1a]">Create Combo Package</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1a1a1a]/20 hover:bg-[#1a1a1a]/30 flex items-center justify-center transition-all"
          >
            <FaTimes className="text-[#1a1a1a]" size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 overflow-y-auto max-h-[calc(80vh-240px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Available Products */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-[#f6b100]">Available Products</span>
                <span className="text-xs bg-[#2a2a2a] px-2 py-1 rounded-full text-gray-400">
                  {allProducts.length} items
                </span>
              </h3>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#3a3a3a] scrollbar-track-transparent">
                {allProducts.map(product => {
                  const isSelected = selectedProducts.find(p => p._id === product._id);
                  return (
                    <div
                      key={product._id}
                      onClick={() => addProductToCombo(product)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        isSelected 
                          ? "bg-[#f6b100]/10 border-[#f6b100] opacity-50 cursor-not-allowed" 
                          : "bg-[#2a2a2a] hover:bg-[#333] border-transparent hover:border-[#f6b100]/30"
                      } group`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-semibold transition-colors ${
                            isSelected ? "text-gray-500" : "text-white group-hover:text-[#f6b100]"
                          }`}>
                            {product.name}
                          </h4>
                          <p className="text-gray-500 text-sm">Rs. {product.price}</p>
                        </div>
                        {!isSelected && (
                          <FaPlus className="text-[#f6b100] opacity-50 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Products for Combo */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-[#f6b100]">Selected Products</span>
                <span className="text-xs bg-[#f6b100] px-2 py-1 rounded-full text-[#1a1a1a] font-bold">
                  {selectedProducts.length}
                </span>
              </h3>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#3a3a3a] scrollbar-track-transparent">
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No products selected</p>
                  </div>
                ) : (
                  selectedProducts.map(product => (
                    <div
                      key={product._id}
                      className="bg-[#2a2a2a] p-4 rounded-xl border border-[#333] hover:border-[#f6b100]/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold">{product.name}</h4>
                          <p className="text-gray-500 text-sm">Rs. {product.price}</p>
                        </div>
                        <button
                          onClick={() => removeProductFromCombo(product._id)}
                          className="text-red-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                        >
                          <MdClose size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Multiplier */}
        <div className="bg-[#2a2a2a] p-3 border-t border-[#333]">
          {/* Multiplier Input */}
          <div className="mb-2 bg-[#1a1a1a] p-2 rounded-lg border border-[#f6b100]/30">
            <input
              type="number"
              min="0"
              value={multiplier}
              onChange={(e) => {
                const val = e.target.value;
                setMultiplier(val === "" ? "" : Math.max(0, parseInt(val) || 0));
              }}
              onFocus={(e) => e.target.select()}
              className="w-full bg-[#2a2a2a] text-white text-center text-lg font-bold px-2 py-1.5 rounded-lg border border-[#333] focus:border-[#f6b100] outline-none transition-all"
              placeholder="0"
            />
          </div>


          {/* Calculation Display */}
          <div className="bg-[#1a1a1a] p-2 rounded-lg mb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Items</p>
                <p className="text-white font-bold text-base">{calculateTotalItems()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Price</p>
                <p className="text-[#f6b100] font-bold text-lg">Rs. {calculateTotalPrice()}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-[#1a1a1a] hover:bg-[#333] text-white font-semibold py-2 rounded-lg transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCombo}
              disabled={selectedProducts.length === 0 || !multiplier || multiplier <= 0}
              className="flex-1 bg-gradient-to-r from-[#f6b100] to-[#e0a100] hover:from-[#e0a100] hover:to-[#f6b100] text-[#1a1a1a] font-bold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              <FaShoppingCart size={14} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboModal;
