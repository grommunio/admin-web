// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';


const TaskCreated = props => {
  const navigate = useNavigate();

  const handleViewTask = () => {
    navigate('/taskq/' + props.taskID);
  }

  const { t, message, taskID, onClose } = props;

  return (
    <Dialog
      onClose={onClose}
      open={!!message}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{message}</DialogTitle>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Close')}
        </Button>
        {message && taskID > 0 && <Button variant="contained" onClick={handleViewTask}>
          {t('View task')}
        </Button>
        }
      </DialogActions>
    </Dialog>
  );
}

TaskCreated.propTypes = {
  t: PropTypes.func.isRequired,
  message: PropTypes.string,
  taskID: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(TaskCreated);
