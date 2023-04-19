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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { connect } from 'react-redux';
import { editMListData, fetchMListData } from '../actions/mlists';
import { getStringAfterLastSlash } from '../utils';
import Feedback from '../components/Feedback';
import { DOMAIN_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { fetchPlainUsersData } from '../actions/users';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';

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
    displayname: '',
    hidden: 0,
    listType: 0,
    listPrivilege: 0,
    associations: [],
    specifieds: [],
    unsaved: false,
    loading: true,
  }

  async componentDidMount() {
    const { domain, fetch, fetchUsers } = this.props;
    const mList = await fetch(domain.ID, getStringAfterLastSlash())
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    fetchUsers(domain.ID)
      .then(() => {
        const { Users } = this.props;
        const table = {};
        Users.forEach(u => table[u.username] = u);
        if(mList?.ID) {
          const associations = [];
          mList.associations.forEach(mListUsername => {
            if(mListUsername in table) associations.push(table[mListUsername]);
          });

          const specifieds = [];
          mList.specifieds.forEach(mListUsername => {
            if(mListUsername in table) specifieds.push(table[mListUsername]);
          });
          
          this.setState({
            loading: false,
            ...mList,
            associations: associations,
            specifieds: specifieds,
          });
        }
      })
      .catch(message => {
        this.setState({ snackbar: message || 'Unknown error' });
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
      specifieds: val === 3 ? specifieds : [],
    });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleEdit = () => {
    const { edit, domain } = this.props;
    const { ID, listname, hidden, displayname, listType, listPrivilege, associations, specifieds } = this.state;
    edit(domain.ID, {
      ID,
      listname,
      listType,
      listPrivilege,
      displayname,
      hidden,
      associations: associations.map(user => user.username),
      specifieds: specifieds.map(user => user.username),
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleCheckbox = field => (e) => this.setState({ [field]: e.target.checked ? 1 : 0 });

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      [field]: newVal || '',
    });
  }

  render() {
    const { classes, t, domain, Users } = this.props;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { snackbar, listname, listType, displayname, hidden, listPrivilege, associations, specifieds,
      loading } = this.state;

    return (
      <ViewWrapper
        topbarTitle={t('Groups')}
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
              {t('editHeadline', { item: 'Group' })}
            </Typography>
          </Grid>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Group name")} 
              fullWidth 
              value={listname}
              autoFocus
              required
              inputProps={{
                disabled: true,
              }}
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
  fetchUsers: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  Users: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    Users: state.users.Users,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async (domainID, mlist) => {
      await dispatch(editMListData(domainID, mlist)).catch(message => Promise.reject(message));
    },
    fetch: async (domainID, id) => await dispatch(fetchMListData(domainID, id))
      .then(mlist => mlist)
      .catch(message => Promise.reject(message)),
    fetchUsers: async (domainID) => await dispatch(fetchPlainUsersData(domainID))
      .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(MListDetails)));
