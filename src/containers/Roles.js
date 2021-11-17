// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Typography, Button, Grid, TableSortLabel, CircularProgress,
  TextField, InputAdornment } from '@mui/material';
import Search from '@mui/icons-material/Search';
import Delete from '@mui/icons-material/Delete';
import { connect } from 'react-redux';
import { fetchRolesData, deleteRolesData } from '../actions/roles';
import AddRoles from '../components/Dialogs/AddRole';
import GeneralDelete from '../components/Dialogs/GeneralDelete';
import { debounce } from 'debounce';
import { HelpOutline } from '@mui/icons-material';
import { CapabilityContext } from '../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';

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
});

class Roles extends PureComponent {

  componentDidMount() {
    this.props.fetch({ sort: 'name,asc' })
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }

  state = {
    snackbar: '',
    adding: false,
    deleting: false,
    order: 'asc',
    match: '',
    offset: 50,
  }

  handleScroll = () => {
    const { roles, fetch } = this.props;
    if((roles.Roles.length >= roles.count)) return;
    if (
      Math.floor(document.getElementById('scrollDiv').scrollHeight - document.getElementById('scrollDiv').scrollTop)
      <= document.getElementById('scrollDiv').offsetHeight + 20
    ) {
      const { order, offset, match } = this.state;
      if(!roles.loading) fetch({
        sort: 'name,' + order,
        offset,
        match: match || undefined,
      }).then(() =>
        this.setState({
          offset: offset + 50,
        })
      );
    }
  }

  handleInput = field => event => {
    this.setState({
      newData: {
        ...this.state.newData,
        [field]: event.target.value,
      },
    });
  }

  handleRequestSort = () => {
    const { fetch } = this.props;
    const { order: stateOrder, match } = this.state;
    const order = stateOrder === "asc" ? "desc" : "asc";
    
    fetch({
      sort: 'name,' + order,
      match: match || undefined,
    }).catch(msg => this.setState({ snackbar: msg }));

    this.setState({
      order: order,
      offset: 0,
    });
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ adding: false, snackbar: 'Success!' });

  handleAddingClose = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleEdit = role => event => {
    this.props.history.push('/roles/' + role.ID, { ...role });
    event.stopPropagation();
  }

  handleDelete = role => event => {
    event.stopPropagation();
    this.setState({ deleting: role });
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
    fetch({ match: value || undefined, sort: 'name,' + order })
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }, 200)

  render() {
    const { classes, t, roles } = this.props;
    const { adding, snackbar, deleting, order, match } = this.state;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);

    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={<span>
          {t("Roles")}
          <IconButton
            size="small"
            href="https://docs.grommunio.com/admin/administration.html#id1"
            target="_blank"
          >
            <HelpOutline fontSize="small"/>
          </IconButton>
        </span>
        }
        subtitle="Roles provide an overview of all roles available for access to the Admin UI and API."
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
            {t("New role")}
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
        <Typography className={classes.count} color="textPrimary">
          {t("showingRoles", { count: roles.Roles.length })}
        </Typography>
        <Paper elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active
                    align="left" 
                    direction={order}
                    onClick={this.handleRequestSort}
                  >
                    {t('Name')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>{t('Description')}</TableCell>
                <TableCell>{t('Permissions')}</TableCell>
                <TableCell padding="checkbox"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.Roles.map((obj, idx) =>
                <TableRow key={idx} hover onClick={this.handleEdit(obj)}>
                  <TableCell>{obj.name}</TableCell>
                  <TableCell>{obj.description}</TableCell>
                  <TableCell>{obj.permissions.map(perm => perm.permission).toString()}</TableCell>
                  <TableCell align="right">
                    {writable && <IconButton onClick={this.handleDelete(obj)} size="large">
                      <Delete color="error"/>
                    </IconButton>}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {(roles.Roles.length < roles.count) && <Grid container justifyContent="center">
            <CircularProgress color="primary" className={classes.circularProgress}/>
          </Grid>}
        </Paper>
        <AddRoles
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
          item={deleting.name}
          id={deleting.ID}
        />
      </TableViewContainer>
    );
  }
}

Roles.contextType = CapabilityContext;
Roles.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  roles: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    roles: state.roles,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async params => {
      await dispatch(fetchRolesData(params)).catch(msg => Promise.reject(msg));
    },
    delete: async id => {
      await dispatch(deleteRolesData(id)).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Roles)));
