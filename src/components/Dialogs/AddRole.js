// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress, Grid, IconButton, InputLabel, Select, Input, 
} from '@material-ui/core';
import Delete from '@material-ui/icons/Close';
import Add from '@material-ui/icons/AddCircle';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { fetchDomainData } from '../../actions/domains';
import { fetchAllUsers } from '../../actions/users';
import { addRolesData, fetchPermissionsData } from '../../actions/roles';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
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

class AddRole extends PureComponent {

  state = {
    name: '',
    description: '',
    permissions: [{ permission: '', params: '' }],
    users: [],
    loading: false,
  }

  componentDidMount() {
    const { fetch, fetchDomains, fetchUsers } = this.props;
    fetch()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
    fetchDomains()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
    fetchUsers()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleCheckbox = field => event => this.setState({
    [field]: event.target.checked,
  });

  handleAdd = () => {
    const { add, onSuccess, onError } = this.props;
    this.setState({ loading: true });
    add({
      ...this.state,
      loading: undefined,
      permissions: this.state.permissions.map(permission => {
        const params = permission.params;
        return {
          ...permission,
          params: params === '*' || params === '' ? params : parseInt(params),
        };
      }),
    })
      .then(() => {
        this.setState({
          name: '',
          description: '',
          permissions: [{ permission: '', params: '' }],
          loading: false,
        });
        onSuccess();
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  handleSelectPermission = idx => event => {
    const copy = [...this.state.permissions];
    const input = event.target.value;
    copy[idx].permission = input;
    if(input === 'SystemAdmin') {
      copy[idx].params = '';
    }
    this.setState({ permissions: copy });
  }

  handleSetParams = idx => event => {
    const copy = [...this.state.permissions];
    copy[idx].params = event.target.value;
    this.setState({ permissions: copy });
  }

  handleNewRow = () => {
    const copy = [...this.state.permissions];
    copy.push({ permission: '', params: '' });
    this.setState({ permissions: copy });
  }

  removeRow = idx => () => {
    const copy = [...this.state.permissions];
    copy.splice(idx, 1);
    this.setState({ permissions: copy });
  }

  render() {
    const { classes, t, open, onSuccess, Permissions, Domains, Users } = this.props;
    const { name, permissions, description, loading, users } = this.state;

    return (
      <Dialog
        onClose={onSuccess}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('addHeadline', { item: 'Role' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              label={t("Name")}
              value={name}
              onChange={this.handleInput('name')}
              className={classes.input}
              autoFocus
            />
            {permissions.map((permission, idx) =>
              <div key={permission} className={classes.row}>
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
                  disabled={['SystemAdmin', ''].includes(permission.permission)}
                  className={classes.rowTextfield}
                  select
                >
                  {Domains.map(domain => (
                    <MenuItem key={domain.ID} value={domain.ID}>
                      {domain.domainname}
                    </MenuItem>
                  ))}
                </TextField>
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
            <FormControl className={classes.input}>
              <InputLabel id="demo-mutiple-chip-label">{t("Users")}</InputLabel>
              <Select
                labelId="demo-mutiple-chip-label"
                id="demo-mutiple-chip"
                multiple
                fullWidth
                value={users || []}
                onChange={this.handleInput('users')}
                input={<Input id="select-multiple-chip" />}
              >
                {Users.map((user, key) => (
                  <MenuItem
                    key={key}
                    value={user.ID}
                    selected={users.find(u => u.ID === user.ID)}
                  >
                    {user.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField 
              className={classes.input} 
              label={t("Description")} 
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={this.handleInput('description')}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onSuccess}
            variant="contained"
          >
            Cancel
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={!name || loading || permissions.length === 0 || !permissions[0].permission}
          >
            {loading ? <CircularProgress size={24}/> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddRole.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  Permissions: PropTypes.array.isRequired,
  fetch: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  Domains: PropTypes.array.isRequired,
  Users: PropTypes.array.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Permissions: state.roles.Permissions,
    Domains: state.domains.Domains,
    Users: state.users.Users,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => {
      await dispatch(fetchPermissionsData({ limit: ''})).catch(err => Promise.reject(err));
    },
    fetchDomains: async () => await dispatch(fetchDomainData({ limit: '' }))
      .catch(err => Promise.reject(err)),
    fetchUsers: async () => await dispatch(fetchAllUsers({ sort: 'username,asc', limit: '' }))
      .catch(err => Promise.reject(err)),
    add: async role => {
      await dispatch(addRolesData(role)).catch(err => Promise.reject(err));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddRole)));
