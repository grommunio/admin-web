// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addServerData } from '../../actions/servers';

const styles = theme => ({
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
});

const AddServer = props => {
  const [server, setServer] = useState({
    hostname: '',
    extname: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInput = field => event => {
    setServer({
      ...server,
      [field]: event.target.value,
    });
  }

  const handleAdd = e => {
    e.preventDefault();
    const { add, onSuccess, onError } = props;
    setLoading(true);
    add(server)
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

  const { classes, t, open, onClose } = props;
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

AddServer.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    add: async server => {
      await dispatch(addServerData(server))
        .catch(message => Promise.reject(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(AddServer, styles)));
