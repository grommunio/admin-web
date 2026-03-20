// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { Portal, Snackbar, Alert } from '@mui/material';
import PANIK from '../res/panik.png';
import { useTranslation, withTranslation } from 'react-i18next';
import { useAppSelector } from '../store';


type FeedbackProps = {
  snackbar?: string;
  onClose: () => void;
}

const Feedback = ({ snackbar, onClose }: FeedbackProps) => {
  const { t } = useTranslation();
  const config = useAppSelector((state) => state.config);
  const msg = (snackbar || '').toString();
  return (
    <Portal>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={!!snackbar}
        onClose={onClose}
        autoHideDuration={(msg || '').includes('Success!') ? 2000 : 6000}
        transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
      >
        <Alert
          onClose={onClose}
          severity={(msg || '').includes('Success!') ? "success" : "error"}
          elevation={6}
          variant="filled"
        >
          {(msg || '') === "The server encountered an error while processing the request." && config.devMode ?
            <img src={PANIK} alt="PANIK" height="80" width="78"/> :
            t(msg || '')}
        </Alert>
      </Snackbar>
    </Portal>
  );
}


export default withTranslation()(Feedback);
