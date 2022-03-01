// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Typography, Button, Grid, TableSortLabel, CircularProgress,
  TextField, InputAdornment, MenuItem } from '@mui/material';
import Search from '@mui/icons-material/Search';
import Delete from '@mui/icons-material/Delete';
import { connect } from 'react-redux';
import GeneralDelete from '../components/Dialogs/GeneralDelete';
import { debounce } from 'debounce';
import { HelpOutline } from '@mui/icons-material';
import { CapabilityContext } from '../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import AddServer from '../components/Dialogs/AddServer';
import { deleteServerData, fetchServerPolicy, fetchServersData, patchServerPolicy } from '../actions/servers';

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
    width: 160,
  },
});

class Servers extends PureComponent {

  componentDidMount() {
    this.props.fetch({ sort: 'hostname,asc' })
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
    this.props.fetchPolicy()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }

  state = {
    snackbar: '',
    adding: false,
    deleting: false,
    order: 'asc',
    orderBy: 'hostname',
    match: '',
    offset: 50,
  }

  columns = [
    { label: "Hostname", value: "hostname" },
    { label: "External name", value: "extname" },
  ];

  handleScroll = () => {
    const { servers, fetch } = this.props;
    if((servers.Servers.length >= servers.count)) return;
    if (
      Math.floor(document.getElementById('scrollDiv').scrollHeight - document.getElementById('scrollDiv').scrollTop)
      <= document.getElementById('scrollDiv').offsetHeight + 20
    ) {
      const { order, offset, match } = this.state;
      if(!servers.loading) {
        fetch({
          sort: 'hostname,' + order,
          offset,
          match: match || undefined,
        });
        this.setState({
          offset: offset + 50,
        });
      }
    }
  }

  handleRequestSort = orderBy => () => {
    const { fetch } = this.props;
    const { order: stateOrder, orderBy: stateOrderBy, match } = this.state;
    const order = (stateOrderBy === orderBy && stateOrder === "asc") ? "desc" : "asc";
    
    fetch({
      sort: orderBy + ',' + order,
      match: match || undefined,
    }).catch(msg => this.setState({ snackbar: msg }));

    this.setState({
      order: order,
      orderBy,
      offset: 0,
    });
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ adding: false, snackbar: 'Success!' });

  handleAddingClose = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleEdit = server => event => {
    this.props.history.push('/servers/' + server.ID);
    event.stopPropagation();
  }

  handleDelete = server => event => {
    event.stopPropagation();
    this.setState({ deleting: server });
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
    this.debouceFetch(value);
    this.setState({ match: value });
  }

  debouceFetch = debounce(value => {
    const { fetch }= this.props;
    const { order } = this.state;
    fetch({ match: value || undefined, sort: 'hostname,' + order })
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }, 200)

  handlePolicyChange = e => {
    this.props.setPolicy({ data: { policy: e.target.value }})
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }

  render() {
    const { classes, t, servers } = this.props;
    const { adding, snackbar, deleting, order, match, orderBy } = this.state;
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
            {t("New server")}
          </Button>
          <div className={classes.actions}>
            <TextField
              value={match}
              onChange={this.handleMatch}
              placeholder={t("Search")}
              variant="outlined"
              className={classes.textfield}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="secondary" />
                  </InputAdornment>
                ),
              }}
              color="primary"
            />
          </div>
        </Grid>
        <div>
          <TextField
            value={servers.policy || 'round-robin'}
            onChange={this.handlePolicyChange}
            select
            label="Selection policy"
            className={classes.policy}
          >
            <MenuItem value={"round-robin"}>round-robin</MenuItem>
            <MenuItem value={"balanced"}>balanced</MenuItem>
            <MenuItem value={"first"}>first</MenuItem>
            <MenuItem value={"last"}>last</MenuItem>
            <MenuItem value={"random"}>random</MenuItem>
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
                      onClick={this.handleRequestSort(column.value)}
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
                <TableRow key={idx} hover onClick={this.handleEdit(obj)}>
                  <TableCell>{obj.hostname}</TableCell>
                  <TableCell>{obj.extname}</TableCell>
                  <TableCell align="right">
                    {writable && <IconButton onClick={this.handleDelete(obj)} size="large">
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
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          onClose={this.handleAddingClose}
        />
        <GeneralDelete
          open={!!deleting}
          delete={this.props.delete}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
          item={deleting.hostname}
          id={deleting.ID}
        />
      </TableViewContainer>
    );
  }
}

Servers.contextType = CapabilityContext;
Servers.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  servers: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchPolicy: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
  setPolicy: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    servers: state.servers,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async params => 
      await dispatch(fetchServersData(params)).catch(msg => Promise.reject(msg)),
    fetchPolicy: async () =>
      await dispatch(fetchServerPolicy()).catch(msg => Promise.reject(msg)),
    delete: async id =>
      await dispatch(deleteServerData(id)).catch(msg => Promise.reject(msg)),
    setPolicy: async data => 
      await dispatch(patchServerPolicy(data)).catch(msg => Promise.reject(msg)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Servers)));
