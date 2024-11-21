import React, { Fragment, useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import MetaData from "../layout/MetaData";

import Sidebar from "./Sidebar";

import { useDispatch, useSelector } from "react-redux";

import { newProduct, clearErrors } from "../../actions/productActions";

import { NEW_PRODUCT_RESET } from "../../constants/productConstants";
import "./ReactError.css";
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
  Button,
  EditableTextarea,
  Spinner,
  useToast,
  Avatar,
  InputLeftElement,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
const NewProduct = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [stock, setStock] = useState(0);
  const [seller, setSeller] = useState("");
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const toast = useToast();
  const colors = ["Reds", "Blues", "Greens", "Pinks", "Purples"];

  const sizes = ["14oz", "18oz", "22oz", "32oz", "40oz", "64oz"];

  const dispatch = useDispatch();

  let navigate = useNavigate();

  const { loading, error, success } = useSelector((state) => state.newProduct);

  // const message = (message = "") =>
  //   toast.success(message, {
  //     position: toast.POSITION.BOTTOM_CENTER,
  //   });

  useEffect(() => {
    if (error) {
      dispatch(clearErrors());
    }

    if (success) {
      navigate("/admin/products");

      toast({
        title: "Product created successfully",
        status: "success",
        isClosable: true,
        position: "bottom-left",
      });

      dispatch({ type: NEW_PRODUCT_RESET });
    }
  }, [dispatch, error, success, navigate]);

  const submitHandler = (e) => {
    // e.preventDefault();

    const formData = new FormData();

    formData.set("name", name);

    formData.set("price", price);

    formData.set("description", description);

    formData.set("size", size);

    formData.set("color", color);

    formData.set("stock", stock);

    formData.set("seller", seller);

    images.forEach((image) => {
      formData.append("images", image);
    });

    dispatch(newProduct(formData));
  };

  const onChange = (e) => {
    const files = Array.from(e.target.files);

    setImagesPreview([]);

    setImages([]);

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagesPreview((oldArray) => [...oldArray, reader.result]);

          setImages((oldArray) => [...oldArray, reader.result]);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <Fragment>
      <MetaData title={"New Product"} />

      {/* <div className="col-12 col-md-2">
        <Sidebar />
      </div> */}

      <form
        className="shadow-lg"
        onSubmit={handleSubmit(submitHandler)}
        encType="multipart/form-data">
        <Flex
          minH={"100vh"}
          align={"center"}
          justify={"center"}
          bg={useColorModeValue("gray.50", "gray.800")}>
          <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
            <Stack align={"center"}></Stack>
            <Box
              rounded={"lg"}
              bg={useColorModeValue("white", "gray.700")}
              boxShadow={"lg"}
              p={8}>
              <Stack spacing={4}>
                <Heading
                  textTransform={"uppercase"}
                  fontSize={"2xl"}
                  textAlign={"center"}>
                  Create New Product
                  <hr />
                </Heading>

                <FormControl id="Name">
                  <FormLabel>Name</FormLabel>
                  <Input
                    type="text"
                    id="name_field"
                    className="form-control"
                    name="name"
                    {...register("name", { required: true })}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && <div className="error">Name is required</div>}
                </FormControl>

                <FormControl id="price_field">
                  <FormLabel>Price</FormLabel>
                  <Input
                    type="text"
                    id="price_field"
                    className="form-control"
                    value={price}
                    name="price"
                    {...register("price", {
                      required: "Price is required",
                      pattern: {
                        value: /^[0-9]+$/i,
                        message: "Price should be a number",
                      },
                    })}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  {errors.price && (
                    <div className="error">
                      {errors.price.type === "required" && (
                        <span>{errors.price.message}</span>
                      )}
                      {errors.price.type === "pattern" && (
                        <span>{errors.price.message}</span>
                      )}
                    </div>
                  )}
                </FormControl>

                <FormControl id="description_field">
                  <FormLabel>Description</FormLabel>
                  <Input
                    className="form-control"
                    id="description_field"
                    rows="4"
                    value={description}
                    name="description"
                    {...register("description", { required: true })}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  {errors.name && (
                    <div className="error">Description is required</div>
                  )}
                </FormControl>

                <FormControl id="color_field">
                  <FormLabel>Select Color:</FormLabel>
                  <InputGroup>
                    <select
                      className="form-control"
                      id="color_field"
                      value={color}
                      name="color"
                      {...register("color", { required: true })}
                      onChange={(e) => setColor(e.target.value)}>
                      <option disabled value="">
                        Select Color
                      </option>
                      {colors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </InputGroup>
                  {errors.name && (
                    <div className="error">Color is required</div>
                  )}
                </FormControl>

                <FormControl id="size_field">
                  <FormLabel>Select Size:</FormLabel>
                  <InputGroup>
                    <select
                      className="form-control"
                      id="size_field"
                      value={size}
                      name="size"
                      {...register("size", { required: true })}
                      onChange={(e) => setSize(e.target.value)}>
                      <option disabled value="">
                        Select Size
                      </option>
                      {sizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </InputGroup>
                  {errors.name && <div className="error">Size is required</div>}
                </FormControl>

                <FormControl id="stock_field">
                  <FormLabel>Stock</FormLabel>
                  <Input
                    type="number"
                    id="stock_field"
                    className="form-control"
                    value={stock}
                    name="stock"
                    {...register("stock", { required: true })}
                    onChange={(e) => setStock(e.target.value)}
                  />
                  {errors.name && (
                    <div className="error">Stock is required</div>
                  )}
                </FormControl>

                <FormControl id="seller_field">
                  <FormLabel>Seller Name</FormLabel>
                  <Input
                    type="text"
                    id="seller_field"
                    className="form-control"
                    value={seller}
                    name="seller"
                    {...register("seller", { required: true })}
                    onChange={(e) => setSeller(e.target.value)}
                  />
                  {errors.name && (
                    <div className="error">Seller is required</div>
                  )}
                </FormControl>

                <FormControl id="avatar">
                  <FormLabel>Images</FormLabel>
                  <InputGroup>
                    <Input
                      type="file"
                      name="images"
                      id="customFile"
                      {...register("images", { required: true })}
                      onChange={onChange}
                      multiple
                    />
                  </InputGroup>
                  {imagesPreview.map((img) => (
                    <img
                      src={img}
                      key={img}
                      alt="Images Preview"
                      className="mt-3 mr-2"
                      width="55"
                      height="52"
                    />
                  ))}
                  {errors.name && (
                    <div className="error">Image is required</div>
                  )}
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
                    disabled={loading ? true : false}>
                    {loading ? <Spinner /> : "Create"}
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

export default NewProduct;
