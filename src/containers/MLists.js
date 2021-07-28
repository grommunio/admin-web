// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

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
import { fetchMListsData, deleteMListData } from '../actions/mlists';
import TopBar from '../components/TopBar';
import blue from '../colors/blue';
import Feedback from '../components/Feedback';
import { Delete } from '@material-ui/icons';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';
import AddMList from '../components/Dialogs/AddMList';
import { CapabilityContext } from '../CapabilityContext';
import { DOMAIN_ADMIN_WRITE } from '../constants';

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
  count: {
    marginLeft: 16,
  },
});

class MLists extends Component {

  state = {
    snackbar: null,
    adding: false,
    deleting: false,
    checking: false,
    order: 'asc',
    orderBy: 'listname',
    offset: 50,
    match: '',
  }

  columns = [
    { label: 'Mail list name', value: 'listname' },
    { label: 'Type', value: 'listType' },
    { label: 'Privilege', value: 'listPrivilege' },
  ]

  listTypes = ['Normal', 'Domain', 'Group']

  listPrivileges = ['All', 'Internal', 'Domain', 'Specific', 'Outgoing']

  handleScroll = () => {
    const { mLists } = this.props;
    if((mLists.MLists.length >= mLists.count)) return;
    if (
      Math.floor(document.getElementById('scrollDiv').scrollHeight - document.getElementById('scrollDiv').scrollTop)
      <= document.getElementById('scrollDiv').offsetHeight + 20
    ) {
      const { orderBy, order, offset, match } = this.state;
      if(!mLists.loading) this.fetchMLists({
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
    this.fetchMLists({ sort: 'listname,asc' });
  }

  fetchMLists(params) {
    const { fetch, domain } = this.props;
    fetch(domain.ID, params)
      .catch(msg => this.setState({ snackbar: msg }));
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ snackbar: 'Success!', adding: false });

  handleAddingClose = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleDelete = mList => event => {
    event.stopPropagation();
    this.setState({ deleting: mList });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
  }

  handleDeleteError = error => this.setState({ snackbar: error });

  handleEdit = mList => () => {
    const { history, domain } = this.props;
    history.push('/' + domain.ID + '/mailLists/' + mList.ID, { ...mList });
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
    this.fetchMLists({ match: value || undefined, sort: orderBy + ',' + order });
  }, 200)

  handleCheckClose = () => this.setState({ checking: false });

  render() {
    const { classes, t, mLists, domain } = this.props;
    const { snackbar, match, orderBy, order, adding, deleting } = this.state;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);

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
            {t("Mail lists")}
          </Typography>
          <Grid container alignItems="flex-end" className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleAdd}
              className={classes.newButton}
              disabled={!writable}
            >
              {t('New mail list')}
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
          <Typography className={classes.count} color="textPrimary">
            Showing {mLists.MLists.length} mail list(s)
          </Typography>
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
                {mLists.MLists.map((obj, idx) =>
                  <TableRow key={idx} hover onClick={this.handleEdit(obj)}>
                    <TableCell>{obj.listname}</TableCell>
                    <TableCell>{this.listTypes[obj.listType]}</TableCell>
                    <TableCell>{this.listPrivileges[obj.listPrivilege]}</TableCell>
                    <TableCell align="right">
                      {writable && <IconButton onClick={this.handleDelete(obj)}>
                        <Delete color="error"/>
                      </IconButton>}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {(mLists.MLists.length < mLists.count) && <Grid container justify="center">
              <CircularProgress color="primary" className={classes.circularProgress}/>
            </Grid>}
          </Paper>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: '' })}
          />
          <AddMList
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
            item={deleting.listname}
            id={deleting.ID}
            domainID={domain.ID}
          />
        </div>
      </div>
    );
  }
}

MLists.contextType = CapabilityContext;
MLists.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  mLists: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { mLists: state.mLists };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, params) => {
      await dispatch(fetchMListsData(domainID, params)).catch(error => Promise.reject(error));
    },
    delete: async (domainID, id) => {
      await dispatch(deleteMListData(domainID, id)).catch(error => Promise.reject(error));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(MLists)));
