// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
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

class AddServer extends PureComponent {

  state = {
    hostname: '',
    extname: '',
    loading: false,
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleAdd = () => {
    const { add, onSuccess, onError } = this.props;
    const { hostname, extname } = this.state;
    this.setState({ loading: true });
    add({
      hostname,
      extname,
    })
      .then(() => {
        this.setState({
          hostname: '',
          extname: '',
          loading: false,
        });
        onSuccess();
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  render() {
    const { classes, t, open, onClose } = this.props;
    const { hostname, extname, loading } = this.state;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="md"
        fullWidth
        TransitionProps={{
          onEnter: this.handleEnter,
        }}>
        <DialogTitle>{t('addHeadline', { item: 'Server' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Hostname")} 
              fullWidth 
              value={hostname || ''}
              onChange={this.handleInput('hostname')}
              autoFocus
              required
            />
            <TextField 
              className={classes.input} 
              label={t("extname")} 
              fullWidth 
              value={extname || ''}
              onChange={this.handleInput('extname')}
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
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={loading || !hostname || !extname}
          >
            {loading ? <CircularProgress size={24}/> : t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
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
  withTranslation()(withStyles(styles)(AddServer)));
