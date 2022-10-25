import { ArrowBackIcon } from '@chakra-ui/icons'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react'

import React, { useEffect, useState } from 'react'
import { getSender ,getSenderAll} from '../config/chatlogic'
import { ChatState } from '../context/ChatProvider'
import ProfileModel from './miscelleneous/ProfileModel'
import UpdateGroupChatModal from './miscelleneous/UpdateGroupChatModal'
import image from '../background2.jpg'
import axios from 'axios'
import io from 'socket.io-client'
import ScrollableChat from './ScrollableChat'
import Lottie from 'react-lottie'
import animationData from "../Animations/typing.json"


const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};


const ENDPOINT ="https://chit--chat-app.herokuapp.com/" 
var socket,selectedChatCompare; 


const SingleChat = ({fetchAgain,setFetchAgain}) => {
    const [messages,setMessages]=useState([])
    const [loading,setLoading]=useState(false)
    const [newMessage,setNewMessages]=useState([])
    const {user,selectedChat,setSelectedChat,notification,
      setNotification} = ChatState()
    const [socketConnected,setSocketConnected] = useState(false);
    const [typing,setTyping]= useState(false);
    const [isTyping,setIsTyping]=useState(false);
    const toast = useToast();


    const fetchMessages = async () => {
      if (!selectedChat) return;
  
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
  
        setLoading(true);
  
        const { data } = await axios.get(
          `/api/messages/${selectedChat._id}`,
          config
        );

        // console.log(data)
        setMessages(data);
        setLoading(false);
        
        socket.emit("join chat",selectedChat._id);
        
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the Messages",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    };

  
  

    const sendMessage = async(event)=>{
      if(event.key ==="Enter" && newMessage){
        socket.emit("stop typing",selectedChat._id);
        try {
          const config = {
            headers: {
              // "Content-type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          };
          setNewMessages("");
          const { data } = await axios.post(
            "/api/messages",
            {
              content: newMessage,
              chatId: selectedChat,
            },
            config
          );

          socket.emit("new message",data)
          setMessages([...messages, data]);
         
          
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to send the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
      }

    };

    useEffect(() => {
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));
  
      // eslint-disable-next-line
    }, []);
  
    useEffect(() => {
      fetchMessages();
  
      selectedChatCompare = selectedChat;
      // eslint-disable-next-line
    }, [selectedChat]);
  
    useEffect(() => {
      socket.on("message recieved", (newMessageRecieved) => {
        if (
          !selectedChatCompare || // if chat is not selected or doesn't match current chat
          selectedChatCompare._id !== newMessageRecieved.chat._id
        ) {
          if (!notification.includes(newMessageRecieved)) {
            setNotification([newMessageRecieved, ...notification]);
            setFetchAgain(!fetchAgain);
          }
        } else {
          setMessages([...messages, newMessageRecieved]);
        }
      });
    });
  
    const typingHandler = (e) => {
      setNewMessages(e.target.value);
  
      if (!socketConnected) return;
  
      if (!typing) {
        setTyping(true);
        socket.emit("typing", selectedChat._id);
      }
      let lastTypingTime = new Date().getTime();
      var timerLength = 3000;
      setTimeout(() => {
        var timeNow = new Date().getTime();
        var timeDiff = timeNow - lastTypingTime;
        if (timeDiff >= timerLength && typing) {
          socket.emit("stop typing", selectedChat._id);
          setTyping(false);
        }
      }, timerLength);
    };
  
  return ( <>
    {selectedChat?
        (
            <>
        <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" ,md:"space-between"}}
            alignItems="center"
          >
            <IconButton
            display={{sm:"flex",base:"flex", md:"none"}}
            icon={<ArrowBackIcon/>}
            onClick={()=>setSelectedChat()}>
            </IconButton>
            
            {!selectedChat.isGroupChat?(
                <>
                {getSender(user,selectedChat.users)}
                <ProfileModel user= {getSenderAll(user,selectedChat.users)}/>
                </>
            ):(
                <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages}/>
                </>
            )}
          

          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            backgroundImage={image}
            
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ?(
                <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"/>
            ):(
                <div className='messages'>
                  <ScrollableChat messages={messages} overflowY='scroll' />
            
                </div>
            )}

            <FormControl 
             onKeyDown={sendMessage} isRequired mt={3}  borderRadius="lg">
                {isTyping ? (<div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>) :(<></>)}
                <Input
                bg="#ffffff"
                bgColor="white"
                _hover=
                  "white"
                placeholder="Enter a message"
                onChange={typingHandler}
                value={newMessage}>

                </Input>
                {/* <Button mx={5} mt={2} onClick={sendMessage}>
                <i w={20} className="fas fa-paper-plane"></i>
                </Button> */}
            </FormControl>

          </Box>
            </>

        ):(
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
         </Box>

        )}
    
        </>
  )
}

export default SingleChat