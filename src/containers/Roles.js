import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Snackbar, IconButton,
  Typography, Button, Grid, TableSortLabel } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Delete from '@material-ui/icons/Close';
import TopBar from '../components/TopBar';
import { connect } from 'react-redux';
import { fetchRolesData, deleteRolesData } from '../actions/roles';
import AddRoles from '../components/Dialogs/AddRole';
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
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  tablePaper: {
    margin: theme.spacing(3, 2),
  },
  paperHeading: {
    margin: theme.spacing(-1, 0, 0, 2),
  },
  grid: {
    padding: theme.spacing(0, 2),
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  flexRowEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  select: {
    minWidth: 60,
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

class Roles extends Component {

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
    const { order: stateOrder } = this.state;
    const order = stateOrder === "asc" ? "desc" : "asc";
    
    fetch({
      sort: 'name,' + order,
    }).catch(msg => this.setState({ snackbar: msg }));

    this.setState({
      order: order,
    });
  }

  handleAddingSuccess = () => this.setState({ adding: false });

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

  render() {
    const { classes, t, Roles } = this.props;
    const { adding, snackbar, deleting, order } = this.state;

    return (
      <div className={classes.root}>
        <TopBar/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Roles")}
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon onClick={this.handleNavigation('')} className={classes.homeIcon}></HomeIcon>
          </Typography>
          <Grid className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.setState({ adding: true })}
            >
              {t("New role")}
            </Button>
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
                      onClick={this.handleRequestSort}
                    >
                      {t('Name')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t('Description')}</TableCell>
                  <TableCell>{t('Permissions')}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Roles.map((obj, idx) =>
                  <TableRow key={idx} hover onClick={this.handleEdit(obj)}>
                    <TableCell>{obj.name}</TableCell>
                    <TableCell>{obj.description}</TableCell>
                    <TableCell>{obj.permissions.map(perm => perm.permission).toString()}</TableCell>
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
  Roles: PropTypes.array.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Roles: state.roles.Roles,
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