import {
  Dialog,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  DialogContent,
  FormControl,
  DialogTitle,
  Box,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  Input,
  FormGroup,
  Typography,
  FormControlLabel,
  Checkbox,
  CircularProgress, FormLabel,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from "react";
import PropTypes from "prop-types";


import Configuration from '../sync-configuration/Configuration';
import { Button } from "../button";
import { Prompt, Message } from '../prompt-dialog';
import Label from "../label";
import {colors} from "../label/Label";
import ConfigurationDialog from "../sync-configuration/Dialog";
import Help from "../help";
import Overview from "../sync-configuration/Overview";

const endpointSpecifyProperties = [
  'probeMode', 
  'scanMode',
  'stageMode',
  'watchMode', 
  'watchPollingInterval',
  'defaultFileMode',
  'defaultDirectoryMode', 
  'defaultOwner', 
  'defaultGroup'
];

/**
 * @typedef  {object} URL
 * @property {string} protocol
 * @property {string} path
 * @property {string} user
 * @property {number} port
 * @property {string} host
 * */

/** 
 * @param {URL} url
 * @param {string} id
 * @param {string|React.Component} label
 * @param {string|React.Component} children
 * @param {(function(URL))} onChange
 */
function URLField({ url, id, label, children, onChange }) {
  const [value, setValue] = React.useState(url);
  
  const handleFieldChange = (field, val) => {
    const newValue = {...value, [field]: val};
    setValue(newValue);
    onChange(newValue);
  };
  
  return (
    <FormGroup>
      <FormLabel>
        {label || children}
      </FormLabel>
      <Box 
        sx={{
          '&': {
            display: 'flex'
          },
          '& .MuiFormControl-root': {
            display: 'block',
            flex: 1,
          },
        }}
      >
        <FormControl sx={{ m: 1}} size="small">
          <InputLabel id="demo-select-small">协议</InputLabel>
          <Select
            labelId="demo-select-small"
            id="demo-select-small"
            value={value.protocol || 'local'}
            label="protocol"
            onChange={(e) => {
              setValue({...value, protocol: e.target.value});
            }}
          >
            <MenuItem value={'local'}>Local</MenuItem>
            <MenuItem value={'docker'}>Docker</MenuItem>
            <MenuItem value={'ssh'}>SSH</MenuItem>
          </Select>
        </FormControl>
        {value.protocol === "ssh" ? (
          <>
            <FormControl sx={{m: 1}} size='small'>
              <InputLabel>用户名</InputLabel>
              <Input
                type='text'
                value={value.user}
                onChange={e => handleFieldChange('user', e.target.value)}
                required
              />
            </FormControl>
            <FormControl sx={{m: 1}} size='small'>
              <InputLabel>主机</InputLabel>
              <Input 
                type='text'
                value={value.host}
                onChange={e => handleFieldChange('host', e.target.value)} 
                required
              />
            </FormControl>
            <FormControl sx={{m: 1}} size='small'>
              <InputLabel>端口</InputLabel>
              <Input
                type='number'
                value={value.port}
                onChange={e => handleFieldChange('port', parseInt(e.target.value, 10))}
                required
              />
            </FormControl>
          </>
        ) : null}
        <FormControl sx={{m: 1}} size='small' className={value.protocol}>
          <InputLabel>路径</InputLabel>
          <Input
            type='text'
            value={value.path}
            onChange={e => handleFieldChange('path', e.target.value)}
            required
          />
        </FormControl>
      </Box>
    </FormGroup>
  )
}


/**
 * 
 * @param open {boolean}
 * @param onClose {(function(boolean))}
 * @param client import('../services/mutagen')
 * @param onCreated {(function(string))}
 * @return {JSX.Element}
 * @constructor
 */
export default function NewSynchronizeSession({ open, onClose, client, onCreated }) {
  const [isOpen, setIsOpen] = React.useState(open);
  const [creation, setCreation] = React.useState({
    "name": "",
    "labels": {
      // "created_by": "mutagen-server",
      // "owner": "raojinlin",
    },
    "paused": false,
    "alpha": {
      // "path": "/tmp/mutagen_test"
    },
    "beta": {
      // "protocol": "ssh",
      // "user": "raojinlin",
      // "host":"192.168.31.111",
      // "port": 22,
      // "path": "/tmp/xxx_sync"
    }
  });
  
  const [newLabel, setNewLabel] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const [showMessageModal, setShowMessageModal] = React.useState(false);
  const [showPromptModal, setShowPromptModal] = React.useState(false);
  const [promptMessage, setPromptMessage] = React.useState('');
  const [showAlphaConfiguration, setShowAlphaConfiguration] = React.useState(false);
  const [showBetaConfiguration, setShowBetaConfiguration] = React.useState(false);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  const handleOpen = React.useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);
  
  const handleConfigChange = React.useCallback(configuration => {
    setCreation({...creation, configuration})
  }, [creation]);
  
  const handleAlphaConfigChange = React.useCallback(configurationAlpha => {
    setCreation({...creation, configurationAlpha});
  }, [creation]);

  const handleBetaConfigChange = React.useCallback(configurationBeta => {
    setCreation({...creation, configurationBeta});
  }, [creation]);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    if (onClose) {
      onClose(true);
    }
  }, [setIsOpen, onClose]);
  
  const handleConfirm = React.useCallback(() => {
    // if (x === 1) {
    //   setShowMessageModal(true);
    //   setPromptMessage('validate error');
    //   return;
    // }
    const handlemessage = (data) => {
      setShowPromptModal(false);
      setShowMessageModal(true);
      setPromptMessage(data.message);
    };
    client.dispatch
      .on('message', handlemessage)
      .on('error', data => {
        handlemessage(data);
        setCreating(false);
      });
    
    client.dispatch.on('prompt', (data) => {
      setShowPromptModal(true);
      setShowMessageModal(false);
      setPromptMessage(data.message);
    });
    
    client.dispatch.on('ack', (data) => {
      setShowMessageModal(false);
      setShowPromptModal(false);
      setPromptMessage('');
      
      if (data.data) {
        setCreating(false);
      }
    });
    
    setCreating(true);
    client.connect().then(() => {
      client.create({
        ...creation,
        // alphaConfiguration: creation.alphaConfiguration || creation.configuration,
        // betaConfiguration: creation.betaConfiguration || creation.configuration
      }).then(r => {
        console.log(r);
        if (r && r.data && onCreated) {
          onCreated(r && r.data);
        }
      });
    });
  }, [client, creation]);
  
  const handleLabelAdd = React.useCallback((e) => {
    if (!e.target.value) {
      return;
    }
    
    const [label, labelValue] = e.target.value.split(/=|:/);
    if (!label || !labelValue) {
      return;
    }
    
    setCreation({...creation, labels: {...creation.labels, [label]: labelValue}});
    setNewLabel('');
  }, [creation]);
  
  const handleLabelRemove = React.useCallback((label) => {
    const c = {...creation, labels: {...creation.labels}};
    delete c.labels[label];
    setCreation(c);
  }, [creation]);
  
  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      scroll={'paper'}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      <DialogTitle id="scroll-dialog-title">新建同步会话</DialogTitle>   
      <DialogContent dividers>
        <Prompt 
          title='提示' 
          message={promptMessage} 
          open={showPromptModal} 
          onClose={() => setShowPromptModal(false)} 
          onConfirm={value => {
            client.answer(value);
          }}
        />
        <Message
          title='消息'
          message={promptMessage}
          type='message'
          open={showMessageModal}
          onClose={() => setShowMessageModal(false)} 
        />
        <Box sx={{".row": {marginBottom: "10px", minWidth: 500}}}>
          <div className="row">
            <FormControl>
              <FormLabel>名称</FormLabel>
              <TextField
                id="sync-name"
                value={creation.name}
                onChange={e => setCreation({...creation, name: e.target.value})}
              />  
            </FormControl>
          </div>
          <div className="row">
            <URLField 
              url={creation.alpha}
              id={'sync-alpha'} 
              onChange={(url) => setCreation({...creation, alpha: url})}
            >
              源地址
            </URLField>
            <div>
              {creation.configurationAlpha && Object.keys(creation.configurationAlpha).length ?
                <Overview configuration={creation.configurationAlpha} /> : null
              }
              <Button onClick={() => setShowAlphaConfiguration(true)}>+ 添加配置</Button>
              <ConfigurationDialog
                properties={endpointSpecifyProperties}
                title='源端配置'
                open={showAlphaConfiguration} 
                onClose={() => setShowAlphaConfiguration(false)} 
                configuration={creation.configurationAlpha}
                onChange={handleAlphaConfigChange}
              />
            </div>
          </div>
          <div className="row">
            <URLField 
              url={creation.beta}
              id={'beta'}
              onChange={(url) => setCreation({...creation, beta: url})}
            >
              目标地址
            </URLField>
            <div>
              {creation.configurationBeta && Object.keys(creation.configurationBeta).length ? 
                <Overview configuration={creation.configurationBeta} /> : null
              }
              <Button onClick={() => setShowBetaConfiguration(true)}>+ 添加配置</Button>
              <ConfigurationDialog
                properties={endpointSpecifyProperties}
                title='目标端配置'
                open={showBetaConfiguration}
                onClose={() => setShowBetaConfiguration(false)}
                configuration={creation.configurationBeta}
                onChange={handleBetaConfigChange}
              />
            </div>
          </div>
          <div className="row">
            <FormControl>
              <FormLabel>标签</FormLabel>
              <TextField
                type="text"
                placeholder="新增label，格式：LABEL[=:]VALUE"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onBlur={handleLabelAdd}
                onKeyDown={e => e.keyCode === 13 && handleLabelAdd(e)}
              />
              <Box sx={{'&': {marginTop: '10px'}}}>
                {Object.keys(creation.labels).map((label, i) => (
                  <Label color={colors[i]} key={label}>
                    {label}: {creation.labels[label]}
                    <CloseIcon sx={{'&': {fontSize: 14}}} onClick={() => handleLabelRemove(label)} />
                  </Label>
                ))}
              </Box>
            </FormControl>
          </div>
          <div className={"row"}>
            <FormControl>
              <FormControlLabel 
                control={(
                  <Checkbox
                    name='paused'
                    checked={creation.paused}
                    onChange={e => setCreation({...creation, paused: e.target.checked})}
                  />
                )}
                label={(
                  <span>Paused<Help>Indicates whether or not to create the session pre-paused.</Help></span>
                )}
              />
            </FormControl>
          </div>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              更多配置
            </AccordionSummary>
            <AccordionDetails>
              <Configuration configuration={creation.configuration} onChange={handleConfigChange} />
            </AccordionDetails>
          </Accordion>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button onClick={handleConfirm} loading={creating}>
          创建
        </Button>
      </DialogActions>
    </Dialog>
  );
}

NewSynchronizeSession.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
}