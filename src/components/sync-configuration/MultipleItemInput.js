import React from 'react';
import {Box, FormControl, FormHelperText, TextField, InputLabel, FormLabel} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import Label from "../label";
import { colors } from "../label/Label";


export default function MultipleItemInput({ label, value=[], placeholder, helperText, onChange }) {
  const [val, setValue] = React.useState(value);
  const [item, setItem] = React.useState('');
  
  const handleItemAdd = React.useCallback((e) => {
    const item = e.target.value;
    if (!item || !item.trim()) {
      return;
    }
    
    if (val.includes(item)) {
      return;
    }
    
    
    const newVal = [...val, item];
    setValue(newVal);
    if (onChange) {
      onChange(newVal);
    }
    
    setItem('');
  }, [val, onChange]);
  
  const handleItemRemove = React.useCallback((item) => {
    const newVal = [];
    val.forEach((it) => {
     if (it !== item) {
       newVal.push(it);
     } 
    });
    
    setValue(newVal);
  }, [val]);
  
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <TextField
        type="text"
        placeholder={placeholder}
        value={item}
        onChange={e => setItem(e.target.value)}
        onBlur={handleItemAdd}
        onKeyDown={e => e.keyCode === 13 && handleItemAdd(e)}
      />
      <FormHelperText>{helperText}</FormHelperText>
      <Box sx={{'&': {marginTop: '10px'}}}>
        {val.map((label, i) => (
          <Label color={colors[i]} key={label}>
            {label}
            <CloseIcon sx={{'&': {fontSize: 14}}} onClick={() => handleItemRemove(label)} />
          </Label>
        ))}
      </Box>
    </FormControl>
  );
}