// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, DialogContent, Checkbox, FormControlLabel, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { importLdapData } from '../../actions/ldap';
import { connect } from 'react-redux';


const ImportDialog = props => {
  const [state, setState] = useState({
    loading: false,
    force: false,
  });

  const handleChange = event => {
    setState({ ...state, force: event.target.checked });
  };

  const handleImport = () => {
    const { importUser, onSuccess, onError, user, domainID } = props;
    const { force } = state;
    setState({ ...state, loading: true });
    importUser({ ID: user.ID, force, domain: domainID })
      .then(() => {
        if(onSuccess) onSuccess();
        setState({ ...state, loading: false });
      })
      .catch(err => {
        if(onError) onError(err);
        setState({ ...state, loading: false });
      });
  }

  const { t, open, user, onClose } = props;
  const { loading, force } = state;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Are you sure you want to import {user.name}?</DialogTitle>
      <DialogContent>
        <FormControlLabel
          control={
            <Checkbox
              checked={force}
              onChange={handleChange}
              color="primary"
            />
          }
          label="force"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleImport}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress size={24}/> : t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ImportDialog.propTypes = {
  t: PropTypes.func.isRequired,
  user: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  importUser: PropTypes.func.isRequired,
  domainID: PropTypes.number,
};

const mapDispatchToProps = dispatch => {
  return {
    importUser: async params => await dispatch(importLdapData(params))
      .catch(err => Promise.reject(err)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(ImportDialog));
