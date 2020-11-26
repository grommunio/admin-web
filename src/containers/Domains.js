import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Snackbar, Portal,
  Checkbox, FormControlLabel, Typography, Button, Grid } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Close';
import { connect } from 'react-redux';
import { fetchDomainData, deleteDomainData } from '../actions/domains';
import TopBar from '../components/TopBar';
import Alert from '@material-ui/lab/Alert';
import AddDomain from '../components/Dialogs/AddDomain';
import GeneralDelete from '../components/Dialogs/GeneralDelete';
import HomeIcon from '@material-ui/icons/Home';
import blue from '../colors/blue';

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
});

class DomainList extends Component {

  state = {
    snackbar: null,
    showDeleted: false,
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

  handleEdit = domain => event => {
    this.props.history.push('/domainList/' + domain.ID, { ...domain });
    event.stopPropagation();
  }

  handleDelete = domain => () => this.setState({ deleting: domain });

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
    this.fetchDomains();
  }

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

  render() {
    const { classes, t, domains } = this.props;
    const { showDeleted, snackbar, adding, deleting } = this.state;

    return (
      <div className={classes.root}>
        <TopBar/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Domain list")}
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon onClick={this.handleNavigation('')} className={classes.homeIcon}></HomeIcon>
          </Typography>
          <Grid className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleAdd}
            >
              Add new domain
            </Button>
          </Grid>
          <Paper elevation={1}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>{t('Domain')}</TableCell>
                  <TableCell>{t('Address')}</TableCell>
                  <TableCell>{t('Title')}</TableCell>
                  <TableCell>{t('Maximum users')}</TableCell>
                  <TableCell style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <FormControlLabel
                      label={t('Show deleted')}
                      control={
                        <Checkbox
                          checked={showDeleted || false}
                          onChange={this.handleCheckbox('showDeleted')}
                        />
                      }
                    />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {domains.Domains.map((obj, idx) => {
                  return (obj.domainType === 1) || (obj.domainStatus === 3 && !showDeleted) ?
                    null : <TableRow key={idx} hover>
                      <TableCell>{obj.domainname}</TableCell>
                      <TableCell>{obj.address}</TableCell>
                      <TableCell>{obj.title}</TableCell>
                      <TableCell>{obj.maxUser}</TableCell>
                      <TableCell className={classes.flexRowEnd}>
                        <IconButton onClick={this.handleEdit(obj)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={this.handleDelete(obj)}>
                          <Delete color="error"/>
                        </IconButton>
                      </TableCell>
                    </TableRow>;
                })}
              </TableBody>
            </Table>
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