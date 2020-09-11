import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Snackbar, Portal } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Close';
import { connect } from 'react-redux';
import { fetchDomainData, deleteDomainData } from '../actions/domains';
import TopBar from '../components/TopBar';
import Alert from '@material-ui/lab/Alert';
import AddDomain from '../components/Dialogs/AddDomain';
import GeneralDelete from '../components/Dialogs/GeneralDelete';

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

class DomainList extends Component {

  state = {
    snackbar: null,
    adding: false,
    deleting: false,
  }

  componentDidMount() {
    this.props.fetch()
      .catch(msg => this.setState({ snackbar: msg }));
  }

  fetchDomains() {
    this.props.fetch()
      .catch(msg => this.setState({ snackbar: msg }));
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleEdit = domain => () => {
    this.props.history.push('/domainList/' + domain.ID, { ...domain });
  }

  handleDelete = domain => () => this.setState({ deleting: domain });

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
    this.fetchDomains();
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteError = error => this.setState({ snackbar: error });

  render() {
    const { classes, domains } = this.props;

    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title="Domain List"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper} elevation={2}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Domain</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Ttitle</TableCell>
                  <TableCell>Maximum space</TableCell>
                  <TableCell>Maximum users</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {domains.Domains.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.domainname}</TableCell>
                    <TableCell>{obj.address}</TableCell>
                    <TableCell>{obj.title}</TableCell>
                    <TableCell>{obj.maxSize}</TableCell>
                    <TableCell>{obj.maxUser}</TableCell>
                    <TableCell className={classes.flexRowEnd}>
                      <IconButton onClick={this.handleEdit}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={this.handleDelete(obj)}>
                        <Delete color="error"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
          <Portal>
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
          </Portal>
        </div>
        <AddDomain
          open={this.state.adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
        />
        <GeneralDelete
          open={!!this.state.deleting}
          delete={this.props.delete}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
          item={this.state.deleting.domainname}
          id={this.state.deleting.ID}
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
    fetch: async () => {
      await dispatch(fetchDomainData()).catch(error => Promise.reject(error));
    },
    delete: async id => {
      await dispatch(deleteDomainData(id)).catch(error => Promise.reject(error));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DomainList)));