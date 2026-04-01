// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, DialogContent, FormControlLabel, Checkbox, 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DOMAIN_PURGE } from '../../constants';
import { deleteDomainData } from '../../actions/domains';
import { useAppDispatch, useAppSelector } from '../../store';
import { ChangeEvent } from '@/types/common';


type DeleteDomainProps = {
  id: number;
  open: boolean;
  item: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (err: string) => void;
}


const DeleteDomain = (props: DeleteDomainProps) => {
  const [state, setState] = useState({
    loading: false,
    purge: false,
    deleteFiles: false,
  });
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { capabilities } = useAppSelector(state => state.auth);

  const handleDelete = (e: React.MouseEvent) => {
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

  const handlePurge = (_: ChangeEvent, checked: boolean) => {
    setState({
      ...state,
      purge: checked,
      deleteFiles: false,
    });
  }

  const { open, item, onClose } = props;
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


export default DeleteDomain;
