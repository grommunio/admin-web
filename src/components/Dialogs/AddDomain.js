// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions,
  CircularProgress, FormControlLabel, Checkbox,
} from '@material-ui/core';
import { addDomainData } from '../../actions/domains';
import { fetchOrgsData } from '../../actions/orgs';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { debounce } from 'debounce';
import { checkFormat } from '../../api';
import { Autocomplete } from '@material-ui/lab';
import { getAutocompleteOptions } from '../../utils';

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

class AddDomain extends PureComponent {

  state = {
    domainname: '',
    domainStatus: 0,
    maxUser: '',
    title: '',
    address: '',
    adminName: '',
    tel: '',
    orgID: '',
    createRole: false,
    loading: false,
    domainError: false,
    chat: false,
    autocompleteInput: '',
  }

  statuses = [
    { name: 'Activated', ID: 0 },
    { name: 'Deactivated', ID: 3 },
  ]

  handleEnter = () => {
    this.props.fetch().catch(error => this.props.onError(error));
  }

  handleInput = field => event => {
    const val = event.target.value;
    if(val && field === 'domainname') this.debounceFetch({ domain: val });
    this.setState({
      [field]: val,
    });
  }

  debounceFetch = debounce(async params => {
    const resp = await checkFormat(params)
      .catch(snackbar => this.setState({ snackbar, loading: false }));
    this.setState({ domainError: !!resp?.domain });
  }, 200)

  handleCheckbox = field => event => {
    this.setState({
      [field]: event.target.checked,
    });
  }

  handleNumberInput = field => event => {
    let input = event.target.value;
    if(input && input.match("^\\d*?$")) input = parseInt(input);
    this.setState({
      [field]: input,
    });
  }

  handleAdd = () => {
    const { domainname, domainStatus, maxUser, orgID,
      title, address, adminName, tel, createRole, chat } = this.state;
    this.setState({ loading: true });
    this.props.add({
      domainname,
      domainStatus,
      maxUser,
      title,
      address,
      adminName,
      tel,
      orgID: orgID.ID,
      chat,
    }, { createRole })
      .then(() => {
        this.setState({
          domainname: '',
          domainStatus: 0,
          maxUser: '',
          title: '',
          address: '',
          adminName: '',
          tel: '',
          loading: false,
          createRole: false,
          chat: false,
          autocompleteInput: '',
        });
        this.props.onSuccess();
      })
      .catch(error => {
        this.props.onError(error);
        this.setState({ loading: false });
      });
  }

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      [field]: newVal || '',
      autocompleteInput: newVal?.name || '',
    });
  }

  render() {
    const { classes, t, open, onClose, orgs } = this.props;
    const { domainname, domainStatus, orgID, domainError, chat,
      maxUser, title, address, adminName, tel, loading, createRole, autocompleteInput } = this.state;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="md"
        fullWidth
        onEnter={this.handleEnter}
      >
        <DialogTitle>{t('addHeadline', { item: 'Domain' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Domain")} 
              fullWidth 
              value={domainname || ''}
              onChange={this.handleInput('domainname')}
              autoFocus
              required
              error={!!domainname && domainError}
            />
            <TextField
              select
              className={classes.input}
              label={t("Status")}
              fullWidth
              value={domainStatus || 0}
              onChange={this.handleInput('domainStatus')}
            >
              {this.statuses.map((status, key) => (
                <MenuItem key={key} value={status.ID}>
                  {status.name}
                </MenuItem>
              ))}
            </TextField>
            <Autocomplete
              value={orgID}
              inputValue={autocompleteInput}
              filterOptions={getAutocompleteOptions('name')}
              noOptionsText={autocompleteInput.length < Math.round(Math.log10(orgs.length) - 2) ?
                t('Filter more precisely') + '...' : t('No options')}
              getOptionLabel={org => org.name || ''}
              renderOption={(org) => org?.name || ''}
              onChange={this.handleAutocomplete('orgID')}
              className={classes.input} 
              options={orgs}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Organization")}
                  onChange={this.handleInput('autocompleteInput')}
                />
              )}
            />
            <TextField 
              className={classes.input} 
              label={t("Maximum users")} 
              fullWidth 
              value={maxUser || ''}
              onChange={this.handleNumberInput('maxUser')}
              required
            />
            <TextField 
              className={classes.input} 
              label={t("Title")} 
              fullWidth 
              value={title || ''}
              onChange={this.handleInput('title')}
            />
            <TextField 
              className={classes.input} 
              label={t("Address")} 
              fullWidth 
              value={address || ''}
              onChange={this.handleInput('address')}
            />
            <TextField 
              className={classes.input} 
              label={t("Administrator")} 
              fullWidth 
              value={adminName || ''}
              onChange={this.handleInput('adminName')}
            />
            <TextField 
              className={classes.input} 
              label={t("Telephone")} 
              fullWidth 
              value={tel || ''}
              onChange={this.handleInput('tel')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={createRole}
                  onChange={this.handleCheckbox('createRole')}
                  color="primary"
                />
              }
              label={t('Create domain admin role')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={chat}
                  onChange={this.handleCheckbox('chat')}
                  color="primary"
                />
              }
              label={t('Create grommunio-chat Team')}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            variant="contained"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={loading || !domainname || !maxUser || domainError}
          >
            {loading ? <CircularProgress size={24}/> : t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddDomain.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  orgs: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    orgs: state.orgs.Orgs,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domain, params) => {
      await dispatch(addDomainData(domain, params)).catch(message => Promise.reject(message));
    },
    fetch: async () => await dispatch(fetchOrgsData({ sort: 'name,asc', limit: 1000000, level: 0 }))
      .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddDomain)));
