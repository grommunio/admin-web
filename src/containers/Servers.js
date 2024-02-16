// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Typography, Button, Grid, TableSortLabel, CircularProgress,
  TextField, MenuItem, Chip, Tooltip, Alert } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import GeneralDelete from '../components/Dialogs/GeneralDelete';
import { Dns, HelpOutline, Warning } from '@mui/icons-material';
import { CapabilityContext } from '../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import AddServer from '../components/Dialogs/AddServer';
import { deleteServerData, fetchServerDnsCheck, fetchServerPolicy, fetchServersData, patchServerPolicy } from '../actions/servers';
import withStyledReduxTable from '../components/withTable';
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
import SearchTextfield from '../components/SearchTextfield';
import TableActionGrid from '../components/TableActionGrid';

const styles = theme => ({
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
});

class Servers extends PureComponent {

  state = {
    snackbar: '',
    dnsLoading: true,
  }

  async componentDidMount() {
    const { fetchPolicy, fetchDns } = this.props;
    fetchPolicy()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
    fetchDns()
      .then(() => this.setState({ dnsLoading: false }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error', dnsLoading: false }));
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
    const { loading, order, orderBy, match, adding, snackbar, deleting } = tableState;
    const { dnsLoading } = this.state;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    const { host, ext } = servers.DnsCheck;

    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
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
        snackbar={snackbar || this.state.snackbar}
        onSnackbarClose={this.handleSnackbarClose}
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
              {servers.Servers.map((obj, idx) => {
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
                    {writable && <IconButton onClick={handleDelete(obj)} size="large">
                      <Delete color="error"/>
                    </IconButton>}
                  </TableCell>
                </TableRow>;
              })}
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
  fetchDns: PropTypes.func.isRequired,
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
    fetchDns: async () =>
      await dispatch(fetchServerDnsCheck()).catch(msg => Promise.reject(msg)),
    delete: async id =>
      await dispatch(deleteServerData(id)).catch(msg => Promise.reject(msg)),
    setPolicy: async data => 
      await dispatch(patchServerPolicy(data)).catch(msg => Promise.reject(msg)),
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(Servers, { orderBy: 'hostname'});
