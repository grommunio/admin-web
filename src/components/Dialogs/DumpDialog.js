// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent,Button,
  DialogActions,
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';

const styles = {
  
};

class DeleteUser extends PureComponent {

  render() {
    const { t, open, dump, onClose } = this.props;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{t('Raw LDAP data')}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <pre>{dump}</pre>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            variant="contained"
            color="secondary"
          >
            {t('Close')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

DeleteUser.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool,
  dump: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(DeleteUser));
