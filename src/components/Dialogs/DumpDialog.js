// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent,Button,
  DialogActions,
} from '@mui/material';
import { withTranslation } from 'react-i18next';


const DeleteUser = props => {

  const { t, open, dump, onClose } = props;

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
          color="secondary"
        >
          {t('Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DeleteUser.propTypes = {
  t: PropTypes.func.isRequired,
  open: PropTypes.bool,
  dump: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(DeleteUser);
