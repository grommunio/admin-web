// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Typography, Button, Grid, TableSortLabel, CircularProgress,
  TextField, InputAdornment } from '@material-ui/core';
import Search from '@material-ui/icons/Search';
import Delete from '@material-ui/icons/Delete';
import TopBar from '../components/TopBar';
import { connect } from 'react-redux';
import { fetchRolesData, deleteRolesData } from '../actions/roles';
import AddRoles from '../components/Dialogs/AddRole';
import GeneralDelete from '../components/Dialogs/GeneralDelete';
import HomeIcon from '@material-ui/icons/Home';
import blue from '../colors/blue';
import Feedback from '../components/Feedback';
import { debounce } from 'debounce';

const styles = theme => ({
  root: {
    flex: 1,
    overflowY: 'auto',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  grid: {
    padding: theme.spacing(0, 2),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  flexRowEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  pageTitle: {
    margin: theme.spacing(2),
  },
  buttonGrid: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  pageTitleSecondary: {
    color: '#aaa',
  },
  homeIcon: {
    color: blue[500],
    position: 'relative',
    top: 4,
    left: 4,
    cursor: 'pointer',
  },
  circularProgress: {
    margin: theme.spacing(1, 0),
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
    const { order, orderBy } = this.state;
    fetch({ match: value || undefined, sort: orderBy + ',' + order })
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }, 200)

  render() {
    const { classes, t, roles } = this.props;
    const { adding, snackbar, deleting, order, match } = this.state;

    return (
      <div
        className={classes.root}
        onScroll={debounce(this.handleScroll, 100)}
        id="scrollDiv"
      >
        <TopBar/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Roles")}
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon onClick={this.handleNavigation('')} className={classes.homeIcon}></HomeIcon>
          </Typography>
          <Grid container alignItems="flex-end" className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.setState({ adding: true })}
            >
              {t("New role")}
            </Button>
            <div className={classes.actions}>
              <TextField
                value={match}
                onChange={this.handleMatch}
                placeholder={t("search roles")}
                variant="outlined"
                className={classes.textfield}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                color="primary"
              />
            </div>
          </Grid>
          <Typography className={classes.count} color="textPrimary">
            Showing {roles.Roles.length} role(s)
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
                      <IconButton onClick={this.handleDelete(obj)}>
                        <Delete color="error"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {(roles.Roles.length < roles.count) && <Grid container justify="center">
              <CircularProgress color="primary" className={classes.circularProgress}/>
            </Grid>}
          </Paper>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: '' })}
          />
        </div>
        <AddRoles
          open={adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
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
      </div>
    );
  }
}

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
