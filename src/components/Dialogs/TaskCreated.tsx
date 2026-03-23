// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { Dialog, DialogTitle, Button, DialogActions, 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';


type TaskCreatedProps = {
  taskID: number;
  message: string;
  onClose: () => void;
}


const TaskCreated = (props: TaskCreatedProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleViewTask = () => {
    navigate('/taskq/' + props.taskID);
  }

  const { message, taskID, onClose } = props;

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


export default TaskCreated;
