// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { useTranslation } from 'react-i18next';
import { useTable } from '../hooks/useTable';
import React, { useContext, useEffect, useState } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Typography, Button, Grid2, TableSortLabel, CircularProgress,
  TextField, MenuItem, Chip, Tooltip, Alert, 
  Theme,
  TableSortLabelTypeMap} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import GeneralDelete from '../components/Dialogs/GeneralDelete';
import { Dns, HelpOutline, Warning } from '@mui/icons-material';
import { CapabilityContext } from '../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import AddServer from '../components/Dialogs/AddServer';
import { deleteServerData, fetchServerDnsCheck, fetchServerPolicy, fetchServersData, patchServerPolicy } from '../actions/servers';
import SearchTextfield from '../components/SearchTextfield';
import TableActionGrid from '../components/TableActionGrid';
import { makeStyles } from 'tss-react/mui';
import { useAppDispatch, useAppSelector } from '../store';
import { URLParams } from '@/actions/types';
import { ServerPolicy } from '@/types/servers';


const useStyles = makeStyles()((theme: Theme) => ({
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  count: {
    marginLeft: 16,
  },
  policy: {
    margin: theme.spacing(1, 2),
  },
  chipLabel: {
    paddingRight: 0,
  },
  chip: {
    marginRight: 8,
  },
}));


const Servers = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const [state, setState] = useState({
    snackbar: '',
    dnsLoading: true,
  });
  const { Servers, count, DnsCheck, policy } = useAppSelector(state => state.servers);
  const context = useContext(CapabilityContext);
  const dispatch = useAppDispatch();
  const fetchTableData = async (params: URLParams) =>
    dispatch(fetchServersData(params));

  const fetchPolicy = async () =>
    dispatch(fetchServerPolicy());

  const fetchDns = async () =>
    dispatch(fetchServerDnsCheck());

  const setPolicy = async (data: { data: { policy: ServerPolicy } }) =>
    dispatch(patchServerPolicy(data));

  const deleteItem = async (id: number) =>
    dispatch(deleteServerData(id));

  const table = useTable({
    fetchTableData,
    defaultState: { orderBy: 'hostname' },
  });

  const {
    tableState,
    handleMatch,
    handleRequestSort,
    handleAdd,
    handleAddingSuccess,
    handleAddingClose,
    handleAddingError,
    handleDelete,
    handleDeleteClose,
    handleDeleteError,
    handleDeleteSuccess,
    handleEdit,
    clearSnackbar,
  } = table;

  useEffect(() => {
    const inner = async () => {
      fetchPolicy()
        .catch(msg => {
          setState({ ...state, snackbar: msg || 'Unknown error' });
        });
      fetchDns()
        .then(() => setState({ ...state, dnsLoading: false }))
        .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error', dnsLoading: false }));
    };

    inner();
  }, []);

  const columns = [
    { label: "Hostname", value: "hostname" },
    { label: "External name", value: "extname" },
  ];

  const handlePolicyChange = e => {
    setPolicy({ data: { policy: e.target.value }})
      .then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(msg => {
        setState({ ...state, snackbar: msg || 'Unknown error' });
      });
  }

  const handleSnackbarClose = () => {
    clearSnackbar();
    setState({
      ...state, 
      snackbar: '',
    });
  }

  const handleScroll = () => {
    table.handleScroll(Servers, count);
  };

  const { loading, order, orderBy, match, adding, snackbar, deleting } = tableState;
  const { dnsLoading } = state;
  const writable = context.includes(SYSTEM_ADMIN_WRITE);
  const { host, ext } = DnsCheck;

  return (
    <TableViewContainer
      handleScroll={handleScroll}
      headline={<span>
        {t("Servers")}
        <IconButton
          size="small"
          href="https://docs.grommunio.com/admin/administration.html#servers"
          target="_blank"
        >
          <HelpOutline fontSize="small"/>
        </IconButton>
      </span>
      }
      snackbar={snackbar || state.snackbar}
      onSnackbarClose={handleSnackbarClose}
      loading={loading}
    >
      <Alert
        severity={"error"}
        elevation={1}
        variant="filled"
        icon={<Warning />}
        sx={{ my: 0, mx: 2 }}
      >
        Disclaimer! Be sure to know what you are doing.
        If your grommunio is hosted on a single server, there is no configuration necessary.
      </Alert>
      <TableActionGrid
        tf={<SearchTextfield
          value={match}
          onChange={handleMatch}
          placeholder={t("Search servers")}
        />}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          disabled={!writable}
        >
          {t("New server")}
        </Button>
      </TableActionGrid>
      <div>
        <TextField
          value={policy || 'round-robin'}
          onChange={handlePolicyChange}
          select
          label={t("Selection policy")}
          className={classes.policy}
          helperText={t("Determines the way new users will be distributed across servers")}
        >
          <MenuItem value={"round-robin"}>{t("round-robin")}</MenuItem>
          <MenuItem value={"balanced"}>{t("balanced")}</MenuItem>
          <MenuItem value={"first"}>{t("first")}</MenuItem>
          <MenuItem value={"last"}>{t("last")}</MenuItem>
          <MenuItem value={"random"}>{t("random")}</MenuItem>
        </TextField>
      </div>
      <Typography className={classes.count} color="textPrimary">
        {t("showingServers", { count: Servers.length })}
      </Typography>
      <Paper elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.value}>
                  <TableSortLabel
                    active={orderBy === column.value}
                    direction={orderBy === column.value ? order as TableSortLabelTypeMap["props"]["direction"] : "asc"}
                    onClick={handleRequestSort(column.value)}
                  >
                    {t(column.label)}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell padding="checkbox" />
            </TableRow>
          </TableHead>
          <TableBody>
            {Servers.map((obj, idx) => {
              const hostnameResolved = !!host[obj.hostname];
              const extResolved = !!ext[obj.extname];
              return <TableRow key={idx} hover onClick={handleEdit('/servers/' + obj.ID)}>
                <TableCell>
                  <Tooltip title={t("Hostname check") + " " + (hostnameResolved ? t("passed") : t("failed"))}>
                    <Chip
                      size='small'
                      color={dnsLoading ? "secondary" : hostnameResolved ? "success" : "error"}
                      icon={<Dns />}
                      classes={{
                        root: classes.chip,
                        label: classes.chipLabel,
                      }}
                    />
                  </Tooltip>
                  {obj.hostname}
                </TableCell>
                <TableCell>
                  <Tooltip title={t("Hostname check") + " " + (extResolved ? t("passed") : t("failed"))}>
                    <Chip
                      size='small'
                      color={dnsLoading ? "secondary" : extResolved ? "success" : "error"}
                      icon={<Dns />}
                      classes={{
                        root: classes.chip,
                        label: classes.chipLabel,
                      }}
                    />
                  </Tooltip>
                  {obj.extname}
                </TableCell>
                <TableCell align="right">
                  {writable && <IconButton onClick={handleDelete(obj)} size="small">
                    <Delete color="error" fontSize='small'/>
                  </IconButton>}
                </TableCell>
              </TableRow>;
            })}
          </TableBody>
        </Table>
        {(Servers.length < count) && <Grid2 container justifyContent="center">
          <CircularProgress color="primary" className={classes.circularProgress}/>
        </Grid2>}
      </Paper>
      <AddServer
        open={adding}
        onSuccess={handleAddingSuccess}
        onError={handleAddingError}
        onClose={handleAddingClose}
      />
      <GeneralDelete
        open={!!deleting}
        delete={deleteItem}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
        onClose={handleDeleteClose}
        item={deleting.hostname}
        id={deleting.ID}
      />
    </TableViewContainer>
  );
}


export default Servers;
