// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import debounce from 'debounce';
import { withTranslation } from 'react-i18next';
import { Paper, Typography, Button, Grid,
  CircularProgress, TextField, InputAdornment, Table, TableHead, TableRow, TableCell,
  TableSortLabel, TableBody, IconButton } from '@material-ui/core';
import Search from '@material-ui/icons/Search';
import { connect } from 'react-redux';
import { fetchGroupsData, deleteGroupData } from '../actions/groups';
import TopBar from '../components/TopBar';
import HomeIcon from '@material-ui/icons/Home';
import blue from '../colors/blue';
import Feedback from '../components/Feedback';
import { Delete } from '@material-ui/icons';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';
import AddGroup from '../components/Dialogs/AddGroup';

const styles = theme => ({
  root: {
    flex: 1,
    overflow: 'auto',
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
  },
  tablePaper: {
    margin: theme.spacing(3, 2),
    borderRadius: 6,
  },
  grid: {
    padding: theme.spacing(0, 2),
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
  textfield: {
    margin: theme.spacing(2, 0, 1, 0),
  },
  actions: {
    display: 'flex',
    flex: 1,
    margin: theme.spacing(0, 4, 0, 0),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  newButton: {
    marginRight: 8,
  },
});

class Groups extends Component {

  state = {
    snackbar: null,
    adding: false,
    deleting: false,
    checking: false,
    order: 'asc',
    orderBy: 'name',
    offset: 50,
    match: '',
  }

  columns = [
    { label: 'Groupname', value: 'name' },
  ]

  handleScroll = () => {
    const { groups } = this.props;
    if((groups.Groups.length >= groups.count)) return;
    if (
      Math.floor(document.getElementById('scrollDiv').scrollHeight - document.getElementById('scrollDiv').scrollTop)
      <= document.getElementById('scrollDiv').offsetHeight + 20
    ) {
      const { orderBy, order, offset, match } = this.state;
      if(!groups.loading) this.fetchGroups({
        sort: orderBy + ',' + order,
        offset,
        match: match || undefined,
      });
      this.setState({
        offset: offset + 50,
      });
    }
  }

  componentDidMount() {
    this.fetchGroups({ sort: 'name,asc' });
  }

  fetchGroups(params) {
    const { fetch, domain } = this.props;
    fetch(domain.ID, params)
      .catch(msg => this.setState({ snackbar: msg }));
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ snackbar: 'Success!', adding: false });

  handleAddingClose = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleDelete = group => event => {
    event.stopPropagation();
    this.setState({ deleting: group });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
  }

  handleDeleteError = error => this.setState({ snackbar: error });

  handleEdit = group => () => {
    const { history, domain } = this.props;
    history.push('/' + domain.ID + '/groups/' + group.ID, { ...group });
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleRequestSort = orderBy => () => {
    const { fetch, domain } = this.props;
    const { order: stateOrder, orderBy: stateOrderBy, match } = this.state;
    const order = (stateOrderBy === orderBy && stateOrder === "asc") ? "desc" : "asc";
    
    fetch(domain.ID, {
      sort: orderBy + ',' + order,
      match: match || undefined,
    }).catch(msg => this.setState({ snackbar: msg }));

    this.setState({
      order: order,
      orderBy,
      offset: 0,
    });
  }

  debouceFetch = debounce(value => {
    const { order, orderBy } = this.state;
    this.fetchGroups({ match: value || undefined, sort: orderBy + ',' + order });
  }, 200)

  handleCheckClose = () => this.setState({ checking: false });

  render() {
    const { classes, t, groups, domain } = this.props;
    const { snackbar, match, orderBy, order, adding, deleting } = this.state;

    return (
      <div
        className={classes.root}
        onScroll={debounce(this.handleScroll, 100)}
        id="scrollDiv"
      >
        <TopBar title={domain.domainname}/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Groups")}
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon onClick={this.handleNavigation('')} className={classes.homeIcon}></HomeIcon>
          </Typography>
          <Grid container alignItems="flex-end" className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleAdd}
              className={classes.newButton}
            >
              {t('New group')}
            </Button>
            <div className={classes.actions}>
              <TextField
                value={match}
                onChange={this.handleMatch}
                label={t("Search")}
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
          <Paper className={classes.tablePaper} elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {this.columns.map(column =>
                    <TableCell key={column.value}>
                      <TableSortLabel
                        active={orderBy === column.value}
                        align="left" 
                        direction={orderBy === column.value ? order : 'asc'}
                        onClick={this.handleRequestSort(column.value)}
                      >
                        {t(column.label)}
                      </TableSortLabel>
                    </TableCell>
                  )}
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.Groups.map((obj, idx) =>
                  <TableRow key={idx} hover onClick={this.handleEdit(obj)}>
                    <TableCell>{obj.name}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={this.handleDelete(obj)}>
                        <Delete color="error"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {(groups.Groups.length < groups.count) && <Grid container justify="center">
              <CircularProgress color="primary" className={classes.circularProgress}/>
            </Grid>}
          </Paper>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: '' })}
          />
          <AddGroup
            open={adding}
            onSuccess={this.handleAddingSuccess}
            onError={this.handleAddingError}
            domain={domain}
            onClose={this.handleAddingClose}
          />
          <DomainDataDelete
            open={!!deleting}
            delete={this.props.delete}
            onSuccess={this.handleDeleteSuccess}
            onError={this.handleDeleteError}
            onClose={this.handleDeleteClose}
            item={deleting.name}
            id={deleting.ID}
            domainID={domain.ID}
          />
        </div>
      </div>
    );
  }
}

Groups.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  groups: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { groups: state.groups };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, params) => {
      await dispatch(fetchGroupsData(domainID, params)).catch(error => Promise.reject(error));
    },
    delete: async (domainID, id) => {
      await dispatch(deleteGroupData(domainID, id)).catch(error => Promise.reject(error));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Groups)));
