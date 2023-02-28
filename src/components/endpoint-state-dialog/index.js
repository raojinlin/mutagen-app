import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Box,
  List,
  ListItem,
  Button,
  Typography,
  Checkbox,
  Label,
  FormControl,
  FormControlLabel,
} from '@mui/material';
import humanSize from 'human-size';

/**
 * @typedef {Object} EndpointState
 * @property {bool} connected
 * @property {bool} scanned
 * @property {number} directories
 * @property {number} files
 * @property {number} symbolicLinks
 * @property {number} totalFileSize
 */


/**
 *
 * @param state {EndpointState}
 * @param className {string}
 * @param title {string}
 * @constructor
 */
function State({ state, className, title }) {
  return (
    <List className={className}>
      <Typography variant='h5'>{title}</Typography>
      <ListItem>已连接: {state.connected ? '是' : '否'}</ListItem>
      <ListItem>已扫描: {state.scanned ? '是' : '否'}</ListItem>
      <ListItem>目录数: {state.directories || '-'}</ListItem>
      <ListItem>文件数: {state.files || '-'}</ListItem>
      <ListItem>软连接数量: {state.symbolicLinks || '-'}</ListItem>
      <ListItem>总文件大小: {state.totalFileSize ? humanSize(state.totalFileSize, 2) : '-'}</ListItem>
    </List>
  );
}



/**
 *
 * @param alphaState {EndpointState}
 * @param betaState {EndpointState}
 * @param open {boolean}
 * @param onClose {(function())}
 * @param client {Client}
 * @constructor
 */

export default function EndpointStateDialog({ session: _session , open, onClose, client, seconds=5, sessionId }) {
  const [session, setSession] = React.useState(_session);
  const [isOpen, setIsOpen] = React.useState(open);
  const [intervalRefresh, setIntervalRefresh] = React.useState(false);
  const intervalId = React.useRef(0);

  const {alphaState, betaState} = session;

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    onClose();
    clearInterval(intervalId.current);
  }, [onClose]);

  const handleRefresh = React.useCallback((e) => {
    setIntervalRefresh(e.target.checked);

    if (e.target.checked) {
      intervalId.current = setInterval(() => {
        client.sendMessage('list', {id: session.session.identifier}).then(r => {
          setSession(r.data.sessionStates[0]);
        });
      }, seconds*1000);
    } else if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = 0;
    }
  }, [seconds, session]);

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle style={{lineHeight: '42px'}}>
        会话状态 {session.status ? <>({session.status})</> : null}
        <span>
          <FormControl style={{'float': 'right'}}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={intervalRefresh}
                  onChange={handleRefresh}
                />
              }
              label={<Typography>自动刷新(5s)</Typography>}
            />
          </FormControl>
        </span>
      </DialogTitle>
      <DialogContent sx={{'&': {width: '500px'}}}>
        <Box
          sx={{
            '&': {
              display: 'flex',
            },
            '& .alpha-state, & .beta-state': {
              width: '50%',
              flex: 1,
            },
            '& .MuiListItem-root': {
              pl: 0,
              pb: 0,
            }
          }}
        >
          <State state={alphaState} className='alpha-state' title='alpha状态' />
          <State state={betaState} className='beta-state' title='beta状态' />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>确认</Button>
      </DialogActions>
    </Dialog>
  );
}
