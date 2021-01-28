// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Checkbox, FormControlLabel, Typography, Button, Grid, TableSortLabel, CircularProgress, TextField, 
  InputAdornment } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Delete';
import Search from '@material-ui/icons/Search';
import { connect } from 'react-redux';
import { fetchDomainData, deleteDomainData } from '../actions/domains';
import TopBar from '../components/TopBar';
import AddDomain from '../components/Dialogs/AddDomain';
import GeneralDelete from '../components/Dialogs/GeneralDelete';
import HomeIcon from '@material-ui/icons/Home';
import blue from '../colors/blue';
import debounce from 'debounce';
import Feedback from '../components/Feedback';

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
  tools: {
    margin: theme.spacing(0, 2, 2, 2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  actions: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  deletedDomain: {
    backgroundColor: '#22242f',
  },
});

class DomainList extends Component {

  state = {
    snackbar: null,
    showDeleted: false,
    adding: false,
    deleting: false,
    orderBy: 'domainname',
    order: 'asc',
    match: '',
    offset: 50,
  }

  columns = [
    { label: 'Domain', value: 'domainname' },
    { label: 'Address', value: 'address' },
    { label: 'Title', value: 'title' },
    { label: 'Maximum users', value: 'maxUser' },
  ]

  handleScroll = () => {
    const { domains } = this.props;
    if((domains.Domains.length >= domains.count)) return;
    if (
      Math.floor(document.getElementById('scrollDiv').scrollHeight - document.getElementById('scrollDiv').scrollTop)
      <= document.getElementById('scrollDiv').offsetHeight + 20
    ) {
      const { orderBy, order, offset, match } = this.state;
      if(!domains.loading) this.fetchDomains({
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
    this.fetchDomains({ sort: 'domainname,asc' });
  }

  fetchDomains(params) {
    this.props.fetch(params)
      .catch(msg => this.setState({ snackbar: msg }));
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
      orderBy: orderBy,
      offset: 0,
    });
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleEdit = domain => event => {
    this.props.history.push('/domainList/' + domain.ID, { ...domain });
    event.stopPropagation();
  }

  handleDelete = domain => event => {
    event.stopPropagation();
    this.setState({ deleting: domain });
  }

  handleDeleteSuccess = () => this.setState({ deleting: false, snackbar: 'Success!' });

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteError = error => this.setState({ snackbar: error });

  handleCheckbox = field => event => this.setState({
    [field]: event.target.checked,
  });

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
    const { order, orderBy } = this.state;
    this.fetchDomains({ match: value || undefined, sort: orderBy + ',' + order });
  }, 200)

  render() {
    const { classes, t, domains } = this.props;
    const { showDeleted, snackbar, adding, deleting, order, orderBy, match } = this.state;

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
            {t("Domain list")}
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon onClick={this.handleNavigation('')} className={classes.homeIcon}></HomeIcon>
          </Typography>
          <div className={classes.tools}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleAdd}
            >
              {t('New domain')}
            </Button>
            <div className={classes.actions}>
              <FormControlLabel
                label={t('Show deleted')}
                control={
                  <Checkbox
                    checked={showDeleted || false}
                    onChange={this.handleCheckbox('showDeleted')}
                  />
                }
              />
              <TextField
                value={match}
                onChange={this.handleMatch}
                placeholder={t("search domains")}
                variant={"outlined"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search/>
                    </InputAdornment>
                  ),
                }}
                color="primary"
              />
            </div>
          </div>
          <Paper elevation={1}>
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
                  <TableCell padding="checkbox" />
                </TableRow>
              </TableHead>
              <TableBody>
                {domains.Domains.map((obj, idx) => {
                  return (obj.domainType === 1) || (obj.domainStatus === 3 && !showDeleted) ?
                    null : <TableRow
                      key={idx}
                      hover
                      onClick={this.handleEdit(obj)}
                    >
                      <TableCell>{obj.domainname} {obj.domainStatus === 3 ? `[${t('Deleted')}]` : ''}</TableCell>
                      <TableCell>{obj.address}</TableCell>
                      <TableCell>{obj.title}</TableCell>
                      <TableCell>{obj.maxUser}</TableCell>
                      <TableCell align="right">
                        {!obj.domainStatus /*If not deleted*/ && <IconButton onClick={this.handleDelete(obj)}>
                          <Delete color="error"/>
                        </IconButton>}
                      </TableCell>
                    </TableRow>;
                })}
              </TableBody>
            </Table>
            {(domains.Domains.length < domains.count) && <Grid container justify="center">
              <CircularProgress color="primary" className={classes.circularProgress}/>
            </Grid>}
          </Paper>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: '' })}
          />
        </div>
        <AddDomain
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
          item={deleting.domainname}
          id={deleting.ID}
        />
      </div>
    );
  }
}

DomainList.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domains: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { domains: state.domains };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async params => {
      await dispatch(fetchDomainData(params)).catch(error => Promise.reject(error));
    },
    delete: async id => {
      await dispatch(deleteDomainData(id)).catch(error => Promise.reject(error));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DomainList)));
