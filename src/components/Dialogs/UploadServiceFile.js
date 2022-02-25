// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
  Grid,
  Typography,
  IconButton, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { uploadServiceFile } from '../../actions/dbconf';
import { Add, Delete } from '@mui/icons-material';

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
  flexTextfield: {
    flex: 1,
    margin: theme.spacing(0, 1, 0, 1),
  },
});

class UploadServiceFile extends PureComponent {

  constructor() {
    super();
    this.fileInputRef = React.createRef();
  }

  state = {
    data: [
      { key: '', value: '' },
    ],
    filename: '',
    service: '',
    loading: false,
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleDataInput = (field, idx) => e => {
    const data = [...this.state.data];
    data[idx][field] = e.target.value;
    this.setState({ data });
  }

  handleAddRow = () => {
    const data = [...this.state.data];
    data.push({ key: '', value: '' });
    this.setState({ data });
  }

  handleRemoveRow = idx => () => {
    const data = [...this.state.data];
    data.splice(idx, 1);
    this.setState({ data });
  }

  handleUpload = () => {
    const { upload } = this.props;
    const { service, filename, data } = this.state;
    this.setState({ loading: true });
    upload(service, filename, this.formatData(data))
      .then(() => {
        this.setState({
          data: [],
          filename: '',
          service: '',
          loading: false,
        });
        this.props.onSuccess();
      })
      .catch(error => {
        this.props.onError(error);
        this.setState({ loading: false });
      });
  }

  formatData(data) {
    const obj = {};
    data.forEach(pair => obj[pair.key] = pair.value);
    return obj;
  }

  render() {
    const { classes, t, open, onClose } = this.props;
    const { service, filename, data, loading } = this.state;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('addHeadline', { item: 'File' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Service name")} 
              fullWidth 
              value={service || ''}
              onChange={this.handleInput('service')}
              autoFocus
              required
            />
            <TextField 
              className={classes.input} 
              label={t("File name")} 
              fullWidth 
              value={filename || ''}
              onChange={this.handleInput('filename')}
              required
            />
            <Typography>Data</Typography>
            {data.map((pair, idx) => <Grid container key={idx}>
              <TextField
                label="key"
                value={pair.key}
                onChange={this.handleDataInput('key', idx)}
                className={classes.flexTextfield}
              />
              <TextField
                label="value"
                value={pair.value}
                onChange={this.handleDataInput('value', idx)}
                className={classes.flexTextfield}
              />
              <IconButton onClick={this.handleRemoveRow(idx)} size="large">
                <Delete color="error"/>
              </IconButton>
            </Grid>
            )}
            <Grid container justifyContent="center">
              <IconButton onClick={this.handleAddRow} size="large">
                <Add color="primary"/>
              </IconButton>
            </Grid>
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
            onClick={this.handleUpload}
            variant="contained"
            color="primary"
            disabled={loading || !service}
          >
            {loading ? <CircularProgress size={24}/> : t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

UploadServiceFile.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  upload: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    upload: async (service, filename, file) => {
      await dispatch(uploadServiceFile(service, filename, file))
        .catch(message => Promise.reject(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(UploadServiceFile)));
