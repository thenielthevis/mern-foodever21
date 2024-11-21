import React, { Fragment, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";

import { MDBDataTable } from "mdbreact";

import MetaData from "../layout/MetaData";

import Loader from "../layout/Loader";

import Sidebar from "./Sidebar";

import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { Carousel } from "react-bootstrap";

import {
  getAdminProducts,
  clearErrors,
  deleteProduct,
} from "../../actions/productActions";
import swal from "sweetalert";
import { DELETE_PRODUCT_RESET } from "../../constants/productConstants";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  useMediaQuery,
  Badge,
  Stack,
} from "@chakra-ui/react";
const ProductsList = () => {
  const dispatch = useDispatch();

  const notify = (message = "") =>
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  let navigate = useNavigate();

  const { loading, error, products } = useSelector((state) => state.products);

  const { error: deleteError, isDeleted } = useSelector(
    (state) => state.product
  );

  useEffect(() => {
    dispatch(getAdminProducts());

    if (error) {
      notify(error);

      dispatch(clearErrors());
    }

    if (deleteError) {
      notify(deleteError);

      dispatch(clearErrors());
    }

    if (isDeleted) {
      navigate("/admin/products");

      dispatch({ type: DELETE_PRODUCT_RESET });
    }
  }, [dispatch, alert, error, deleteError, isDeleted, navigate]);

  const setProducts = () => {
    const data = {
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
          label: "Price",

          field: "price",

          sort: "asc",
        },

        {
          label: "Stock",

          field: "stock",

          sort: "asc",
        },

        {
          label: "Image",

          field: "image",

          sort: "asc",
        },

        {
          label: "Actions",

          field: "actions",
        },
      ],

      rows: [],
    };

    products.forEach((product) => {
      data.rows.push({
        id: product._id,

        name: product.name,

        price: `$${product.price}`,

        stock: product.stock,

        image: (
          <Fragment>
            <Carousel pause="hover">
              {product.images &&
                product.images.map((image) => (
                  <Carousel.Item key={image.public_id}>
                    <img
                      className="d-block w-100"
                      src={image.url}
                      alt={product.title}
                      img
                      style={{ width: 200, height: 200 }}
                    />
                  </Carousel.Item>
                ))}
            </Carousel>
          </Fragment>
        ),

        actions: (
          <Fragment>
            <Link
              to={`/admin/product/${product._id}`}
              className="btn btn-primary py-1 px-2">
              <i className="fa fa-pencil"></i>
            </Link>

            <button
              className="btn btn-danger py-1 px-2 ml-2"
              onClick={() => deleteProductHandler(product._id)}>
              <i className="fa fa-trash"></i>
            </button>
          </Fragment>
        ),
      });
    });

    return data;
  };

  const deleteProductHandler = (id) => {
    swal({
      title: "Are you sure you want to delete this product?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        swal("Product has been deleted!", "", "success");
        dispatch(deleteProduct(id));
      } else {
        swal("Product is not deleted!", "", "info");
      }
    });
  };

  const linkStyle = {
    margin: "4rem",
    textDecoration: "none",
    color: "red",
    border: "solid",
  };

  return (
    <Fragment>
      <MetaData title={"All Products"} />

      <div className="row">
        {/* <div className="col-12 col-md-2">
          <Sidebar />
        </div> */}

        <Box align="center" width={["95%", "90%", "80%", "85%"]} m="auto">
          <Button
            bg={"black"}
            color={"whitesmoke"}
            border={"1px solid beige"}
            _hover={{
              bg: "none",
              color: "teal",
            }}
            onClick={() => navigate("/admin/product")}
            float={"right"}>
            Create New Product
          </Button>
          <Fragment>
            <h1 className="my-5">All Products</h1>

            {loading ? (
              <Loader />
            ) : (
              <MDBDataTable
                data={setProducts()}
                className="px-3"
                bordered
                striped
                hover
              />
            )}
          </Fragment>
        </Box>
      </div>
    </Fragment>
  );
};

export default ProductsList;
