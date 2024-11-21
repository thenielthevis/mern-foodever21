import React, { Fragment, useState, useEffect } from "react";

import { useNavigate, useParams } from "react-router-dom";

import MetaData from "../layout/MetaData";

import Sidebar from "./Sidebar";


import { useDispatch, useSelector } from "react-redux";
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Heading,
  Text,
  useColorModeValue,
  Editable,
  EditablePreview,
  EditableTextarea,
  Spinner,
  useToast,
  Avatar,
  InputLeftElement,
  Button,
} from "@chakra-ui/react";

import {
  updateUser,
  getUserDetails,
  clearErrors,
} from "../../actions/userActions";

import { UPDATE_USER_RESET } from "../../constants/userConstants";

const UpdateUser = () => {
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [role, setRole] = useState("");

  const dispatch = useDispatch();

  let navigate = useNavigate();

  const { error, isUpdated } = useSelector((state) => state.user);

  const { user } = useSelector((state) => state.userDetails);

  const { id } = useParams();
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
    // console.log(user && user._id !== userId);

    if (user && user._id !== id) {
      dispatch(getUserDetails(id));
    } else {
      setName(user.name);

      setEmail(user.email);

      setRole(user.role);
    }

    if (error) {
      errMsg(error);

      dispatch(clearErrors());
    }

    if (isUpdated) {
      successMsg("User updated successfully");

      navigate("/admin/users");

      dispatch({
        type: UPDATE_USER_RESET,
      });
    }
  }, [dispatch, error, navigate, isUpdated, id, user]);

  const submitHandler = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.set("name", name);

    formData.set("email", email);

    formData.set("role", role);

    dispatch(updateUser(user._id, formData));
  };

  return (
    <Fragment>
      <MetaData title={`Update User`} />

      <form className="shadow-lg" onSubmit={submitHandler}>
        <Flex
          minH={"100vh"}
          align={"center"}
          justify={"center"}
          bg={useColorModeValue("gray.50", "gray.800")}
        >
          <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
            <Stack align={"center"}></Stack>
            <Box
              rounded={"lg"}
              bg={useColorModeValue("white", "gray.700")}
              boxShadow={"lg"}
              p={8}
            >
              <Stack spacing={4}>
                <Heading
                  textTransform={"uppercase"}
                  fontSize={"2xl"}
                  textAlign={"center"}
                >
                  Update User
                  <hr />
                </Heading>

                <FormControl id="name_field" isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    type="name"
                    id="name_field"
                    className="form-control"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </FormControl>

                <FormControl id="email_field" isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    id="email_field"
                    className="form-control"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormControl>

                <FormControl id="color_field" isRequired>
                  <FormLabel>Role</FormLabel>
                  <InputGroup>
                    <select
                      id="role_field"
                      className="form-control"
                      name="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="user">user</option>

                      <option value="admin">admin</option>
                    </select>
                  </InputGroup>
                </FormControl>

                <Stack spacing={10}>
                  <Button
                    bg={"black"}
                    color={"whitesmoke"}
                    _hover={{
                      bg: "none",
                      color: "black",
                      border: "1px solid black",
                    }}
                    id="login_button"
                    type="submit"
                    className="btn btn-block py-3"
                  >
                    Update
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Flex>
      </form>
    </Fragment>
  );
};

export default UpdateUser;
