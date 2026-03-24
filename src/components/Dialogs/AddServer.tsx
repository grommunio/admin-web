// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
  Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { addServerData } from '../../actions/servers';
import { useAppDispatch } from '../../store';
import { NewServer } from '@/types/servers';
import { ChangeEvent } from '@/types/common';


const useStyles = makeStyles()((theme: Theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  select: {
    minWidth: 60,
  },
}));


type AddServerProps = {
  open: boolean;
  onClose: () => void;
  onError: (error: string) => void;
  onSuccess: () => void;
}

const AddServer = (props: AddServerProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [server, setServer] = useState<NewServer>({
    hostname: '',
    extname: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInput = (field: keyof NewServer) => (event: ChangeEvent) => {
    setServer({
      ...server,
      [field]: event.target.value,
    });
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const { onSuccess, onError } = props;
    setLoading(true);
    dispatch(addServerData(server))
      .then(() => {
        setServer({
          hostname: '',
          extname: '',
        });
        setLoading(false);
        onSuccess();
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const { open, onClose } = props;
  const { hostname, extname } = server;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{t('addHeadline', { item: 'Server' })}</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("Hostname")} 
            fullWidth 
            value={hostname || ''}
            onChange={handleInput('hostname')}
            autoFocus
            required
          />
          <TextField 
            className={classes.input} 
            label={t("extname")} 
            fullWidth 
            value={extname || ''}
            onChange={handleInput('extname')}
            required
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          color="primary"
          disabled={loading || !hostname || !extname}
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default AddServer;
