// import React, { useEffect, useState } from 'react'
// import axios from 'axios'
import { ChatState } from '../context/ChatProvider';
import SideDrawer from '../components/miscelleneous/SideDrawer';
import MyChats from '../components/MyChats';

import ChatBox from '../components/ChatBox';

import { Box } from '@chakra-ui/react';
import { useState } from 'react';
const Chat = () => {
    
  const {user} =  ChatState();
  const [fetchAgain,setFetchAgain] = useState(false)

  return (
    <div style ={{width:"100%"}}>
      {user && <SideDrawer/>}
      <Box 
      display="flex"
      justifyContent ="space-between"
      width="100%"
      height="91.5vh"
      p="10px"
      >
        {user && <MyChats fetchAgain={fetchAgain}/>}
        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
      </Box>
    </div>
  );
};

export default Chat;
