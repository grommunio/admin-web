// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';


const DomainDataDelete = props => {
  const [loading, setLoading] = useState(false);

  const handleDelete = e => {
    e.preventDefault();
    const { id, onSuccess, onError, domainID } = props;
    setLoading(true);
    props.delete(domainID, id)
      .then(msg => {
        if(onSuccess) onSuccess(msg);
        setLoading(false);
      })
      .catch(error => {
        if(onError) onError(error);
        setLoading(false);
      });
  }

  const { t, open, item, onClose } = props;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Are you sure you want to delete {item}?</DialogTitle>
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
        >
          {loading ? <CircularProgress size={24}/> : t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DomainDataDelete.propTypes = {
  t: PropTypes.func.isRequired,
  item: PropTypes.string,
  id: PropTypes.number,
  domainID: PropTypes.number,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

export default withTranslation()(DomainDataDelete);
