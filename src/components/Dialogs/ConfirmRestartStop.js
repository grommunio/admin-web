// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';


const ConfirmRestartStop = props => {

  const { t, open, handleConfirm, onClose, action, service } = props;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Are you sure you want to {action} {service?.name || 'this service'}?</DialogTitle>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          type="submit"
          autoFocus
        >
          {t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmRestartStop.propTypes = {
  t: PropTypes.func.isRequired,
  handleConfirm: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
  action: PropTypes.string,
  service: PropTypes.object,
};

export default withTranslation()(ConfirmRestartStop);
