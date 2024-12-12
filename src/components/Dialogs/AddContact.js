// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useState } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, TextField,
  Button, DialogActions, CircularProgress, Grid2,
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import moment from 'moment';
import { addUserData } from '../../actions/users';
import { useNavigate } from 'react-router';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
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
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);

  const handleAdd = e => {
    e.preventDefault();
    const { domain, add, onError, onSuccess } = props;
    setLoading(true);
    add(domain.ID, {
      status: 5,
      properties: {
        ...contact,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
    })
      .then(() => {
        setContact({ displayname: '' })
        setLoading(false);
        onSuccess();
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleAddAndEdit = () => {
    const { domain, add, onError } = props;
    setLoading(true);
    add(domain.ID, {
      status: 5,
      properties: {
        ...contact,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
    })
      .then(user => {
        navigate('/' + domain.ID + '/contacts/' + user.ID);
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handlePropertyChange = field => event => {
    setContact(contact => ({ ...contact, [field]: event.target.value }));
  }

  const { classes, t, open, onClose } = props;
  const { smtpaddress, displayname, givenname, initials, surname, nickname } = contact;
  return (
    (<Dialog
      onClose={onClose}
      open={open}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>{t('addHeadline', { item: 'Contact' })}</DialogTitle>
      <DialogContent>
        <Grid2 container>
          <Grid2 className={classes.gridItem} size={12}>
            <TextField
              className={classes.propertyInput}
              fullWidth
              label={t("E-Mail Address")}
              value={smtpaddress || ''}
              onChange={handlePropertyChange('smtpaddress')}
            />
          </Grid2>
          <Grid2 className={classes.gridItem} size={12}>
            <div className={classes.grid}>
              <TextField 
                className={classes.flexTextfield}
                label={t("First name")}
                value={givenname || ''}
                onChange={handlePropertyChange('givenname')}
              />
              <TextField 
                label={t("Initials")}
                value={initials || ''}
                onChange={handlePropertyChange('initials')}
              />
            </div>
            <TextField 
              className={classes.propertyInput} 
              label={t("Surname")} 
              fullWidth 
              value={surname || ''}
              onChange={handlePropertyChange('surname')}
            />
          </Grid2>
          <Grid2 className={classes.gridItem} size={12}>
            <TextField 
              className={classes.propertyInput}
              label={t("Display name")}
              fullWidth
              value={displayname || ''}
              onChange={handlePropertyChange('displayname')}
            />
            <TextField 
              className={classes.propertyInput} 
              label={t("Nickname")} 
              fullWidth 
              value={nickname || ''}
              onChange={handlePropertyChange('nickname')}
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
  domain: PropTypes.object.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};


const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, user) => 
      await dispatch(addUserData(domainID, user))
        .then(user => Promise.resolve(user))
        .catch(msg => Promise.reject(msg)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(AddContact, styles)));
