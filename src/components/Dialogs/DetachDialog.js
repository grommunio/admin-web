// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';

const styles = {
};

class DetachDialog extends PureComponent {

  state = {
    loading: false,
    force: false,
  }

  handleChange = event => {
    this.setState({ force: event.target.checked });
  };

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
            variant="contained"
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
