// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  Button,
  Autocomplete,
} from '@mui/material';
import { connect } from 'react-redux';
import { getAutocompleteOptions, getStringAfterLastSlash } from '../utils';
import { editOrgData, fetchOrgsDetails } from '../actions/orgs';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { fetchDomainData } from '../actions/domains';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
});

class OrgDetails extends PureComponent {

  state = {
    org: {},
    unsaved: false,
    autocompleteInput: '',
  }

  async componentDidMount() {
    const { fetch, fetchDomains } = this.props;
    fetchDomains();
    const org = await fetch(getStringAfterLastSlash())
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    this.setState({
      org: org || {},
    });
  }

  handleInput = field => event => {
    this.setState({
      org: {
        ...this.state.org,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleACInput = e => this.setState({
    autocompleteInput: e.target.value,
  });

  handleEdit = () => {
    const { edit } = this.props;
    const { org } = this.state;
    edit({
      ...org,
      domains: org.domains.map(d => d.ID),
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      org: {
        ...this.state.org,
        [field]: newVal,
      },
      autocompleteInput: '',
      unsaved: true,
    });
  }

  render() {
    const { classes, t, Domains } = this.props;
    const { org, snackbar, autocompleteInput } = this.state;
    const { name, description, domains } = org;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    const nameAcceptable = name && name.match("^[a-zA-Z0-9]+$");

    return (
      <ViewWrapper
        topbarTitle={t('Organizations')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container>
            <Typography
              color="primary"
              variant="h5"
            >
              {t('editHeadline', { item: 'Organization' })}
            </Typography>
          </Grid>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Name")}
              onChange={this.handleInput('name')}
              fullWidth 
              value={name || ''}
              autoFocus
              required
              error={!nameAcceptable}
            />
            <TextField 
              className={classes.input} 
              label={t("Description")} 
              fullWidth
              onChange={this.handleInput('description')}
              value={description || ''}
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
                  onChange={this.handleACInput}
                />
              )}
            />
          </FormControl>
          <Button
            color="secondary"
            onClick={this.handleNavigation('orgs')}
            style={{ marginRight: 8 }}
          >
            {t('Back')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleEdit}
            disabled={!writable || !nameAcceptable}
          >
            {t('Save')}
          </Button>
        </Paper>
      </ViewWrapper>
    );
  }
}

OrgDetails.contextType = CapabilityContext;
OrgDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  Domains: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Domains: state.domains.Domains,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async org => await dispatch(editOrgData(org)).catch(message => Promise.reject(message)),
    fetch: async id => await dispatch(fetchOrgsDetails(id))
      .then(org => org)
      .catch(message => Promise.reject(message)),
    fetchDomains: async () => await dispatch(fetchDomainData({ sort: 'domainname,asc' })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(OrgDetails)));
