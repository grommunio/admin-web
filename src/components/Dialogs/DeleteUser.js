// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent,Button,
  DialogActions, FormControlLabel, Checkbox, CircularProgress, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { deleteUserData } from '../../actions/users';


const DeleteUser = props => {
  const [state, setState] = useState({
    deleteFiles: false,
    deleteChatUser: false,
    loading: false,
  });

  const handleDelete = e => {
    e.preventDefault();
    const { user, domainID, onSuccess, onError } = props;
    const { deleteFiles, deleteChatUser } = state;
    setState({ ...state, loading: true });
    props.delete(domainID, user.ID, { deleteFiles, deleteChatUser })
      .then(() => {
        if(onSuccess) onSuccess();
        setState({ ...state, loading: false });
      })
      .catch(() => {
        if(onError) onError();
        setState({ ...state, loading: false });
      });
  }

  const handleCheckbox = field => () => setState({ ...state, [field]: !state[field] });

  const { t, open, user, onClose } = props;
  const { deleteFiles, deleteChatUser, loading } = state;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Are you sure you want to delete {user.username}?</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={deleteFiles}
              onChange={handleCheckbox("deleteFiles")}
              name="deleteFiles"
              color="primary"
            />
          }
          label={t("Delete files?")}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={deleteChatUser}
              onChange={handleCheckbox("deleteChatUser")}
              name="deleteChatUser"
              color="primary"
            />
          }
          label={t("Delete grommunio-chat user")}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="secondary"
          type="submit"
          autoFocus
        >
          {loading ? <CircularProgress size={24}/> : t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DeleteUser.propTypes = {
  t: PropTypes.func.isRequired,
  user: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]).isRequired,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  domainID: PropTypes.number.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    delete: async (domainID, id, params) => {
      await dispatch(deleteUserData(domainID, id, params))
        .catch(error => Promise.reject(error));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(DeleteUser));
