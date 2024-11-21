import React, { Fragment, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import Sidebar from "./Sidebar";

import { useDispatch, useSelector } from "react-redux";

import { getAdminProducts } from "../../actions/productActions";
import { allOrders } from "../../actions/orderActions";
import UserSalesChart from "./UserSalesChart";
import MonthlySalesChart from "./MonthlySalesChart";
import ProductSalesChart from "./ProductSalesChart";
import YearlySalesChart from "./YearlySalesChart";

import { allUsers, userSales } from "../../actions/userActions";
import { BsPerson, BsBag, BsFolder2, BsFillCartXFill } from "react-icons/bs";
import { MdAttachMoney } from "react-icons/md";
import {
  Box,
  Text,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { AiOutlineTeam, AiOutlineHome } from "react-icons/ai";
import {
  monthlySalesChart,
  productSalesChart,
  yearlySalesChart,
} from "../../actions/chartActions";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { users } = useSelector((state) => state.allUsers);
  const { orders, totalAmount, loading } = useSelector(
    (state) => state.allOrders
  );

  const { customerSales } = useSelector((state) => state.customerSales);
  const { salesPerMonth } = useSelector((state) => state.salesPerMonth);
  const { productSales } = useSelector((state) => state.productSales);
  const { salesPerYear } = useSelector((state) => state.salesPerYear);

  let outOfStock = 0;
  products.forEach((product) => {
    if (product.stock === 0) {
      outOfStock += 1;
    }
  });

  useEffect(() => {
    dispatch(getAdminProducts());
    dispatch(allOrders());
    dispatch(allUsers());
    dispatch(userSales());
    dispatch(monthlySalesChart());
    dispatch(productSalesChart());
    dispatch(yearlySalesChart());
  }, [dispatch]);
  let navigate = useNavigate();
  return (
    <Fragment>
      <div className="row">
        <Box align="center" width={["95%", "90%", "80%", "85%"]} m="auto">
          <div className="col-12 col-md-10">
            <h1 className="my-4">Dashboard</h1>

            {loading ? (
              <Loader />
            ) : (
              <Fragment>
                <MetaData title={"Admin Dashboard"} />

                <Box
                  maxW="7xl"
                  mx={"auto"}
                  pt={5}
                  px={{ base: 2, sm: 12, md: 17 }}>
                  <SimpleGrid
                    columns={{ base: 1, md: 1 }}
                    spacing={{ base: 5, lg: 8 }}>
                    <Stat
                      px={{ base: 2, md: 4 }}
                      py={"5"}
                      shadow={"xl"}
                      border={"1px solid"}
                      // borderColor={useColorModeValue("gray.800", "gray.500")}
                      rounded={"lg"}>
                      <Flex justifyContent={"space-between"}>
                        <Box pl={{ base: 2, md: 4 }}>
                          <StatLabel fontWeight={"medium"} isTruncated>
                            Total Amount
                          </StatLabel>
                          <StatNumber fontSize={"2xl"} fontWeight={"medium"}>
                            ${totalAmount && totalAmount.toFixed(2)}
                          </StatNumber>
                        </Box>
                        <Box
                          my={"auto"}
                          // bg={useColorModeValue("gray.800", "gray.200")}
                          alignContent={"center"}>
                          <MdAttachMoney size={"3em"} />
                        </Box>
                      </Flex>
                    </Stat>
                  </SimpleGrid>

                  <br />
                  <SimpleGrid
                    columns={{ base: 1, md: 4 }}
                    spacing={{ base: 5, lg: 8 }}>
                    <Stat
                      px={{ base: 2, md: 4 }}
                      py={"5"}
                      shadow={"xl"}
                      border={"1px solid"}
                      // borderColor={useColorModeValue("gray.800", "gray.500")}
                      rounded={"lg"}>
                      <Flex justifyContent={"space-between"}>
                        <Box pl={{ base: 2, md: 4 }}>
                          <StatLabel fontWeight={"medium"} isTruncated>
                            Products
                          </StatLabel>
                          <StatNumber fontSize={"2xl"} fontWeight={"medium"}>
                            {products && products.length}
                          </StatNumber>
                        </Box>
                        <Box
                          my={"auto"}
                          // bg={useColorModeValue("gray.800", "gray.200")}
                          alignContent={"center"}>
                          <BsFolder2 size={"3em"} />
                        </Box>
                      </Flex>
                      <Box textAlign="right" mt={3}>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          cursor="pointer"
                          onClick={() => navigate("/admin/products")}>
                          View Details
                        </Text>
                      </Box>
                    </Stat>

                    <Stat
                      px={{ base: 2, md: 4 }}
                      py={"5"}
                      shadow={"xl"}
                      border={"1px solid"}
                      // borderColor={useColorModeValue("gray.800", "gray.500")}
                      rounded={"lg"}>
                      <Flex justifyContent={"space-between"}>
                        <Box pl={{ base: 2, md: 4 }}>
                          <StatLabel fontWeight={"medium"} isTruncated>
                            Orders
                          </StatLabel>
                          <StatNumber fontSize={"2xl"} fontWeight={"medium"}>
                            {orders && orders.length}
                          </StatNumber>
                        </Box>
                        <Box
                          my={"auto"}
                          // bg={useColorModeValue("gray.800", "gray.200")}
                          alignContent={"center"}>
                          <BsBag size={"3em"} />
                        </Box>
                      </Flex>
                      <Box textAlign="right" mt={3}>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          cursor="pointer"
                          onClick={() => navigate("/admin/orders")}>
                          View Details
                        </Text>
                      </Box>
                    </Stat>

                    <Stat
                      px={{ base: 2, md: 4 }}
                      py={"5"}
                      shadow={"xl"}
                      border={"1px solid"}
                      // borderColor={useColorModeValue("gray.800", "gray.500")}
                      rounded={"lg"}>
                      <Flex justifyContent={"space-between"}>
                        <Box pl={{ base: 2, md: 4 }}>
                          <StatLabel fontWeight={"medium"} isTruncated>
                            Users
                          </StatLabel>
                          <StatNumber fontSize={"2xl"} fontWeight={"medium"}>
                            {users && users.length}
                          </StatNumber>
                        </Box>
                        <Box
                          my={"auto"}
                          // bg={useColorModeValue("gray.800", "gray.200")}
                          alignContent={"center"}>
                          <AiOutlineTeam size={"3em"} />
                        </Box>
                      </Flex>
                      <Box textAlign="right" mt={3}>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          cursor="pointer"
                          onClick={() => navigate("/admin/users")}>
                          View Details
                        </Text>
                      </Box>
                    </Stat>
                    <Stat
                      px={{ base: 2, md: 4 }}
                      py={"5"}
                      shadow={"xl"}
                      border={"1px solid"}
                      // borderColor={useColorModeValue("gray.800", "gray.500")}
                      rounded={"lg"}>
                      <Flex justifyContent={"space-between"}>
                        <Box pl={{ base: 2, md: 4 }}>
                          <StatLabel fontWeight={"medium"} isTruncated>
                            Out of Stock
                          </StatLabel>
                          <StatNumber fontSize={"2xl"} fontWeight={"medium"}>
                            {outOfStock}
                          </StatNumber>
                        </Box>
                        <Box
                          my={"auto"}
                          // bg={useColorModeValue("gray.800", "gray.200")}
                          alignContent={"center"}>
                          <BsFillCartXFill size={"3em"} />
                        </Box>
                      </Flex>
                    </Stat>
                  </SimpleGrid>
                </Box>
              </Fragment>
            )}
          </div>
        </Box>
      </div>

      <Box
        align="center"
        maxW="7xl"
        mx={"auto"}
        pt={5}
        px={{ base: 2, sm: 12, md: 17 }}>
        <Fragment>
          <h1>MONTHLY SALES</h1>
          <MonthlySalesChart data={salesPerMonth} />
        </Fragment>

        <Fragment>
          <h1>CUSTOMER SALES</h1>
          <UserSalesChart data={customerSales} />
        </Fragment>

        <Fragment>
          <h1>YEARLY SALES</h1>
          <YearlySalesChart data={salesPerYear} />
        </Fragment>

        <Fragment>
          <h1>PRODUCT SALES</h1>
          <ProductSalesChart data={productSales} />
        </Fragment>
      </Box>
    </Fragment>
  );
};

export default Dashboard;
