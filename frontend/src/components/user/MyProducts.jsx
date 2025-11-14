import React, { useEffect } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";
import { MDBDataTable } from "mdbreact";
import { Link } from "react-router-dom";
import MetaData from "../layout/MetaData";
import { useGetMyProductsQuery } from "../../redux/api/productsApi";
import UserLayout from "../layout/UserLayout";

const MyProducts = () => {
  const { data, isLoading, error } = useGetMyProductsQuery();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || "Failed to load products");
    }
  }, [error]);

  const setProducts = () => {
    const products = {
      columns: [
        {
          label: "ID",
          field: "id",
          sort: "asc",
        },
        {
          label: "Name",
          field: "name",
          sort: "asc",
        },
        {
          label: "Stock",
          field: "stock",
          sort: "asc",
        },
        {
          label: "Actions",
          field: "actions",
          sort: "asc",
        },
      ],
      rows: [],
    };

    data?.products?.forEach((product) => {
      products.rows.push({
        id: product?._id,
        name: `${product?.name?.substring(0, 20)}...`,
        stock: product?.stock,
        actions: (
          <>
            <Link to={`/product/${product?._id}`} className="btn btn-outline-primary">
              <i className="fa fa-eye"></i>
            </Link>
          </>
        ),
      });
    });

    return products;
  };

  if (isLoading) return <Loader />;

  return (
    <UserLayout>
      <MetaData title={"My Products"} />

      <h1 className="my-5">{data?.products?.length || 0} My Products</h1>

      <MDBDataTable data={setProducts()} className="px-3" bordered striped hover />
    </UserLayout>
  );
};

export default MyProducts;
