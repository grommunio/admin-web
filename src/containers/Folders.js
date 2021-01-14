// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Snackbar, Typography, Button, Grid, TableSortLabel, CircularProgress,
  TextField, InputAdornment, Portal } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Delete';
import Search from '@material-ui/icons/Search';
import { connect } from 'react-redux';
import TopBar from '../components/TopBar';
import { fetchFolderData, deleteFolderData } from '../actions/folders';
import AddFolder from '../components/Dialogs/AddFolder';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';
import Alert from '@material-ui/lab/Alert';
import HomeIcon from '@material-ui/icons/Home';
import blue from '../colors/blue';
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
    match: '',
  },
});

class Folders extends Component {

  state = {
    adding: false,
    deleting: false,
    snackbar: null,
    order: 'asc',
    offset: 50,
  }

  handleScroll = () => {
    const { folders } = this.props;
    if((folders.Folders.length >= folders.count)) return;
    if (
      Math.floor(document.getElementById('scrollDiv').scrollHeight - document.getElementById('scrollDiv').scrollTop)
      <= document.getElementById('scrollDiv').offsetHeight + 20
    ) {
      const { offset, match } = this.state;
      if(!folders.loading) this.fetchFolders({ offset });
      this.setState({
        offset: offset + 50,
        match: match || undefined,
      });
    }
  }

  componentDidMount() {
    this.fetchFolders({});
  }

  fetchFolders(params) {
    const { fetch, domain } = this.props;
    fetch(domain.ID, params).catch(error => this.setState({ snackbar: error }));
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleDelete = folder => event => {
    event.stopPropagation();
    this.setState({ deleting: folder });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteSuccess = () => this.setState({ deleting: false, snackbar: 'Success!' });

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

  handleSort = () => this.setState({ order: this.state.order === 'asc' ? 'desc' : 'asc' })

  handleMatch = e => {
    const { value } = e.target;
    this.debouceFetch(value);
    this.setState({ match: value });
  }

  debouceFetch = debounce(value => {
    const { order } = this.state;
    this.fetchFolders({ match: value || undefined, sort: 'name,' + order });
  }, 200)

  render() {
    const { classes, t, folders, domain } = this.props;
    const { snackbar, adding, deleting, order, match } = this.state;
    const sortedArray = [...folders.Folders].sort();
    if(order === 'desc') sortedArray.reverse();

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
            {t("Folders")}
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon onClick={this.handleNavigation('')} className={classes.homeIcon}></HomeIcon>
          </Typography>
          <Grid container alignItems="flex-end" className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleAdd}
            >
              {t('New folder')}
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
                  <TableCell>
                    <TableSortLabel
                      active
                      align="left" 
                      direction={order}
                      onClick={this.handleSort}
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
                {!folders.loading && sortedArray.map((obj, idx) =>
                  <TableRow hover onClick={this.handleRowClicked(obj)} key={idx}>
                    <TableCell>{obj.displayname}</TableCell>
                    <TableCell>{obj.comment}</TableCell>
                    <TableCell>{obj.creationtime}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={this.handleDelete(obj)}>
                        <Delete color="error"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {(folders.Folders.length < folders.count) && <Grid container justify="center">
              <CircularProgress color="primary" className={classes.circularProgress}/>
            </Grid>}
          </Paper>
          <Portal>
            <Snackbar
              open={!!snackbar}
              onClose={() => this.setState({ snackbar: '' })}
              autoHideDuration={snackbar === 'Success!' ? 1000 : 6000}
              transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
            >
              <Alert
                onClose={() => this.setState({ snackbar: '' })}
                severity={snackbar === 'Success!' ? "success" : "error"}
                elevation={6}
                variant="filled"
              >
                {snackbar}
              </Alert>
            </Snackbar>
          </Portal>
        </div>
        <AddFolder
          open={adding}
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
      </div>
    );
  }
}

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
