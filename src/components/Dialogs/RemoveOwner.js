// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { deleteOwnerData } from '../../actions/folders';
import { connect } from 'react-redux';

const RemoveOwner = props => {
  const [loading, setLoading] = useState(false);

  const handleDelete = e => {
    e.preventDefault();
    const { folderID, memberID, onSuccess, onError, domainID } = props;
    setLoading(true);
    props.delete(domainID, folderID, memberID)
      .then(() => {
        if(onSuccess) onSuccess();
        setLoading(false);
      })
      .catch(error => {
        if(onError) onError(error);
        setLoading(false);
      });
  }

  const { t, open, ownerName, onClose } = props;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Are you sure you want to remove {ownerName} from this folder?</DialogTitle>
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
          color="secondary"
          type="submit"
          autoFocus
        >
          {loading ? <CircularProgress size={24}/> : t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RemoveOwner.propTypes = {
  t: PropTypes.func.isRequired,
  ownerName: PropTypes.string,
  domainID: PropTypes.number,
  folderID: PropTypes.string,
  memberID: PropTypes.number,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    delete: async (domainID, folderID, memberID) => {
      await dispatch(deleteOwnerData(domainID, folderID, memberID)).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(RemoveOwner));
