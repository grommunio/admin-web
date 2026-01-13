// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, DialogContent, FormControlLabel, Checkbox, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';


const DeleteFolder = props => {
  const [state, setState] = useState({
    loading: false,
    clear: false,
    taskMessage: '',
    taskID: null,
  });
  const navigate = useNavigate();
  

  const handleDelete = () => {
    const { id, onSuccess, onError, domainID } = props;
    const { clear } = state;
    setState({ ...state, loading: true });
    props.delete(domainID, id, { clear })
      .then(response => {
        if(response?.taskID) {
          setState({
            ...state,
            taskMessage: response.message || 'Task created',
            loading: false,
            taskID: response.taskID,
          });
        } else {
          onSuccess();
          setState({ ...state, loading: false, clear: false });
        }
      })
      .catch(error => {
        if(onError) onError(error);
        setState({ ...state, loading: false, clear: false });
      });
  }

  const handleCheckbox = e => setState({ ...state, clear: e.target.checked })

  const handleViewTask = () => {
    navigate('/taskq/' + state.taskID);
  }

  const handleClose = () => {
    setState({ ...state, taskMessage: '', taskID: null });
    props.onClose();
  }

  const { t, open, item, onClose } = props;
  const { loading, clear, taskMessage, taskID } = state;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{taskMessage ? taskMessage : `Are you sure you want to delete ${item}?`}</DialogTitle>
      <DialogContent>
        {!taskMessage && <FormControlLabel
          control={<Checkbox onChange={handleCheckbox} value={clear} />}
          label={t('Clear folder data')}
        />}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          color="secondary"
        >
          {t(taskMessage ? 'Close' : 'Cancel')}
        </Button>
        {!taskMessage && <Button
          onClick={handleDelete}
          variant="contained"
          color="secondary"
        >
          {loading ? <CircularProgress size={24}/> : t('Confirm')}
        </Button>}
        {taskMessage && taskID > 0 && <Button variant="contained" onClick={handleViewTask}>
          {t('View task')}
        </Button>
        }
      </DialogActions>
    </Dialog>
  );
}

DeleteFolder.propTypes = {
  t: PropTypes.func.isRequired,
  item: PropTypes.string,
  id: PropTypes.string,
  domainID: PropTypes.number,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

export default withTranslation()(DeleteFolder);
