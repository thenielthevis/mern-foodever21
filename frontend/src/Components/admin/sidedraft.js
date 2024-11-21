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
  Text,
} from "@chakra-ui/react";
import { AiOutlineTeam, AiOutlineHome } from "react-icons/ai";
import { HamburgerIcon } from "@chakra-ui/icons";
import { RiFlashlightFill } from "react-icons/ri";
import { BsFolder2, BsCalendarCheck } from "react-icons/bs";

import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SideBar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const { colorMode } = useColorMode();
  let navigate = useNavigate();

  const NavItem = (props: any) => {
    const color = useColorModeValue("gray.600", "gray.300");

    const { icon, children } = props;
    return (
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
      >
        {icon && (
          <Icon
            mx="2"
            boxSize="4"
            _groupHover={{
              color: color,
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    );
  };
  return (
    <Box w="full">
      <Flex px="4" py="5" align="center">
        <Text
          fontSize="2xl"
          ml="2"
          color={useColorModeValue("brand.500", "white")}
          fontWeight="semibold"
        >
          POS
        </Text>
      </Flex>
      <Flex
        direction="column"
        as="nav"
        fontSize="md"
        color="gray.600"
        aria-label="Main Navigation"
      >
        <NavItem icon={AiOutlineHome}>Dashboard</NavItem>
        <NavItem icon={AiOutlineTeam}>Team</NavItem>
        <NavItem icon={BsFolder2}>Projects</NavItem>
        <NavItem icon={BsCalendarCheck}>Calendar</NavItem>
      </Flex>
    </Box>
  );
}
