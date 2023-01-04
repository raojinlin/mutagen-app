import {Box, Tooltip} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import React from "react";

export default function Help({ children }) {
  return (
    <Tooltip 
      title={(
        <Box 
          sx={{
            'ul li': {
              listStyle: 'none'
            }
          }}
        >
          {children}
        </Box>
      )}
      arrow
    >
      <HelpOutlineIcon fontSize='small' style={{marginLeft: '3px', top: '4px', position: 'relative'}} />
    </Tooltip>
  )
}