// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

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
  MenuItem,
} from '@mui/material';
import { connect } from 'react-redux';
import { editMListData, fetchMListData } from '../actions/mlists';
import { getStringAfterLastSlash } from '../utils';
import Feedback from '../components/Feedback';
import { DOMAIN_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';

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
  select: {
    minWidth: 60,
  },
});

class MListDetails extends PureComponent {

  state = {
    listname: '',
    listType: 0,
    listPrivilege: 0,
    associations: '',
    specifieds: '',
    unsaved: false,
    autocompleteInput: '',
    loading: true,
  }

  async componentDidMount() {
    const { domain, fetch } = this.props;
    const mList = await fetch(domain.ID, getStringAfterLastSlash())
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    this.setState({
      loading: false,
      ...(mList ? {
        ...mList,
      } : {})
    });
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

  handlePrivilegeChange = event => {
    const { specifieds } = this.state;
    const val = event.target.value;
    this.setState({
      listPrivilege: val,
      specifieds: val === 3 ? specifieds : '',
    });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleEdit = () => {
    const { edit, domain } = this.props;
    const { ID, listname, listType, listPrivilege, associations, specifieds } = this.state;
    edit(domain.ID, {
      ID,
      listname,
      listType,
      listPrivilege,
      associations: Array.isArray(associations) ? associations :
        associations ? associations.replace(/\s/g, "").split(',') : undefined, 
      specifieds: Array.isArray(specifieds) ? specifieds :
        specifieds ? specifieds.replace(/\s/g, "").split(',') : undefined,
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  render() {
    const { classes, t, domain } = this.props;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { snackbar, listname, listType, listPrivilege, associations, specifieds,
      loading } = this.state;

    return (
      <ViewWrapper
        topbarTitle={t('Mail lists')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
        loading={loading}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container>
            <Typography
              color="primary"
              variant="h5"
            >
              {t('editHeadline', { item: 'Mail list' })}
            </Typography>
          </Grid>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Mail list name")} 
              fullWidth 
              value={listname}
              autoFocus
              required
              inputProps={{
                disabled: true,
              }}
            />
            <TextField
              select
              className={classes.input}
              label={t("Type")}
              fullWidth
              value={listType}
              inputProps={{
                disabled: true,
              }}
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
              value={listPrivilege}
              onChange={this.handlePrivilegeChange}
            >
              {this.listPrivileges.map((status, key) => (
                <MenuItem key={key} value={status.ID}>
                  {t(status.name)}
                </MenuItem>
              ))}
            </TextField>
            {listType === 0 && <TextField 
              className={classes.input} 
              label={t("Recipients") + " (" + t("separated by comma") + " (,))"} 
              fullWidth 
              value={associations || ''}
              onChange={this.handleInput('associations')}
            />}
            {listPrivilege === 3 && <TextField 
              className={classes.input} 
              label={t("Senders") + " (" + t("separated by comma") + " (,))"}
              fullWidth 
              value={specifieds || ''}
              onChange={this.handleInput('specifieds')}
            />}
          </FormControl>
          <Button
            color="secondary"
            onClick={this.handleNavigation(domain.ID + '/mailLists')}
            style={{ marginRight: 8 }}
          >
            {t('Back')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleEdit}
            disabled={!writable}
          >
            {t('Save')}
          </Button>
        </Paper>
        <Feedback
          snackbar={snackbar}
          onClose={() => this.setState({ snackbar: '' })}
        />
      </ViewWrapper>
    );
  }
}

MListDetails.contextType = CapabilityContext;
MListDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async (domainID, mlist) => {
      await dispatch(editMListData(domainID, mlist)).catch(message => Promise.reject(message));
    },
    fetch: async (domainID, id) => await dispatch(fetchMListData(domainID, id))
      .then(mlist => mlist)
      .catch(message => Promise.reject(message)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(MListDetails)));
