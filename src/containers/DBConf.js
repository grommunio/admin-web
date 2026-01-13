// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Typography, Button, Grid2, Tabs, Tab, IconButton } from '@mui/material';
import { connect } from 'react-redux';
import { fetchDBConfData, deleteDBService } from '../actions/dbconf';
import UploadServiceFile from '../components/Dialogs/UploadServiceFile';
import GeneralDelete from '../components/Dialogs/GeneralDelete';
import { Delete, MiscellaneousServices, SmartButton } from '@mui/icons-material';
import CreateDbconfFile from '../components/Dialogs/CreateDbconfFile';
import { defaultFetchLimit, SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import TableViewContainer from '../components/TableViewContainer';
import SearchTextfield from '../components/SearchTextfield';
import TableActionGrid from '../components/TableActionGrid';
import { useNavigate } from 'react-router';

const styles = theme => ({
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
});

const DBConf = props => {
  const [state, setState] = useState({
    snackbar: '',
    match: '',
    adding: false,
    deleting: false,
    configuring: false,
    offset: defaultFetchLimit,
    tab: 0,
    loading: true,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  useEffect(() => {
    props.fetch()
      .then(() => setState({ ...state, loading: false }))
      .catch(msg => {
        setState({ ...state, snackbar: msg || 'Unknown error', loading: false });
      });
  }, []);

  const handleAddingSuccess = () => setState({ ...state, adding: false, configuring: false, snackbar: 'Success!' });

  const handleAddingClose = () => setState({ ...state, adding: false, configuring: false });

  const handleAddingError = error => setState({ ...state, snackbar: error });

  const handleDelete = service => event => {
    event.stopPropagation();
    setState({ ...state, deleting: service });
  }

  const handleDeleteSuccess = resp => {
    setState({ ...state, deleting: false, snackbar: 'Success! ' + (resp?.message || '')});
  }

  const handleDeleteClose = () => setState({ ...state, deleting: false });

  const handleDeleteError = error => setState({ ...state, snackbar: error });

  const handleNavigation = path => event => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  const handleMatch = e => {
    const { value } = e.target;
    setState({ ...state, match: value });
  }

  const handleTab = (e, tab) => setState({ ...state,tab });

  const { classes, t, services, commands } = props;
  const { adding, configuring, snackbar, match, tab, deleting, loading } = state;
  const writable = context.includes(SYSTEM_ADMIN_WRITE);
  return (
    <TableViewContainer
      headline={t("Configuration DB")}
      href="https://docs.grommunio.com/admin/administration.html#db-configuration"
      subtitle={t('dbconf_sub')}
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
      loading={loading}
    >
      <TableActionGrid
        tf={<SearchTextfield
          value={match}
          onChange={handleMatch}
          placeholder={t("Search services")}
          className={classes.textfield}
        />}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => setState({ ...state, adding: true })}
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
          value={tab}
          onChange={handleTab}
        >
          <Tab label={t("Services")} sx={{ minHeight: 48 }} iconPosition='start' icon={<MiscellaneousServices />}/>
          <Tab label={t("Commands")} sx={{ minHeight: 48 }} iconPosition='start' icon={<SmartButton />}/>
        </Tabs>
      </Grid2>
      {tab === 0 ? <Paper elevation={1}>
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
            {services.filter(s => s.includes(match)).map((service, idx) =>
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
        delete={props.delete}
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
        open={configuring}
        onClose={handleAddingClose}
        onError={handleAddingError}
        onSuccess={handleAddingSuccess}
      />
    </TableViewContainer>
  );
}

DBConf.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  services: PropTypes.array.isRequired,
  commands: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { dbconf } = state;
  return {
    services: dbconf.services,
    commands: dbconf.commands,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => {
      await dispatch(fetchDBConfData({})).catch(msg => Promise.reject(msg));
    },
    delete: async service => await dispatch(deleteDBService(service))
      .then(msg => msg)
      .catch(msg => Promise.reject(msg)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(DBConf, styles)));
