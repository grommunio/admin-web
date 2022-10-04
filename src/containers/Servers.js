// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Typography, Button, Grid, TableSortLabel, CircularProgress,
  TextField, MenuItem } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import GeneralDelete from '../components/Dialogs/GeneralDelete';
import { HelpOutline } from '@mui/icons-material';
import { CapabilityContext } from '../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import AddServer from '../components/Dialogs/AddServer';
import { deleteServerData, fetchServerPolicy, fetchServersData, patchServerPolicy } from '../actions/servers';
import withStyledReduxTable from '../components/withTable';
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
import SearchTextfield from '../components/SearchTextfield';

const styles = theme => ({
  buttonGrid: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  actions: {
    display: 'flex',
    flex: 1,
    margin: theme.spacing(0, 4, 0, 0),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  count: {
    marginLeft: 16,
  },
  policy: {
    margin: theme.spacing(1, 2),
  },
});

class Servers extends PureComponent {

  state = {
    snackbar: '',
  }

  componentDidMount() {
    this.props.fetchPolicy()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }

  columns = [
    { label: "Hostname", value: "hostname" },
    { label: "External name", value: "extname" },
  ];

  handlePolicyChange = e => {
    this.props.setPolicy({ data: { policy: e.target.value }})
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }

  handleSnackbarClose = () => {
    this.props.clearSnackbar();
    this.setState({
      snackbar: '',
    });
  }

  handleScroll = () => {
    const { Servers, count, loading } = this.props.servers;
    this.props.handleScroll(Servers, count, loading);
  };

  render() {
    const { classes, t, servers, tableState, handleMatch, handleRequestSort,
      handleAdd, handleAddingSuccess, handleAddingClose, handleAddingError,
      handleDelete, handleDeleteClose, handleDeleteError,
      handleDeleteSuccess, handleEdit } = this.props;
    const { order, orderBy, match, adding, snackbar, deleting } = tableState;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);

    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={<span>
          {t("Servers")}
          <IconButton
            size="small"
            href="https://docs.grommunio.com/admin/administration.html#id1"
            target="_blank"
          >
            <HelpOutline fontSize="small"/>
          </IconButton>
        </span>
        }
        snackbar={snackbar || this.state.snackbar}
        onSnackbarClose={this.handleSnackbarClose}
      >
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            disabled={!writable}
          >
            {t("New server")}
          </Button>
          <div className={classes.actions}>
            <SearchTextfield
              value={match}
              onChange={handleMatch}
              placeholder={t("Search servers")}
              className={classes.textfield}
            />
          </div>
        </Grid>
        <div>
          <TextField
            value={servers.policy || 'round-robin'}
            onChange={this.handlePolicyChange}
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
          {t("showingServers", { count: servers.Servers.length })}
        </Typography>
        <Paper elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {this.columns.map((column) => (
                  <TableCell key={column.value}>
                    <TableSortLabel
                      active={orderBy === column.value}
                      align="left"
                      direction={orderBy === column.value ? order : "asc"}
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
              {servers.Servers.map((obj, idx) =>
                <TableRow key={idx} hover onClick={handleEdit('/servers/' + obj.ID)}>
                  <TableCell>{obj.hostname}</TableCell>
                  <TableCell>{obj.extname}</TableCell>
                  <TableCell align="right">
                    {writable && <IconButton onClick={handleDelete(obj)} size="large">
                      <Delete color="error"/>
                    </IconButton>}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {(servers.Servers.length < servers.count) && <Grid container justifyContent="center">
            <CircularProgress color="primary" className={classes.circularProgress}/>
          </Grid>}
        </Paper>
        <AddServer
          open={adding}
          onSuccess={handleAddingSuccess}
          onError={handleAddingError}
          onClose={handleAddingClose}
        />
        <GeneralDelete
          open={!!deleting}
          delete={this.props.delete}
          onSuccess={handleDeleteSuccess}
          onError={handleDeleteError}
          onClose={handleDeleteClose}
          item={deleting.hostname}
          id={deleting.ID}
        />
      </TableViewContainer>
    );
  }
}

Servers.contextType = CapabilityContext;
Servers.propTypes = {
  servers: PropTypes.object.isRequired,
  fetchPolicy: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
  setPolicy: PropTypes.func.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = state => {
  return {
    servers: state.servers,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTableData: async params => 
      await dispatch(fetchServersData(params)).catch(msg => Promise.reject(msg)),
    fetchPolicy: async () =>
      await dispatch(fetchServerPolicy()).catch(msg => Promise.reject(msg)),
    delete: async id =>
      await dispatch(deleteServerData(id)).catch(msg => Promise.reject(msg)),
    setPolicy: async data => 
      await dispatch(patchServerPolicy(data)).catch(msg => Promise.reject(msg)),
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(Servers, { orderBy: 'hostname'});
