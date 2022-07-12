// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
  MenuItem, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addMListData } from '../../actions/mlists';
import { fetchClassesData } from '../../actions/classes';
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
    listType: 0,
    listPrivilege: 0,
    associations: '',
    specifieds: '',
    class: '',
    loading: false,
    autocompleteInput: '',
  }

  listTypes = [
    { ID: 0, name: "Normal" },
    { ID: 2, name: "Domain" },
    { ID: 3, name: "Group" },
  ]

  listPrivileges = [
    { ID: 0, name: "All" },
    { ID: 1, name: "Internal" },
    { ID: 2, name: "Domain" },
    { ID: 3, name: "Specific" },
    { ID: 4, name: "Outgoing" },
  ]

  handleEnter = () => {
    const { fetch, domain, onError } = this.props;
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
    const { associations, class: _class } = this.state;
    const val = event.target.value;
    this.setState({
      listType: val,
      associations: val === 0 ? associations : '', /* Associations only available if type "all" */
      class: val === 3 ? _class : '', /* Associations only available if type "all" */
    });
  }

  handlePrivilegeChange = event => {
    const { specifieds } = this.state;
    const val = event.target.value;
    this.setState({
      listPrivilege: val,
      specifieds: val === 3 ? specifieds : '', /* Specifieds only available if privilege "specific" */
    });
  }

  handleAdd = () => {
    const { add, domain, onSuccess, onError } = this.props;
    const { listname, listType, listPrivilege, associations, specifieds, class: _class } = this.state;
    this.setState({ loading: true });
    add(domain.ID, {
      listname,
      listType,
      listPrivilege,
      class: _class.ID || undefined,
      /* Strip whitespaces and split on ',' */
      associations: associations ? associations.replace(/\s/g, "").split(',') : undefined, 
      specifieds: specifieds ? specifieds.replace(/\s/g, "").split(',') : undefined,
    })
      .then(() => {
        this.setState({
          listname: '',
          listType: 0,
          listPrivilege: 0,
          associations: '',
          specifieds: '',
          class: '',
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

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      [field]: newVal || '',
      autocompleteInput: newVal?.classname || '',
    });
  }

  render() {
    const { classes, t, open, onClose, _classes } = this.props;
    const { listname, listType, listPrivilege, associations, specifieds, loading, class: _class,
      autocompleteInput } = this.state;
    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="md"
        fullWidth
        TransitionProps={{
          onEnter: this.handleEnter,
        }}>
        <DialogTitle>{t('addHeadline', { item: 'Mail list' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Mail list name")} 
              fullWidth 
              value={listname || ''}
              onChange={this.handleInput('listname')}
              autoFocus
              required
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
                  {status.name}
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
                  {status.name}
                </MenuItem>
              ))}
            </TextField>
            {listType === 0 && <TextField 
              className={classes.input} 
              label={t("Recipients") + " (separated by comma (,)"} 
              fullWidth 
              value={associations || ''}
              onChange={this.handleInput('associations')}
            />}
            {listPrivilege === 3 && <TextField 
              className={classes.input} 
              label={t("Senders") + " (separated by comma (,)"} 
              fullWidth 
              value={specifieds || ''}
              onChange={this.handleInput('specifieds')}
            />}
            {listType === 3 && <MagnitudeAutocomplete
              value={_class}
              filterAttribute={'classname'}
              inputValue={autocompleteInput}
              onChange={this.handleAutocomplete('class')}
              className={classes.input} 
              options={_classes}
              onInputChange={this.handleInput('autocompleteInput')}
              label={t('Group')}
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
  fetch: PropTypes.func.isRequired,
  _classes: PropTypes.array.isRequired,
  domain: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    _classes: state._classes.Select,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, mList) => {
      await dispatch(addMListData(domainID, mList))
        .catch(message => Promise.reject(message));
    },
    fetch: async (domainID) => await dispatch(fetchClassesData(domainID, { sort: 'classname,asc' }, true))
      .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddMList)));
