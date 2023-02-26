import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import React, {useState, useEffect, useCallback} from 'react';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Tooltip,
} from '@mui/material';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
// import SESSIONS from '../_mock/user';
import Client from '../services/mutagen';
import NewSynchronizeSession from '../components/new-synchronize-session-dialog';
import { Button } from '../components/button'
import {Message} from "../components/prompt-dialog";
import EndpointStateDialog from "../components/endpoint-state-dialog";

const client = new Client('ws://127.0.0.1:8081/synchronization');

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: '名称', alignRight: false },
  { id: 'alpha', label: '源地址', alignRight: false },
  { id: 'beta', label: '目标地址', alignRight: false },
  { id: 'labels', label: '标签', alignRight: false },
  { id: 'status', label: '状态', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (session) => session.session.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function SyncPage() {
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState([]);

  const [currentSession, setCurrentSession] = useState(null);
  const [deleteSession, setDeleteSession] = useState({});
  const [error, setError] = useState({show: false, error: ''});
  
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const handleSelectedSessionDelete = () => {
    if (!selected.length) {
      return;
    }

    Promise.all(selected.map(id => {
      return client.terminate({id}).then(() => {

      });
    })).then(() => {
      setSelected([]);
      refreshSessions();
    })
  };

  const handleSessionDelete = () => {
    const id = currentSession.session.identifier;
    setDeleteSession({...deleteSession, [id]: true});
    client.terminate({id}).then(() => {
      setDeleteSession({...deleteSession, [id]: false});
      refreshSessions();
    });
  };
  
  const handleSessionInfo = React.useCallback(() => {
    setShowInfoDialog(true);
    handleCloseMenu();
  }, []);
  
  const handleSessionInfoDialogClose = useCallback(() => {
    setCurrentSession(null);
    setShowInfoDialog(false);
  }, []);

  const handleOpenMenu = (event, session) => {
    setOpen(event.currentTarget);
    setCurrentSession(session);
  };

  const refreshSessions = () => {
    client.connect().then(async () => {
      setLoading(true);
      const resp = await client.sendMessage('list', {});
      if (resp.action === 'error') {
        console.error(resp);
        setError({
          show: true,
          error: resp.message
        });
        return;
      }
      setSession(resp.data.sessionStates);
      setLoading(false);
      handleCloseMenu();
    });
  }

  useEffect(() => {
    refreshSessions();
  }, [])

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = session.map((n) => n.session.identifier);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - session.length) : 0;

  const filteredSessions = applySortFilter(session, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredSessions.length && !!filterName;

  return (
    <>
      <Helmet>
        <title>Mutagen | 同步会话</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            会话列表
          </Typography>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={() => setCreateDialogOpen(true)}>
            新建同步会话
          </Button>
        </Stack>

        <Card>
          <UserListToolbar 
            numSelected={selected.length}
            filterName={filterName} 
            onFilterName={handleFilterByName} 
            onDelete={handleSelectedSessionDelete}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={session.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                {loading ? (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{py: 3}}>
                        <Paper sx={{textAlign: 'center'}}>
                          <Typography variant='body2'>Loading...</Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) :
                <TableBody>
                  {filteredSessions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { session: { name, identifier, alpha, beta, labels, paused }, status, lastError } = row;
                    const selectedUser = selected.indexOf(identifier) !== -1;

                    return (
                      <TableRow hover key={identifier} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, identifier)} />
                        </TableCell>

                        <TableCell align="left">
                          <Typography variant="subtitle2" noWrap>
                            {name}
                          </Typography>
                          <Tooltip title={identifier}>
                            <Typography 
                              variant="span"
                              style={{width: '100px', display: 'inline-block', textOverflow: 'ellipsis', overflow: 'hidden'}}
                            >
                              {identifier}
                            </Typography>
                          </Tooltip>
                        </TableCell>

                        <TableCell align="left">
                          {alpha.path}
                          <div style={{height: 24}} />
                        </TableCell>

                        <TableCell align="left">
                          {beta.path}
                          <div>
                            <Label color='info' style={{marginBottom: 10}}>{beta.protocol}</Label>
                            {beta.user ? <Label color='info'>{beta.user}</Label> : null}
                            {beta.host ? <Label color='info'>{beta.host}</Label> : null}
                            {beta.port ? <Label color='info'>{beta.port}</Label> : null}
                          </div>
                        </TableCell>

                        <TableCell align="left">
                          {labels ? Object.keys(labels).map(label => (
                            <Label 
                              color='success'
                              key={label}
                              style={{marginRight: 10, marginBottom: 5}}
                            >
                              {label}: {labels[label]}
                            </Label>
                          )) : null}
                        </TableCell>

                        <TableCell align="left">
                          {status ? (
                            <Label color={(lastError ? 'error' : 'success')}>{status}</Label>
                          ) : null}
                          {paused ? <Label color='error'>Paused</Label> : null}
                          <div>
                            <Typography variant='body2'>
                              {lastError}
                            </Typography>
                          </div>
                        </TableCell>

                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick={e => handleOpenMenu(e, row)}>
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>}

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={session.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <NewSynchronizeSession 
        client={client}
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)} 
        onCreated={session => {
          setCreateDialogOpen(false);
          refreshSessions();
        }}
      />
      
      {currentSession ? (
        <EndpointStateDialog
          open={showInfoDialog}
          onClose={handleSessionInfoDialogClose}
          session={currentSession}
          client={client}
        />
      ) : null}

      <Message 
        type='message'
        title={'ERROR'}
        message={error.error}
        open={error.show}
        onClose={() => setError({...error, show: false})} 
      />
      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem onClick={handleSessionInfo}>
          <FormatListBulletedIcon sx={{mr: 2}} />
          详情
        </MenuItem>

        <MenuItem 
          sx={{ color: 'error.main' }}
          disabled={currentSession ? deleteSession[currentSession.session.identifier] : false} 
          onClick={handleSessionDelete}
        >
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          删除
        </MenuItem>
      </Popover>
    </>
  );
}
