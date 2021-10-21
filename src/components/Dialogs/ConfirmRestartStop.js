// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';

const styles = {
  
};

class ConfirmRestartStop extends PureComponent {

  render() {
    const { t, open, handleConfirm, onClose, action, service } = this.props;

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
          >
            {t('Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

ConfirmRestartStop.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  handleConfirm: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
  action: PropTypes.string,
  service: PropTypes.object,
};

export default withTranslation()(withStyles(styles)(ConfirmRestartStop));
