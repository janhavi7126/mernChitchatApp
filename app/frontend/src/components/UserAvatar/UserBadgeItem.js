import { CloseIcon } from '@chakra-ui/icons'
import { Box } from '@chakra-ui/react'
import React from 'react'

const UserBadgeItem = ({user,handleFunction}) => {
  return (
    
    <Box
    p={1}
    m={1}
    cursor="pointer"
    variant="solid"
    bg="red.200"
    display="inline"
    fontSize={12}
    fontFamily="Work sans"
    borderRadius="md"
    onClick={handleFunction}>

        {user.name}
        <CloseIcon m={1} p={0.5}/>
    </Box>
      
    
  )
}

export default UserBadgeItem
