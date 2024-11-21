import React, { Fragment, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";

import { MDBDataTable } from "mdbreact";

import MetaData from "../layout/MetaData";

import Loader from "../layout/Loader";

import Sidebar from "./Sidebar";

import { useDispatch, useSelector } from "react-redux";
import swal from "sweetalert";
import { allUsers, clearErrors, deleteUser } from "../../actions/userActions";

import { DELETE_USER_RESET } from "../../constants/userConstants";
import { Box, Button, useToast } from "@chakra-ui/react";

const UsersList = () => {
  const dispatch = useDispatch();

  let navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { loading, error, users } = useSelector((state) => state.allUsers);

  const { isDeleted } = useSelector((state) => state.user);
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
    dispatch(allUsers());

    if (error) {
      errMsg(error);

      dispatch(clearErrors());
    }

    if (isDeleted) {
      // successMsg("User deleted successfully");

      navigate("/admin/users");

      dispatch({ type: DELETE_USER_RESET });
    }
  }, [dispatch, alert, error, isDeleted, navigate]);

  const deleteUserHandler = (id) => {
    swal({
      title: "Are you sure you want to delete this user?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        swal("User has been deleted!", "", "success");
        dispatch(deleteUser(id));
      } else {
        swal("User is not deleted!", "", "info");
      }
    });
  };

  const setUsers = () => {
    const filter = users.filter((x) => x._id !== user._id);
    const data = {
      columns: [
        {
          label: "User ID",

          field: "id",

          sort: "asc",
        },

        {
          label: "Name",

          field: "name",

          sort: "asc",
        },

        {
          label: "Email",

          field: "email",

          sort: "asc",
        },

        {
          label: "Role",

          field: "role",

          sort: "asc",
        },

        {
          label: "Actions",

          field: "actions",
        },
      ],

      rows: [],
    };

    filter.forEach((user) => {
      data.rows.push({
        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        actions: (
          <Fragment>
            <Link
              to={`/admin/user/${user._id}`}
              className="btn btn-primary py-1 px-2">
              <i className="fa fa-pencil"></i>
            </Link>

            <button
              className="btn btn-danger py-1 px-2 ml-2"
              onClick={() => deleteUserHandler(user._id)}>
              <i className="fa fa-trash"></i>
            </button>

            {/* <button className="btn btn-danger py-1 px-2 ml-2">
                        <i className="fa fa-trash"></i>
                    </button>*/}
          </Fragment>
        ),
      });
    });

    return data;
  };

  return (
    <Fragment>
      <MetaData title={"All Users"} />

      <div className="row">
        <Box align="center" width={["95%", "90%", "80%", "85%"]} m="auto">
          <div className="col-12 col-md-10">
            <Fragment>
              <h1 className="my-5">All Users</h1>

              {loading ? (
                <Loader />
              ) : (
                <MDBDataTable
                  data={setUsers()}
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

export default UsersList;
