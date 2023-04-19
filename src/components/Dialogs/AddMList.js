// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
  MenuItem,
  FormControlLabel,
  Checkbox, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addMListData } from '../../actions/mlists';
import { fetchPlainUsersData } from '../../actions/users';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';

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

class AddMList extends PureComponent {

  state = {
    listname: '',
    displayname: '',
    hidden: 0,
    listType: 0,
    listPrivilege: 0,
    associations: [],
    specifieds: [],
    loading: false,
    autocompleteInput: '',
  }

  listTypes = [
    { ID: 0, name: "Normal" },
    { ID: 2, name: "Domain" },
  ]

  listPrivileges = [
    { ID: 0, name: "All" },
    { ID: 1, name: "Internal" },
    { ID: 2, name: "Domain" },
    { ID: 3, name: "Specific" },
    { ID: 4, name: "Outgoing" },
  ]

  handleEnter = () => {
    const { fetch, onError, domain } = this.props;
    fetch(domain.ID)
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleTypeChange = event => {
    const { associations } = this.state;
    const val = event.target.value;
    this.setState({
      listType: val,
      associations: val === 0 ? associations : [], /* Associations only available if type "all" */
    });
  }

  handlePrivilegeChange = event => {
    const { specifieds } = this.state;
    const val = event.target.value;
    this.setState({
      listPrivilege: val,
      specifieds: val === 3 ? specifieds : [], /* Specifieds only available if privilege "specific" */
    });
  }

  handleAdd = () => {
    const { add, domain, onSuccess, onError } = this.props;
    const { listname, hidden, displayname, listType, listPrivilege, associations, specifieds } = this.state;
    this.setState({ loading: true });
    add(domain.ID, {
      listname,
      listType,
      listPrivilege,
      hidden,
      displayname,
      /* Strip whitespaces and split on ',' */
      associations: associations.length > 0 ? associations.map(user => user.username) : undefined, 
      specifieds: specifieds.length > 0 ? specifieds.map(user => user.username) : undefined,
    })
      .then(() => {
        this.setState({
          listname: '',
          listType: 0,
          hidden: 0,
          displayname: '',
          listPrivilege: 0,
          associations: '',
          specifieds: '',
          loading: false,
          autocompleteInput: '',
        });
        onSuccess();
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  handleCheckbox = field => (e) => this.setState({ [field]: e.target.checked ? 1 : 0 });

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      [field]: newVal || '',
    });
  }

  render() {
    const { classes, t, open, onClose, Users } = this.props;
    const { listname, displayname, hidden, listType, listPrivilege, associations, specifieds, loading } = this.state;
    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="md"
        fullWidth
        TransitionProps={{
          onEnter: this.handleEnter,
        }}>
        <DialogTitle>{t('addHeadline', { item: 'Group' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Group name")} 
              fullWidth 
              value={listname || ''}
              onChange={this.handleInput('listname')}
              autoFocus
              required
            />
            <TextField 
              className={classes.input} 
              label={t("Displayname")} 
              fullWidth 
              value={displayname}
              onChange={this.handleInput('displayname')}
            />
            <FormControlLabel
              className={classes.input} 
              control={
                <Checkbox
                  checked={hidden === 1}
                  onChange={this.handleCheckbox('hidden')}
                  color="primary"
                />
              }
              label={t('Hide from addressbook')}
            />
            <TextField
              select
              className={classes.input}
              label={t("Type")}
              fullWidth
              value={listType || 0}
              onChange={this.handleTypeChange}
            >
              {this.listTypes.map((status, key) => (
                <MenuItem key={key} value={status.ID}>
                  {t(status.name)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              className={classes.input}
              label={t("Privilege")}
              fullWidth
              value={listPrivilege || 0}
              onChange={this.handlePrivilegeChange}
            >
              {this.listPrivileges.map((status, key) => (
                <MenuItem key={key} value={status.ID}>
                  {t(status.name)}
                </MenuItem>
              ))}
            </TextField>
            {listType === 0 && <MagnitudeAutocomplete
              multiple
              value={associations || []}
              filterAttribute={'username'}
              onChange={this.handleAutocomplete('associations')}
              className={classes.input} 
              options={Users || []}
              placeholder={t("Search users") +  "..."}
              label={t('Recipients')}
            />}
            {listPrivilege === 3 && <MagnitudeAutocomplete
              multiple
              value={specifieds || []}
              filterAttribute={'username'}
              onChange={this.handleAutocomplete('specifieds')}
              className={classes.input} 
              options={Users || []}
              placeholder={t("Search users") +  "..."}
              label={t('Senders')}
            />}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            color="secondary"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={loading || !listname}
          >
            {loading ? <CircularProgress size={24}/> : t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddMList.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  domain: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  Users: PropTypes.array.isRequired,
  fetch: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Users: state.users.Users,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, mList) => {
      await dispatch(addMListData(domainID, mList))
        .catch(message => Promise.reject(message));
    },
    fetch: async (domainID) => await dispatch(fetchPlainUsersData(domainID))
      .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddMList)));
