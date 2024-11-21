import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button,
  Icon,
  Box,
  Stack,
  Flex,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { AiOutlineTeam, AiOutlineHome } from "react-icons/ai";
import { BsFolder2, BsCalendarCheck, BsBag } from "react-icons/bs";
import { HamburgerIcon } from "@chakra-ui/icons";

import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SideBar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const { colorMode } = useColorMode();
  let navigate = useNavigate();
  const color = useColorModeValue("gray.600", "gray.300");

  return (
    <>
      <Flex
        alignItems={"center"}
        alignContent={"center"}
        justifyContent={"center"}
      >
        <Button ref={btnRef} onClick={onOpen}>
          {/* <text>View More </text> */}
          <Icon
            as={HamburgerIcon}
            color={colorMode === "dark" ? "white" : "black"}
          />
        </Button>
      </Flex>
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>DASHBOARD</DrawerHeader>

          <DrawerBody mt={"1rem"}>
            <Stack spacing={"8"}>
              <Flex
                direction="column"
                as="nav"
                fontSize="md"
                color="gray.600"
                aria-label="Main Navigation"
              >
                <Flex
                  align="center"
                  px="4"
                  py="3"
                  cursor="pointer"
                  role="group"
                  fontWeight="semibold"
                  transition=".15s ease"
                  color={useColorModeValue("inherit", "gray.400")}
                  _hover={{
                    bg: useColorModeValue("gray.100", "gray.900"),
                    color: useColorModeValue("gray.900", "gray.200"),
                  }}
                  onClick={() => {
                    navigate("/dashboard");
                    onClose();
                  }}
                >
                  <Icon
                    mx="2"
                    boxSize="4"
                    _groupHover={{
                      color: color,
                    }}
                    as={AiOutlineHome}
                  />
                  Dashboard
                </Flex>
                <Flex
                  align="center"
                  px="4"
                  py="3"
                  cursor="pointer"
                  role="group"
                  fontWeight="semibold"
                  transition=".15s ease"
                  color={useColorModeValue("inherit", "gray.400")}
                  _hover={{
                    bg: useColorModeValue("gray.100", "gray.900"),
                    color: useColorModeValue("gray.900", "gray.200"),
                  }}
                  onClick={() => {
                    navigate("/admin/products");
                    onClose();
                  }}
                >
                  <Icon
                    mx="2"
                    boxSize="4"
                    _groupHover={{
                      color: color,
                    }}
                    as={BsFolder2}
                  />
                  Products
                </Flex>

                <Flex
                  align="center"
                  px="4"
                  py="3"
                  cursor="pointer"
                  role="group"
                  fontWeight="semibold"
                  transition=".15s ease"
                  color={useColorModeValue("inherit", "gray.400")}
                  _hover={{
                    bg: useColorModeValue("gray.100", "gray.900"),
                    color: useColorModeValue("gray.900", "gray.200"),
                  }}
                  onClick={() => {
                    navigate("/admin/users");
                    onClose();
                  }}
                >
                  <Icon
                    mx="2"
                    boxSize="4"
                    _groupHover={{
                      color: color,
                    }}
                    as={AiOutlineTeam}
                  />
                  Users
                </Flex>

                <Flex
                  align="center"
                  px="4"
                  py="3"
                  cursor="pointer"
                  role="group"
                  fontWeight="semibold"
                  transition=".15s ease"
                  color={useColorModeValue("inherit", "gray.400")}
                  _hover={{
                    bg: useColorModeValue("gray.100", "gray.900"),
                    color: useColorModeValue("gray.900", "gray.200"),
                  }}
                  onClick={() => {
                    navigate("/admin/orders");
                    onClose();
                  }}
                >
                  <Icon
                    mx="2"
                    boxSize="4"
                    _groupHover={{
                      color: color,
                    }}
                    as={BsBag}
                  />
                  Orders
                </Flex>
              </Flex>
            </Stack>
          </DrawerBody>
          {/* <DrawerBody mt={"1rem"}>
            <Stack spacing={"8"}>
              <Box>
                <Link to="/admin/product">Create Product</Link>
              </Box>
              <Box>
                <Link to="/men">Men's</Link>
              </Box>
              <Box>
                <Link to="/women">Women's</Link>
              </Box>
              <Box>
                <Link to="/shoes">Shoes</Link>
              </Box>
            </Stack>
          </DrawerBody> */}

          {/* <DrawerFooter>
          </DrawerFooter> */}
        </DrawerContent>
      </Drawer>
    </>
  );
}
