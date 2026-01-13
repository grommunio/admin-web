// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';


const GeneralDelete = props => {
  const [loading, setLoading] = useState(false);

  const handleDelete = e => {
    e.preventDefault();
    const { id, onSuccess, onError } = props;
    setLoading(true);
    props.delete(id)
      .then(msg => {
        if(onSuccess) onSuccess(msg);
        setLoading(false);
      })
      .catch(err => {
        if(onError) onError(err);
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
      <DialogTitle>{t('deleteDialog', { item })}?</DialogTitle>
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

GeneralDelete.propTypes = {
  t: PropTypes.func.isRequired,
  item: PropTypes.any,
  id: PropTypes.any,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

export default withTranslation()(GeneralDelete);
