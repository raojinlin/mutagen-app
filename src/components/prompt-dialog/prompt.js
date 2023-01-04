import React from 'react';
import {Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography} from "@mui/material";
import { Button } from "../button";


export default function Prompt({ title, message, onConfirm, open: isOpen, onClose, type='prompt', required=true, mask=true }) {
  const [open, setOpen] = React.useState(isOpen);
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState('');
  
  React.useEffect(() => {
    setOpen(isOpen);
    if (!isOpen) {
      setValue('');
    }
  }, [isOpen]);
  
  const handleConfirm = React.useCallback(() => {
    if (type === 'prompt' && required && (!value || !value.trim())) {
      setError("请填写内容.");
      return;
    }
    
    setError('');
    if (onConfirm) {
      onConfirm(value);
    }
    
    handleClose();
  }, [value, onConfirm, required]);
  
  const handleClose = React.useCallback(() => {
    setOpen(false);
    onClose();
  }, [onClose]);
  
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent style={{minWidth: '500px'}}>
        {error ? <Alert security='error'>{error}</Alert> : null}
        <Typography variant='body2' style={{marginBottom: '10px'}}>{message}</Typography>
        {type === 'prompt' ? (
          <TextField
            required={required} 
            style={{width: 500}}
            size='large' 
            type={mask ? 'password' : 'text'} 
            label={message}
            autoFocus 
            value={value}
            onChange={e => setValue(e.target.value)} 
          />
        ) : null}
      </DialogContent>
      <DialogActions>
        {type === 'prompt' ? <Button onClick={handleClose}>取消</Button> : null}
        <Button onClick={handleConfirm}>确认</Button>
      </DialogActions>
    </Dialog>
  );
}