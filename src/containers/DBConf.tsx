// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Typography, Button, Grid2, Tabs, Tab, IconButton, 
  Theme} from '@mui/material';
import { fetchDBConfData, deleteDBService } from '../actions/dbconf';
import UploadServiceFile from '../components/Dialogs/UploadServiceFile';
import GeneralDelete from '../components/Dialogs/GeneralDelete';
import { Delete, MiscellaneousServices, SmartButton } from '@mui/icons-material';
import CreateDbconfFile from '../components/Dialogs/CreateDbconfFile';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import TableViewContainer from '../components/TableViewContainer';
import SearchTextfield from '../components/SearchTextfield';
import TableActionGrid from '../components/TableActionGrid';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../store';
import { useTable } from '../hooks/useTable';


const useStyles = makeStyles()((theme: Theme) => ({
  paper: {
    padding: theme.spacing(2, 2, 2, 2),
  },
  pre: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  title: {
    marginTop: 16,
  },
  button: {
    marginLeft: 8,
  },
  tabs: {
    marginLeft: 16,
  },
}));

const DBConf = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    tab: 0,
    configuring: false,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();
  const { commands, services } = useAppSelector(state => state.dbconf);

  const fetchTableData = async () => await dispatch(fetchDBConfData({}));
  const deleteItem = async (service: string | number) => await dispatch(deleteDBService(service as string));

  const table = useTable({
    fetchTableData,
    defaultState: { orderBy: "domainname" },
  });

  const {
    tableState,
    handleMatch,
    handleAdd,
    handleAddingSuccess,
    handleAddingClose,
    handleAddingError,
    clearSnackbar,
    handleDelete,
    handleDeleteClose,
    handleDeleteError,
    handleDeleteSuccess,
  } = table;

  const handleNavigation = (path: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  const handleTab = (_: unknown, tab: number) => setState({ ...state, tab });

  const { adding, snackbar, match, deleting, loading } = tableState;
  const writable = context.includes(SYSTEM_ADMIN_WRITE);
  return (
    <TableViewContainer
      headline={t("Configuration DB")}
      href="https://docs.grommunio.com/admin/administration.html#db-configuration"
      subtitle={t('dbconf_sub')}
      snackbar={snackbar}
      onSnackbarClose={clearSnackbar}
      loading={loading}
    >
      <TableActionGrid
        tf={<SearchTextfield
          value={match}
          onChange={handleMatch}
          placeholder={t("Search services")}
        />}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          disabled={!writable}
        >
          {t("Create file")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setState({ ...state, configuring: true })}
          className={classes.button}
          disabled={!writable}
        >
          {t("Configure grommunio-dbconf")}
        </Button>
      </TableActionGrid>
      <Grid2 container alignItems="flex-end" className={classes.tabs}>
        <Tabs
          textColor="primary" 
          indicatorColor="primary"
          value={state.tab}
          onChange={handleTab}
        >
          <Tab label={t("Services")} sx={{ minHeight: 48 }} iconPosition='start' icon={<MiscellaneousServices />}/>
          <Tab label={t("Commands")} sx={{ minHeight: 48 }} iconPosition='start' icon={<SmartButton />}/>
        </Tabs>
      </Grid2>
      {state.tab === 0 ? <Paper elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                {t('Name')}
              </TableCell>
              <TableCell padding="checkbox"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(services || []).filter((s) => s.includes(match)).map((service, idx) =>
              <TableRow onClick={handleNavigation('dbconf/' + service)} key={idx} hover>
                <TableCell>{service}</TableCell>
                <TableCell align="right">
                  {writable && <IconButton onClick={handleDelete(service)} size="small">
                    <Delete color="error" fontSize="small"/>
                  </IconButton>}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper> : <Paper className={classes.paper}>
        <Typography variant="h6">{t("Key")}</Typography>
        {commands.key.length > 0 ? commands.key.map((key, idx) =>
          <pre className={classes.pre} key={idx}>
            <code key={idx}>{key}</code>
          </pre>
        ) : <Typography><i>{t("none")}</i></Typography>}
        <Typography className={classes.title} variant="h6">{t("File")}</Typography>
        {commands.file.length > 0 ? commands.file.map((key, idx) =>
          <pre className={classes.pre} key={idx}>
            <code>{key}</code>
          </pre>
        ) : <Typography><i>{t("none")}</i></Typography>}
        <Typography className={classes.title} variant="h6">{t("Service")}</Typography>
        {commands.service.length > 0 ? commands.service.map((key, idx) =>
          <pre className={classes.pre} key={idx}>
            <code>{key}</code>
          </pre>
        ) : <Typography><i>{t("none")}</i></Typography>}
      </Paper>}
      <GeneralDelete
        open={!!deleting}
        delete={deleteItem}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
        onClose={handleDeleteClose}
        item={deleting}
        id={deleting}
      />
      <UploadServiceFile
        open={adding}
        onClose={handleAddingClose}
        onError={handleAddingError}
        onSuccess={handleAddingSuccess}
      />
      <CreateDbconfFile
        open={state.configuring}
        onClose={handleAddingClose}
        onError={handleAddingError}
      />
    </TableViewContainer>
  );
}


export default DBConf;
