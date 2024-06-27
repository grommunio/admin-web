// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';


const DeleteConfig = props => {
  const [loading, setLoading] = useState(false);

  const handleDelete = e => {
    e.preventDefault();
    const { orgID, onSuccess, onError } = this.props;
    setLoading(true);
    this.props.delete(orgID) // Optional, will just be ignored for global config
      .then(() => {
        if(onSuccess) onSuccess();
        setLoading(false);
      })
      .catch(err => {
        if(onError) onError(err);
        setLoading(false);
      });
  }

  const { t, open, onClose } = props;
  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Are you sure you want to delete the LDAP config?</DialogTitle>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="primary"
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DeleteConfig.propTypes = {
  t: PropTypes.func.isRequired,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
  orgID: PropTypes.number,
};


export default withTranslation()(DeleteConfig);
