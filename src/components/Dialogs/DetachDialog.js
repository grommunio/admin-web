// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';

const styles = {
};

const DetachDialog = props => {

  const { t, open, loading, onClose, onDetach } = props;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t("Are you sure you want to detach this user?")}</DialogTitle>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={onDetach}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress color="secondary" size={24}/> : t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DetachDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool,
  loading: PropTypes.bool,
  onDetach: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(DetachDialog, styles));
