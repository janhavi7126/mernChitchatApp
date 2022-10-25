import {
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUser, setSelectedUser] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState();
  const [loading, setloading] = useState(false);
  const toast = useToast();

  const { user, chats, setChats } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }
    try {
      setloading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setloading(false);
      console.log(data);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Ocurred",
        description: "Failed to load user",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUser) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      setloading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUser.map((u) => u._id)),
        },
        config
      );
      setloading(false);
      setChats([data,...chats]);
      onClose();
      toast({
        title: "Croup Created Successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      
    } catch (error) {
        toast({
            title: "Error Ocurred",
            description: "Failed to Create Group",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
          });
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUser(selectedUser.filter((sel) => sel._id !== delUser._id));
  };
  const handleGroup = (userAdd) => {
    if (selectedUser.includes(userAdd)) {
      toast({
        title: "User Already Added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUser([...selectedUser, userAdd]);
  };
  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            d="flex"
            justifyContent="center"
            fontSize="35px"
            fontFamily="Work sans"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                mb={3}
                placeholder="Chat Name"
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                mb={1}
                placeholder="Add Users eg: John ,Sam"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {selectedUser.map((u) => (
              <UserBadgeItem
                key={user._id}
                user={u}
                handleFunction={() => handleDelete(u)}
              />
            ))}

            {loading ? (
              <div
                fontFamily="Work sans"
                fontSize="28px"
                display="block"
                margin="auto"
              >
                loading...
              </div>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="green" onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
