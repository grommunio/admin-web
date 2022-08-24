// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Typography, Button, Grid, Tabs, Tab, IconButton } from '@mui/material';
import { connect } from 'react-redux';
import { fetchDBConfData, deleteDBService } from '../actions/dbconf';
import UploadServiceFile from '../components/Dialogs/UploadServiceFile';
import GeneralDelete from '../components/Dialogs/GeneralDelete';
import { Delete } from '@mui/icons-material';
import CreateDbconfFile from '../components/Dialogs/CreateDbconfFile';
import { defaultFetchLimit, SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import TableViewContainer from '../components/TableViewContainer';
import SearchTextfield from '../components/SearchTextfield';

const styles = theme => ({
  paper: {
    padding: theme.spacing(2, 2, 2, 2),
  },
  buttonGrid: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  actions: {
    display: 'flex',
    flex: 1,
    margin: theme.spacing(0, 4, 0, 0),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
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
});

class DBConf extends Component {

  componentDidMount() {
    this.props.fetch()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }

  state = {
    snackbar: '',
    match: '',
    adding: false,
    deleting: false,
    configuring: false,
    offset: defaultFetchLimit,
    tab: 0,
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ adding: false, configuring: false, snackbar: 'Success!' });

  handleAddingClose = () => this.setState({ adding: false, configuring: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleDelete = service => event => {
    event.stopPropagation();
    this.setState({ deleting: service });
  }

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteError = error => this.setState({ snackbar: error });

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleMatch = e => {
    const { value } = e.target;
    this.setState({ match: value });
  }

  handleTab = (e, tab) => this.setState({ tab });

  render() {
    const { classes, t, services, commands } = this.props;
    const { adding, configuring, snackbar, match, tab, deleting } = this.state;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    return (
      <TableViewContainer
        headline={t("Configuration DB")}
        href="https://docs.grommunio.com/admin/administration.html#db-configuration"
        subtitle={t('dbconf_sub')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.setState({ adding: true })}
            disabled={!writable}
          >
            {t("Create file")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.setState({ configuring: true })}
            className={classes.button}
            disabled={!writable}
          >
            {t("Configure grommunio-dbconf")}
          </Button>
          <div className={classes.actions}>
            <SearchTextfield
              value={match}
              onChange={this.handleMatch}
              placeholder={t("Search services")}
              className={classes.textfield}
            />
          </div>
        </Grid>
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
          <Tabs
            textColor="primary" 
            indicatorColor="primary"
            value={tab}
            onChange={this.handleTab}
          >
            <Tab value={0} label={t("Services")} />
            <Tab value={1} label={t("Commands")} />
          </Tabs>
        </Grid>
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
                <TableRow onClick={this.handleNavigation('dbconf/' + service)} key={idx} hover>
                  <TableCell>{service}</TableCell>
                  <TableCell align="right">
                    {writable && <IconButton onClick={this.handleDelete(service)} size="large">
                      <Delete color="error" />
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
          delete={this.props.delete}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
          item={deleting}
          id={deleting}
        />
        <UploadServiceFile
          open={adding}
          onClose={this.handleAddingClose}
          onError={this.handleAddingError}
          onSuccess={this.handleAddingSuccess}
        />
        <CreateDbconfFile
          open={configuring}
          onClose={this.handleAddingClose}
          onError={this.handleAddingError}
          onSuccess={this.handleAddingSuccess}
        />
      </TableViewContainer>
    );
  }
}

DBConf.contextType = CapabilityContext;
DBConf.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
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
    delete: async service => {
      await dispatch(deleteDBService(service)).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DBConf)));
