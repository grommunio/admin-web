// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress, Autocomplete,
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addOrgData } from '../../actions/orgs';
import { getAutocompleteOptions } from '../../utils';
import { fetchDomainData } from '../../actions/domains';

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

class AddOrg extends PureComponent {

  state = {
    name: '',
    description: '',
    autocompleteInput: '',
    domains: [],
    loading: false,
  }

  handleEnter = () => {
    const { fetch, Domains } = this.props;
    if(Domains.length === 0) {
      fetch();
    }
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleAdd = () => {
    const { add, onSuccess, onError } = this.props;
    const { name, description, domains } = this.state;
    this.setState({ loading: true });
    add({
      name,
      description,
      domains: domains.map(d => d.ID),
    })
      .then(() => {
        this.setState({
          name: '',
          description: '',
          domains: [],
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
      [field]: newVal,
      autocompleteInput: '',
    });
  }

  render() {
    const { classes, t, open, onClose, Domains } = this.props;
    const { name, description, domains, autocompleteInput, loading } = this.state;
    const nameAcceptable = name.length < 33;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="md"
        fullWidth
        TransitionProps={{
          onEnter: this.handleEnter,
        }}>
        <DialogTitle>{t('addHeadline', { item: 'Organization' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Name")} 
              fullWidth 
              value={name || ''}
              onChange={this.handleInput('name')}
              autoFocus
              required
              error={name && !nameAcceptable}
            />
            <TextField 
              className={classes.input} 
              label={t("Description")} 
              fullWidth 
              value={description || ''}
              onChange={this.handleInput('description')}
              multiline
              rows={4}
              variant="outlined"
            />
            <Autocomplete
              multiple
              options={Domains || []}
              filterOptions={getAutocompleteOptions('domainname')}
              noOptionsText={autocompleteInput.length < Math.round(Math.log10(Domains.length) - 2) ?
                t('Filter more precisely') + '...' : t('No options')}
              value={domains || []}
              onChange={this.handleAutocomplete('domains')}
              getOptionLabel={(user) => user.domainname || ''}
              autoSelect
              autoHighlight
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Domains"
                  placeholder="Search domains..."
                  className={classes.input}
                  onChange={this.handleInput('autocompleteInput')}
                />
              )}
            />
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
            disabled={loading || !nameAcceptable}
          >
            {loading ? <CircularProgress size={24}/> : t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddOrg.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  Domains: PropTypes.array.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Domains: state.domains.Domains,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () =>
      await dispatch(fetchDomainData({ sort: 'domainname,asc' })),
    add: async org => {
      await dispatch(addOrgData(org))
        .catch(message => Promise.reject(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddOrg)));
