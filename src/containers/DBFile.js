// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  Button,
  IconButton,
} from '@mui/material';
import { connect } from 'react-redux';
import { fetchServiceFile, editServiceFile } from '../actions/dbconf';
import { Add, Delete } from '@mui/icons-material';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  flexTextfield: {
    flex: 1,
    margin: theme.spacing(0, 1, 0, 1),
  },
});

class DBFile extends PureComponent {

  state = {
    data: [],
    unsaved: false,
    deleting: false,
  }

  async componentDidMount() {
    const { fetch } = this.props;
    const splits = window.location.pathname.split('/');
    const file = await fetch(splits[2], splits[3])
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    
    const data = [];
    Object.entries(file?.data || {}).forEach(([key, value]) => data.push({ key, value }));
    this.setState({
      data,
    });
  }

  handleInput = field => event => {
    this.setState({
      data: {
        ...this.state.data,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
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

  handleEdit = () => {
    const splits = window.location.pathname.split('/');
    this.props.edit(splits[2], splits[3], { data: this.formatData(this.state.data) })
      .then(resp => this.setState({ snackbar: 'Success! ' + (resp?.message || '')}))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  formatData(data) {
    const obj = {};
    data.forEach(pair => obj[pair.key] = pair.value);
    return obj;
  }

  render() {
    const { classes, t, history } = this.props;
    const { snackbar, data } = this.state;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    return (
      <ViewWrapper
        topbarTitle={t('DB Service')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container>
            <Typography
              color="primary"
              variant="h5"
            >
              {t('editHeadline', { item: 'File' })}
            </Typography>
          </Grid>
          <FormControl className={classes.form}>
            {data.map((pair, idx) => <Grid container key={idx}>
              <TextField
                label="key"
                value={pair.key}
                onChange={this.handleDataInput('key', idx)}
                className={classes.flexTextfield}
                variant="standard"
              />
              <TextField
                label="value"
                value={pair.value}
                onChange={this.handleDataInput('value', idx)}
                className={classes.flexTextfield}
                variant="standard"
              />
              {writable && <IconButton onClick={this.handleRemoveRow(idx)} size="large">
                <Delete color="error"/>
              </IconButton>}
            </Grid>
            )}
            {writable && <Grid container justifyContent="center">
              <IconButton onClick={this.handleAddRow} size="large">
                <Add color="primary"/>
              </IconButton>
            </Grid>}
          </FormControl>
          <Button
            color="secondary"
            onClick={history.goBack}
            style={{ marginRight: 8 }}
          >
            {t('Back')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleEdit}
            disabled={!writable}
          >
            {t('Save')}
          </Button>
        </Paper>
      </ViewWrapper>
    );
  }
}

DBFile.contextType = CapabilityContext;
DBFile.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (service, filename) => await dispatch(fetchServiceFile(service, filename))
      .then(file => file)
      .catch(message => Promise.reject(message)),
    edit: async (service, filename, file) => await dispatch(editServiceFile(service, filename, file))
      .then(file => file)
      .catch(message => Promise.reject(message)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DBFile)));
