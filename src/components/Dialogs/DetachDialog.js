// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';

const styles = {
};

class DetachDialog extends PureComponent {

  state = {
    loading: false,
  }

  render() {
    const { t, open, loading, onClose, onDetach } = this.props;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Are you sure you want to detach this user?</DialogTitle>
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
}

DetachDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool,
  loading: PropTypes.bool,
  onDetach: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(DetachDialog));
