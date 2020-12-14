// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  Button, DialogActions, CircularProgress, MenuItem, 
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addOwnerData } from '../../actions/folders';
import { fetchUsersData } from '../../actions/users';

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
});

class AddOwner extends PureComponent {

  state = {
    username: '',
    loading: false,
  }

  componentDidMount() {
    const { fetchUsers, domain } = this.props;
    fetchUsers(domain.ID)
      .catch(() => {
        this.setState({ loading: false });
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
    const { add, onSuccess, onError, domain, folderID } = this.props;
    this.setState({ loading: true });
    add(domain.ID, folderID, { username: this.state.username })
      .then(() => {
        this.setState({
          username: '',
          loading: false,
        });
        onSuccess();
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  render() {
    const { classes, t, users, open, onSuccess } = this.props;
    const { username, loading } = this.state;

    return (
      <Dialog
        onClose={onSuccess}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('addHeadline', { item: 'Owner' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField
              autoFocus
              select
              className={classes.input}
              label={t("Username")}
              fullWidth
              value={username || ''}
              onChange={this.handleInput('username')}
            >
              {users.map((user, key) => (
                <MenuItem key={key} value={user.username} /* highly unconventional, should be changed to ID @f */>
                  {user.username}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onSuccess}
            variant="contained"
            color="secondary"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={!username || loading}
          >
            {loading ? <CircularProgress size={24}/> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddOwner.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  folderID: PropTypes.number.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
  return {
    users: state.users.Users,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, folderID, username) => {
      await dispatch(addOwnerData(domainID, folderID, username)).catch(msg => Promise.reject(msg));
    },
    fetchUsers: async domainID => {
      await dispatch(fetchUsersData(domainID, { sort: 'username,asc' })).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddOwner)));
