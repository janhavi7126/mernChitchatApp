import React, { useState } from "react";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Box,
  Tooltip,
  Button,
  Text,
  useDisclosure,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  Drawer,
  DrawerBody,
  Input,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/avatar";
import { Search2Icon, BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../context/ChatProvider";
import ProfileModel from "./ProfileModel";
import { useHistory } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../config/chatlogic";
import NotificationBadge from 'react-notification-badge';

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState("");

  const { user, setSelectedChat, chats, setChats,notification,setNotification } = ChatState();
  const history = useHistory();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const LogoutUser = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const headers = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, headers);
      console.log(data);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);

     
          const headers={
              // "Content-type": "application/json",
              Authorization: `Bearer ${user.token}`
          };

    

      const url = "/api/chat";
     
      console.log(userId)
       const {data} = await axios.post(url,{userId:userId},{headers: headers})
      

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        bg="white"
        alignItems="center"
        width="100%"
        p="5px 10px 5px 10px"
        border-width="2px"
      >
        <Box>
          <Menu>
            <MenuList>
              <ProfileModel user={user} />
              <MenuItem>
                <ProfileModel user={user} />
                My Profile
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={LogoutUser}>Logout</MenuItem>
            </MenuList>

            <MenuButton
              as={Button}
              righIcon={<ChevronDownIcon />}
              bgColor={"white"}
              p={7}
            >
              <Avatar
                size="md"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
          </Menu>
          <Tooltip label="Search User for Chat" hasArrow placement="bottom-end">
            <Button variant="ghost" onClick={onOpen}>
              <Search2Icon />
              <Text display={{ sm: "none", base: "none", md: "flex" }} px="4">
                Search User
              </Text>
            </Button>
          </Tooltip>
        </Box>
        <Text fontSize="3xl" font-family="Work-sans" font-weight="bold">
          Chit-Chat
        </Text>
        <div>
        <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                // effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                   key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search User</DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={1} flexDir="row">
              <Input
                placeholder="Search By Name or Email"
                mr={1.5}
                maxW="77%"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
