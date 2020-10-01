import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Snackbar } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Close';
import { connect } from 'react-redux';
import TopBar from '../components/TopBar';
import { fetchFolderData, deleteFolderData } from '../actions/folders';
import AddFolder from '../components/Dialogs/AddFolder';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';
import Alert from '@material-ui/lab/Alert';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
    overflowY: 'auto',
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
});

class Folders extends Component {

  state = {
    adding: false,
    deleting: false,
    snackbar: null,
  }

  componentDidMount() {
    this.fetchFolders();
  }

  fetchFolders() {
    const { fetch, domain } = this.props;
    fetch(domain.ID);
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleDelete = folder => () => {
    this.setState({ deleting: folder });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
    this.fetchFolders();
  }

  handleDeleteError = error => this.setState({ snackbar: error });

  handleEdit = folder => () => {
    const { history, domain } = this.props;
    history.push('/' + domain.domainname + '/folders/' + folder.folderid, { ...folder });
  }

  render() {
    const { classes, t, folders, domain } = this.props;

    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title="Folders"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper} elevation={2}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('Folder name')}</TableCell>
                  <TableCell>{t('Comment')}</TableCell>
                  <TableCell>{t('Creation time')}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!folders.loading && folders.Folders.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.displayname}</TableCell>
                    <TableCell>{obj.comment}</TableCell>
                    <TableCell>{obj.creationtime}</TableCell>
                    <TableCell className={classes.flexRowEnd}>
                      <IconButton onClick={this.handleDelete(obj)}>
                        <Delete color="error"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
          <Snackbar
            open={!!this.state.snackbar}
            onClose={() => this.setState({ snackbar: '' })}
            autoHideDuration={this.state.snackbar === 'Success!' ? 1000 : 6000}
            transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
          >
            <Alert
              onClose={() => this.setState({ snackbar: '' })}
              severity={this.state.snackbar === 'Success!' ? "success" : "error"}
              elevation={6}
              variant="filled"
            >
              {this.state.snackbar}
            </Alert>
          </Snackbar>
        </div>
        <AddFolder
          open={this.state.adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          domain={this.props.domain}
        />
        <DomainDataDelete
          open={!!this.state.deleting}
          delete={this.props.delete}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
          item={this.state.deleting.displayname}
          id={this.state.deleting.folderid}
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
    fetch: async (domainID) => {
      await dispatch(fetchFolderData(domainID)).catch(msg => Promise.reject(msg));
    },
    delete: async (domainID, id) => {
      await dispatch(deleteFolderData(domainID, id)).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Folders)));