import React, { Fragment, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";

import { MDBDataTable } from "mdbreact";

import MetaData from "../layout/MetaData";

import Loader from "../layout/Loader";

import Sidebar from "./Sidebar";

import swal from "sweetalert";
import { useDispatch, useSelector } from "react-redux";

import {
  allOrders,
  clearErrors,
  deleteOrder,
} from "../../actions/orderActions";
import { Box, Button, useToast } from "@chakra-ui/react";

import { DELETE_ORDER_RESET } from "../../constants/orderConstants";

const OrdersList = () => {
  const dispatch = useDispatch();

  let navigate = useNavigate();

  const { loading, error, orders } = useSelector((state) => state.allOrders);

  const { isDeleted } = useSelector((state) => state.order);

  const toast = useToast();
  const errMsg = (message = "") =>
    toast({
      title: message,
      status: "error",
      isClosable: true,
      position: "bottom-left",
    });

  const successMsg = (message = "") =>
    toast({
      title: message,
      status: "success",
      isClosable: true,
      position: "bottom-left",
    });
  useEffect(() => {
    dispatch(allOrders());

    if (error) {
      errMsg(error);

      dispatch(clearErrors());
    }

    if (isDeleted) {
      // successMsg("Order deleted successfully");

      navigate("/admin/orders");

      dispatch({ type: DELETE_ORDER_RESET });
    }
  }, [dispatch, error, navigate, isDeleted]);

  const deleteOrderHandler = (id) => {
    swal({
      title: "Are you sure you want to delete this order?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        swal("Order has been deleted!", "", "success");
        dispatch(deleteOrder(id));
      } else {
        swal("Order is not deleted!", "", "info");
      }
    });
  };

  const setOrders = () => {
    const data = {
      columns: [
        {
          label: "Order ID",

          field: "id",

          sort: "asc",
        },

        {
          label: "No of Items",

          field: "numofItems",

          sort: "asc",
        },

        {
          label: "Amount",

          field: "amount",

          sort: "asc",
        },

        {
          label: "Status",

          field: "status",

          sort: "asc",
        },

        {
          label: "Actions",

          field: "actions",
        },
      ],

      rows: [],
    };

    orders.forEach((order) => {
      data.rows.push({
        id: order._id,

        numofItems: order.orderItems.length,

        amount: `$${order.totalPrice}`,

        status:
          order.orderStatus &&
          String(order.orderStatus).includes("Delivered") ? (
            <p style={{ color: "green" }}>{order.orderStatus}</p>
          ) : (
            <p style={{ color: "red" }}>{order.orderStatus}</p>
          ),

        actions: (
          <Fragment>
            <Link
              to={`/admin/order/${order._id}`}
              className="btn btn-primary py-1 px-2">
              <i className="fa fa-eye"></i>
            </Link>

            <button
              className="btn btn-danger py-1 px-2 ml-2"
              onClick={() => deleteOrderHandler(order._id)}>
              <i className="fa fa-trash"></i>
            </button>
          </Fragment>
        ),
      });
    });

    return data;
  };

  return (
    <Fragment>
      <MetaData title={"All Orders"} />

      <div className="row">
        <Box align="center" width={["95%", "90%", "80%", "85%"]} m="auto">
          <div className="col-12 col-md-10">
            <Fragment>
              <h1 className="my-5">All Orders</h1>

              {loading ? (
                <Loader />
              ) : (
                <MDBDataTable
                  data={setOrders()}
                  className="px-3"
                  bordered
                  striped
                  hover
                />
              )}
            </Fragment>
          </div>
        </Box>
      </div>
    </Fragment>
  );
};

export default OrdersList;
