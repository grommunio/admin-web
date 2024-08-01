// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, DialogContent, FormControlLabel, Checkbox, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { DOMAIN_PURGE } from '../../constants';
import { deleteDomainData } from '../../actions/domains';


const DeleteDomain = props => {
  const [state, setState] = useState({
    loading: false,
    purge: false,
    deleteFiles: false,
  });
  const dispatch = useDispatch();

  const handleDelete = e => {
    e.preventDefault();
    const { id, onSuccess, onError } = props;
    const { purge, deleteFiles } = state;
    setState({ ...state, loading: true });
    dispatch(deleteDomainData(id, { purge, deleteFiles }))
      .then(() => {
        if(onSuccess) onSuccess();
        setState({ ...state, loading: false });
      })
      .catch(err => {
        if(onError) onError(err);
        setState({ ...state, loading: false });
      });
  }

  const handlePurge = e => {
    const val = e.target.checked;
    setState({
      ...state,
      purge: val,
      deleteFiles: false,
    });
  }

  const { t, open, item, onClose, capabilities } = props;
  const { loading, purge, deleteFiles } = state;
  const canPurge = capabilities.includes(DOMAIN_PURGE);
  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t('deleteDialog', { item })}?</DialogTitle>
      {canPurge && <DialogContent>
        <FormControlLabel
          control={
            <Checkbox
              checked={purge}
              onChange={handlePurge}
              name="checked"
              color="primary"
            />
          }
          label={t("Delete permanently?")}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={deleteFiles}
              onChange={() => setState({ ...state, deleteFiles: !deleteFiles })}
              name="checked"
              color="primary"
              disabled={!purge}
            />
          }
          label={t("Delete files?")}
        />
      </DialogContent>}
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

DeleteDomain.propTypes = {
  t: PropTypes.func.isRequired,
  item: PropTypes.string,
  id: PropTypes.number,
  open: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  capabilities: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    capabilities: state.auth.capabilities,
  };
};

export default connect(mapStateToProps)(
  withTranslation()(DeleteDomain)); 
