import React, { useEffect, useMemo, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { getBestSellingProducts } from "../../https";
import Table from "../shared/Table";
import BackButton from "../shared/BackButton";

const BestSelling = ({ products }) => {
  const [fetchedProducts, setFetchedProducts] = useState(products ?? []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If parent passes data, prefer it; otherwise fetch for standalone route.
    if (products && products.length > 0) {
      setFetchedProducts(products);
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const resToday = await getBestSellingProducts("today");
        let rows = resToday?.data?.data ?? [];

        if (isMounted) setFetchedProducts(rows);
      } catch (error) {
        console.error("Best selling fetch error:", error);
        enqueueSnackbar("Failed to fetch best selling products", {
          variant: "error",
        });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [products]);

  const rows =
    products && products.length > 0 ? products : fetchedProducts ?? [];

  const columns = useMemo(
    () => ["Product Name", "Price", "Quantity Sold", "Income"],
    []
  );

  const renderRow = (row, index) => (
    <tr key={`${row.productName}-${index}`}>
      <td className="p-3">{row.productName}</td>
      <td className="p-3">
        {row.productPrice != null ? `Rs ${row.productPrice}` : "-"}
      </td>
      <td className="p-3">{row.sellingQty}</td>
      <td className="p-3">{row.income != null ? `Rs ${row.income}` : "-"}</td>
    </tr>
  );

  return (
    <div className="flex flex-col h-full bg-[#262626]">
      <div className="flex-none px-4 sm:px-10 py-4 flex items-center justify-between">
        <BackButton />
      </div>

      <div className="flex-1 px-4 sm:px-10 pb-4 overflow-y-hidden">
        <Table headers={columns} data={rows} renderRow={renderRow} />
      </div>
    </div>
  );
};

export default BestSelling;
