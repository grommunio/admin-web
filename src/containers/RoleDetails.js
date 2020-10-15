import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  Button,
  Snackbar,
  InputLabel,
  Select,
  Input,
  Chip,
  MenuItem,
  IconButton,
} from '@material-ui/core';
import { fetchAllUsers } from '../actions/users';
import { connect } from 'react-redux';
import TopBar from '../components/TopBar';
import Alert from '@material-ui/lab/Alert';
import Add from '@material-ui/icons/AddCircle';
import Delete from '@material-ui/icons/Close';
import { fetchPermissionsData, editRoleData } from '../actions/roles';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    padding: theme.spacing(2, 2),
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    overflowY: 'scroll',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  select: {
    minWidth: 60,
  },
  rowTextfield: {
    margin: theme.spacing(0, 1, 0, 1),
  },
  row: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  addButton: {
    marginTop: 8,
  },
});

class RoleDetails extends PureComponent {

  constructor(props) {
    super(props);
    const role = this.props.location.state;
    if(!role) {
      this.props.history.push('/roles');
      this.state = {
        changes: {},
      };
    }
    else this.state = {
      changes: role,
      snackbar: null,
    };
  }


  componentDidMount() {
    this.props.fetchUser().catch(err => this.setState({ snackbar: err }));
    this.props.fetchPermissions().catch(err => this.setState({ snackbar: err }));
  }

  handleInput = field => event => {
    this.setState({
      changes: {
        ...this.state.changes,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleEdit = () => {
    const { changes } = this.state;
    this.props.edit({
      ...changes,
      users: changes.users.map(user => user.ID),
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleSelectPermission = idx => event => {
    const copy = [...this.state.changes.permissions];
    const input = event.target.value;
    copy[idx].permission = input;
    if(input === 'SystemAdmin') {
      copy[idx].params = '';
    }
    this.setState({
      changes: {
        ...this.state.changes,
        permissions: copy,
      },
    });
  }

  handleSetParams = idx => event => {
    const copy = [...this.state.changes.permissions];
    copy[idx].params = event.target.value;
    this.setState({
      changes: {
        ...this.state.changes,
        permissions: copy,
      },
    });
  }

  handleNewRow = () => {
    const copy = [...this.state.changes.permissions];
    copy.push({ permission: '', params: '' });
    this.setState({
      changes: {
        ...this.state.changes,
        permissions: copy,
      },
    });
  }

  removeRow = idx => () => {
    const copy = [...this.state.changes.permissions];
    copy.splice(idx, 1);
    this.setState({
      changes: {
        ...this.state.changes,
        permissions: copy,
      },
    });
  }

  render() {
    const { classes, t, Users, Permissions } = this.props;
    const { snackbar, changes } = this.state;
    const { name, description, users, permissions } = changes;

    return (
      <div className={classes.root}>
        <TopBar title={t("Domain list")}/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={1}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {t('editHeadline', { item: 'Role' })}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("Name")} 
                fullWidth
                autoFocus
                value={name || ''}
                onChange={this.handleInput('name')}
              />
              <TextField 
                className={classes.input} 
                label={t("Description")} 
                fullWidth
                multiline
                rows={4}
                value={description || ''}
                onChange={this.handleInput('description')}
              />
              <FormControl className={classes.input}>
                <InputLabel id="demo-mutiple-chip-label">{t('Roles')}</InputLabel>
                <Select
                  labelId="demo-mutiple-chip-label"
                  id="demo-mutiple-chip"
                  multiple
                  value={users || []}
                  onChange={this.handleInput('users')}
                  input={<Input id="select-multiple-chip" />}
                  renderValue={selected => 
                    <div className={classes.chips}>
                      {selected.map(value => 
                        <Chip key={value.ID} label={value.username} className={classes.chip} />
                      )}
                    </div>
                  }
                >
                  {(Users || []).map(user => (
                    <MenuItem selected={users.includes(user)} key={user.ID} value={user}>
                      {user.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {(permissions || []).map((permission, idx) =>
                <div key={idx} className={classes.row}>
                  <TextField
                    select
                    label={t("Permission")}
                    value={permission.permission || ''}
                    onChange={this.handleSelectPermission(idx)}
                    fullWidth
                  >
                    {Permissions.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField 
                    label={t("Params")}
                    value={permission.params}
                    onChange={this.handleSetParams(idx)}
                    fullWidth
                    disabled={permission.permission === 'SystemAdmin'}
                    className={classes.rowTextfield}
                  />
                  <IconButton size="small" onClick={this.removeRow(idx)}>
                    <Delete fontSize="small" color="error" />
                  </IconButton>
                </div>
              )}
              <Grid container justify="center" className={classes.addButton}>
                <Button size="small" onClick={this.handleNewRow}>
                  <Add color="primary" />
                </Button>
              </Grid>
            </FormControl>
            <Button
              variant="text"
              color="secondary"
              onClick={() => this.props.history.push('/roles')}
              style={{ marginRight: 8 }}
            >
              {t('Back')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleEdit}
            >
              {t('Save')}
            </Button>
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
      </div>
    );
  }
}

RoleDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  fetchUser: PropTypes.func.isRequired,
  fetchPermissions: PropTypes.func.isRequired,
  Users: PropTypes.array.isRequired,
  Permissions: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    Users: state.users.Users,
    Permissions: state.roles.Permissions,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async role => {
      await dispatch(editRoleData(role)).catch(message => Promise.reject(message));
    },
    fetchUser: async () => {
      await dispatch(fetchAllUsers()).catch(message => Promise.reject(message));
    },
    fetchPermissions: async () => {
      await dispatch(fetchPermissionsData()).catch(message => Promise.reject(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(RoleDetails)));