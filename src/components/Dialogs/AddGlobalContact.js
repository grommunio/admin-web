// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, TextField,
  Button, DialogActions, CircularProgress, Grid2, FormControl,
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import moment from 'moment';
import { addUserData } from '../../actions/users';
import { fetchDomainData } from '../../actions/domains';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { useNavigate } from 'react-router';
import { USER_STATUS } from '../../constants';

const styles = theme => ({
  form: {
    width: '100%',
    margin: theme.spacing(3, 1, 1, 1),
  },
  grid: {
    display: 'flex',
    margin: theme.spacing(1, 1, 1, 1),
    flex: 1,
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  gridItem: {
    display: 'flex',
  },
  propertyInput: {
    margin: theme.spacing(1, 1, 1, 1),
    flex: 1,
  },
  flexTextfield: {
    flex: 1,
    marginRight: 8,
  },
});

const AddContact = props => {
  const [contact, setContact] = useState({
    displayname: '',
  });
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEnter = async () => {
    const { fetchDomains, onError } = props;
    fetchDomains().catch(error => onError(error));
  }

  const handleInput = field => event => {
    setContact({
      ...contact,
      [field]: event.target.value,
    });
  }

  const handleAdd = e => {
    e.preventDefault();
    const { add, onError, onSuccess } = props;
    setLoading(true);
    add(domain?.ID || -1, {
      status: USER_STATUS.CONTACT,
      properties: {
        ...contact,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
    })
      .then(() => {
        setContact({ displayname: '' });
        setLoading(false);
        onSuccess();
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleAddAndEdit = () => {
    const { add, onError } = props;
    setLoading(true);
    add(domain?.ID || -1, {
      status: USER_STATUS.CONTACT,
      properties: {
        ...contact,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
    })
      .then(user => {
        navigate('/' + domain?.ID + '/contacts/' + user.ID);
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleAutocomplete = (e, newVal) => {
    setDomain(newVal || '');
  }

  const { classes, t, open, onClose, Domains } = props;
  const { smtpaddress, displayname, givenname, initials, surname, nickname } = contact;

  return (
    (<Dialog
      onClose={onClose}
      open={open}
      maxWidth="lg"
      fullWidth
      TransitionProps={{
        onEnter: handleEnter,
      }}
    >
      <DialogTitle>{t('addHeadline', { item: 'Contact' })}</DialogTitle>
      <DialogContent>
        <Grid2 container>
          <FormControl className={classes.form}>
            <MagnitudeAutocomplete
              value={domain}
              filterAttribute={'domainname'}
              onChange={handleAutocomplete}
              options={Domains}
              label={t('Domain')}
              placeholder={t("Search domains")  + "..."}
              autoFocus
              autoSelect
              isOptionEqualToValue={(option, value) => option.ID === value.ID}
            />
          </FormControl>
          <Grid2 className={classes.gridItem} size={12}>
            <TextField
              className={classes.propertyInput}
              fullWidth
              label={t("E-Mail Address")}
              value={smtpaddress || ''}
              onChange={handleInput('smtpaddress')}
            />
          </Grid2>
          <Grid2 className={classes.gridItem} size={12}>
            <div className={classes.grid}>
              <TextField 
                className={classes.flexTextfield}
                label={t("First name")}
                value={givenname || ''}
                onChange={handleInput('givenname')}
              />
              <TextField 
                //className={classes.flexTextfield}
                label={t("Initials")}
                value={initials || ''}
                onChange={handleInput('initials')}
              />
            </div>
            <TextField 
              className={classes.propertyInput} 
              label={t("Surname")} 
              fullWidth 
              value={surname || ''}
              onChange={handleInput('surname')}
            />
          </Grid2>
          <Grid2 className={classes.gridItem} size={12}>
            <TextField 
              className={classes.propertyInput}
              label={t("Display name")}
              fullWidth
              value={displayname || ''}
              onChange={handleInput('displayname')}
            />
            <TextField 
              className={classes.propertyInput} 
              label={t("Nickname")} 
              fullWidth 
              value={nickname || ''}
              onChange={handleInput('nickname')}
            />
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleAddAndEdit}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress size={24}/> : t('Add and edit')}
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          color="primary"
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : t('Add')}
        </Button>
      </DialogActions>
    </Dialog>)
  );
}

AddContact.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  Domains: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    Domains: state.domains.Domains,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchDomains: async () => await dispatch(fetchDomainData({ limit: 1000000, level: 0, sort: 'domainname,asc' }))
      .catch(message => Promise.reject(message)),
    add: async (domainID, user) => 
      await dispatch(addUserData(domainID, user))
        .then(user => Promise.resolve(user))
        .catch(msg => Promise.reject(msg)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(AddContact, styles)));
