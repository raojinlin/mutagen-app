import React from "react";
import {Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Configuration from "./Configuration";
import {Button} from "../button";
import pick from 'lodash/pick';

export default function ConfigurationDialog({ configuration, open, onClose, title, onChange, properties }) {
  const [isOpen, setIsOpen] = React.useState(open);
  const [currentConfig, setCurrentConfig] = React.useState({...configuration});
  
  React.useEffect(() => {
    setCurrentConfig(configuration);
  }, [configuration]);
  
  const handleConfigurationChange = React.useCallback((cfg) => {
    setCurrentConfig(pick(cfg, properties));
  }, [properties]);
  
  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);
  
  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);
  
  const handleConfirm = React.useCallback(() => {
    if (onChange) {
      onChange(currentConfig);
    }
    
    handleClose();
  }, [onChange, currentConfig, handleClose]);
  
  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Configuration 
          configuration={currentConfig}
          onChange={handleConfigurationChange}
          properties={properties}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleConfirm}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}