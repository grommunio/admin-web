// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useState } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
  MenuItem,
  FormControlLabel,
  Checkbox, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addGroupData } from '../../actions/groups';
import { fetchAllUsers, fetchUsersData } from '../../actions/users';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { CapabilityContext } from '../../CapabilityContext';
import { LIST_PRIVILEGE, LIST_TYPE, listTypes, ORG_ADMIN } from '../../constants';

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

const AddGroup = props => {
  const [group, setGroup] = useState({
    listname: '',
    displayname: '',
    hidden: 0,
    listType: LIST_TYPE.NORMAL,
    listPrivilege: LIST_PRIVILEGE.ALL,
    associations: [],
    specifieds: [],
  });
  const [loading, setLoading] = useState(false);
  const context = useContext(CapabilityContext);

  const listPrivileges = [
    { ID: LIST_PRIVILEGE.ALL, name: "All" },
    { ID: LIST_PRIVILEGE.INTERNAL, name: "Internal" },
    { ID: LIST_PRIVILEGE.DOMAIN, name: "Domain" },
    { ID: LIST_PRIVILEGE.SPECIFIC, name: "Specific" },
  ]

  const handleEnter = () => {
    const { fetch, onError, domain, fetchOrgUsers } = props;
    (context.includes(ORG_ADMIN) ? fetchOrgUsers(domain.orgID) : fetch(domain.ID))
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleInput = field => event => {
    setGroup({
      ...group,
      [field]: event.target.value,
    });
  }

  const handleTypeChange = event => {
    const { associations } = group;
    const val = event.target.value;
    setGroup({
      ...group,
      listType: val,
      associations: val === 0 ? associations : [], /* Associations only available if type "all" */
    });
  }

  const handlePrivilegeChange = event => {
    const { specifieds } = group;
    const val = event.target.value;
    setGroup({
      ...group,
      listPrivilege: val,
      specifieds: val === 3 ? specifieds : [], /* Specifieds only available if privilege "specific" */
    });
  }

  const handleAdd = e => {
    e.preventDefault();
    const { add, domain, onSuccess, onError } = props;
    const { associations, specifieds } = group;
    setLoading(true);
    add(domain.ID, {
      ...group,
      /* Strip whitespaces and split on ',' */
      associations: associations.length > 0 ? associations.map(user => user.username) : undefined, 
      specifieds: specifieds.length > 0 ? specifieds.map(user => user.username) : undefined,
    })
      .then(() => {
        setGroup({
          listname: '',
          listType: 0,
          hidden: 0,
          displayname: '',
          listPrivilege: LIST_PRIVILEGE.ALL,
          associations: '',
          specifieds: '',
        });
        setLoading(false);
        onSuccess();
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleCheckbox = field => (e) => setGroup({
    ...group,
    [field]: e.target.checked ? 1 : 0
  });

  const handleAutocomplete = (field) => (e, newVal) => {
    setGroup({
      ...group,
      [field]: newVal || '',
    });
  }

  const { classes, t, open, onClose, Users, domain } = props;
  const { listname, displayname, hidden, listType, listPrivilege, associations, specifieds } = group;
  return (
    (<Dialog
      onClose={onClose}
      open={open}
      maxWidth="md"
      fullWidth
      TransitionProps={{
        onEnter: handleEnter,
      }}>
      <DialogTitle>{t('addHeadline', { item: 'Group' })}</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("Group name")} 
            fullWidth 
            value={listname || ''}
            onChange={handleInput('listname')}
            autoFocus
            required
            slotProps={{
              input: {
                endAdornment: <div style={{ whiteSpace: 'nowrap' }}>@{domain?.domainname}</div>,
              }
            }}
          />
          <TextField 
            className={classes.input} 
            label={t("Displayname")} 
            fullWidth 
            value={displayname}
            onChange={handleInput('displayname')}
          />
          <FormControlLabel
            className={classes.input} 
            control={
              <Checkbox
                checked={hidden === 1}
                onChange={handleCheckbox('hidden')}
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
            onChange={handleTypeChange}
          >
            {listTypes.map((status, key) => (
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
            value={listPrivilege || LIST_PRIVILEGE.ALL}
            onChange={handlePrivilegeChange}
          >
            {listPrivileges.map((status, key) => (
              <MenuItem key={key} value={status.ID}>
                {t(status.name)}
              </MenuItem>
            ))}
          </TextField>
          {listType === LIST_TYPE.NORMAL && <MagnitudeAutocomplete
            multiple
            value={associations || []}
            filterAttribute={'username'}
            onChange={handleAutocomplete('associations')}
            className={classes.input} 
            options={Users || []}
            placeholder={t("Search users") +  "..."}
            label={t('Recipients')}
            getOptionKey={(option) => `${option.ID}_${option.domainID}`}
            isOptionEqualToValue={(option, value) => option.ID === value.ID && option.domainID === value.domainID}
          />}
          {listPrivilege === LIST_PRIVILEGE.SPECIFIC && <MagnitudeAutocomplete
            multiple
            value={specifieds || []}
            filterAttribute={'username'}
            onChange={handleAutocomplete('specifieds')}
            className={classes.input} 
            options={Users || []}
            placeholder={t("Search users") +  "..."}
            label={t('Senders')}
            getOptionKey={(option) => `${option.ID}_${option.domainID}`}
            isOptionEqualToValue={(option, value) => option.ID === value.ID && option.domainID === value.domainID}
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
          onClick={handleAdd}
          variant="contained"
          color="primary"
          disabled={loading || !listname}
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : t('Add')}
        </Button>
      </DialogActions>
    </Dialog>)
  );
}

AddGroup.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  domain: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  fetchOrgUsers: PropTypes.func.isRequired,
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
    add: async (domainID, group) => {
      await dispatch(addGroupData(domainID, group))
        .catch(message => Promise.reject(message));
    },
    fetch: async (domainID) =>
      await dispatch(fetchUsersData(domainID, { limit: 100000, sort: "username,asc" }))
        .catch(message => Promise.reject(message)),
    fetchOrgUsers: async orgID => await dispatch(fetchAllUsers({ limit: 100000, sort: "username,asc", orgID }))
      .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(AddGroup, styles)));
