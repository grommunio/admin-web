// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Typography, Button, Grid, TableSortLabel, CircularProgress,
  TextField, InputAdornment } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Delete';
import Search from '@material-ui/icons/Search';
import { connect } from 'react-redux';
import { fetchFolderData, deleteFolderData } from '../actions/folders';
import AddFolder from '../components/Dialogs/AddFolder';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';
import { DOMAIN_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import TableViewContainer from '../components/TableViewContainer';

const styles = theme => ({
  tablePaper: {
    margin: theme.spacing(3, 2),
    borderRadius: 6,
  },
  buttonGrid: {
    margin: theme.spacing(0, 2, 2, 2),
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
  count: {
    marginLeft: 16,
  },
});

class Folders extends Component {

  state = {
    adding: false,
    deleting: false,
    snackbar: null,
    order: 'asc',
    offset: 50,
    match: '',
    sortedFolders: [],
  }

  handleScroll = () => {
    const { folders } = this.props;
    if((folders.Folders.length >= folders.count)) return;
    if (
      Math.floor(document.getElementById('scrollDiv').scrollHeight - document.getElementById('scrollDiv').scrollTop)
      <= document.getElementById('scrollDiv').offsetHeight + 20
    ) {
      const { offset } = this.state;
      if(!folders.loading) this.fetchFolders({ offset });
      this.setState({
        offset: offset + 50,
      });
    }
  }

  componentDidMount() {
    this.fetchFolders({});
  }

  fetchFolders(params) {
    const { fetch, domain } = this.props;
    fetch(domain.ID, params)
      .then(this.handleSort(false))
      .catch(error => this.setState({ snackbar: error }));
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => {
    this.setState({ adding: false, snackbar: 'Success!' }, this.handleSort(false));
  }

  handleAddingError = error => this.setState({ snackbar: error });

  handleAddingClose = () => this.setState({ adding: false });

  handleDelete = folder => event => {
    event.stopPropagation();
    this.setState({ deleting: folder });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' }, this.handleSort(false));
  }

  handleDeleteError = error => this.setState({ snackbar: error });

  handleRowClicked = folder => () => {
    const { history, domain } = this.props;
    history.push('/' + domain.ID + '/folders/' + folder.folderid, { ...folder });
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleMatch = e => {
    const { value } = e.target;
    this.setState({ match: value });
  }

  handleSort = switchOrder => () => {
    const sortedFolders = [...this.props.folders.Folders];
    const { order: stateOrder } = this.state;
    const order = stateOrder === 'asc' ? 'desc' : 'asc';
    if((switchOrder && order === 'asc') || (!switchOrder && stateOrder === 'asc')) {
      sortedFolders.sort((a, b) => a.displayname.localeCompare(b.displayname));
    } else {
      sortedFolders.sort((a, b) => b.displayname.localeCompare(a.displayname));
    }
    this.setState({ sortedFolders, order: switchOrder ? order : stateOrder });
  }

  render() {
    const { classes, t, folders, domain } = this.props;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { snackbar, adding, deleting, order, match } = this.state;
    const { sortedFolders } = this.state;

    return (
      <TableViewContainer
        headline={t("Folders")}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleAdd}
            disabled={!writable}
          >
            {t('New folder')}
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
                    <Search />
                  </InputAdornment>
                ),
              }}
              color="primary"
            />
          </div>
        </Grid>
        <Typography className={classes.count} color="textPrimary">
          {t("showingFolders", { count: sortedFolders.length })}
        </Typography>
        <Paper className={classes.tablePaper} elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active
                    align="left" 
                    direction={order}
                    onClick={this.handleSort(true)}
                  >
                    {t('Folder name')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>{t('Comment')}</TableCell>
                <TableCell>{t('Creation time')}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedFolders.filter(f => f.displayname.toLowerCase().includes(match.toLowerCase())).map((obj, idx) =>
                <TableRow hover onClick={this.handleRowClicked(obj)} key={idx}>
                  <TableCell>{obj.displayname}</TableCell>
                  <TableCell>{obj.comment}</TableCell>
                  <TableCell>{obj.creationtime}</TableCell>
                  <TableCell align="right">
                    {writable && <IconButton onClick={this.handleDelete(obj)}>
                      <Delete color="error"/>
                    </IconButton>}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {(folders.Folders.length < folders.count) && <Grid container justify="center">
            <CircularProgress color="primary" className={classes.circularProgress}/>
          </Grid>}
        </Paper>
        <AddFolder
          open={adding}
          onClose={this.handleAddingClose}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          domain={domain}
        />
        <DomainDataDelete
          open={!!deleting}
          delete={this.props.delete}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
          item={deleting.displayname}
          id={deleting.folderid}
          domainID={domain.ID}
        />
      </TableViewContainer>
    );
  }
}

Folders.contextType = CapabilityContext;
Folders.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  folders: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { folders: state.folders };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, params) => {
      await dispatch(fetchFolderData(domainID, params)).catch(msg => Promise.reject(msg));
    },
    delete: async (domainID, id) => {
      await dispatch(deleteFolderData(domainID, id)).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Folders)));
