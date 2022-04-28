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
} from '@mui/material';
import { connect } from 'react-redux';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { editCreateParamsData, fetchCreateParamsData } from '../actions/defaults';

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
  input: {
    marginBottom: theme.spacing(3),
  },
});

class Defaults extends PureComponent {

  state = {
    createParams: {
      maxUser: '',
    },
    unsaved: false,
    autocompleteInput: '',
  }

  componentDidMount() {
    const { fetch } = this.props;
    fetch()
      .then(() => {
        const { createParams } = this.props;
        // Update mask
        this.setState({
          createParams: {
            ...this.state.createParams,
            ...(createParams.domain || {}),
            ...(createParams.user || {}),
          },
        });
      })
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleInput = field => event => {
    this.setState({
      createParams: {
        ...this.state.createParams,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleEdit = () => {
    const { edit } = this.props;
    const { createParams } = this.state;
    const { maxUser } = createParams;
    edit({
      //TODO: Format properly
      domain: {
        maxUser: parseInt(maxUser) || '',
      },
      user: {},
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  render() {
    const { classes, t } = this.props;
    const { createParams, snackbar } = this.state;
    const { maxUser } = createParams;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);

    return (
      <ViewWrapper
        topbarTitle={t('Defaults')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container>
            <Typography
              color="primary"
              variant="h5"
            >
              {t('editHeadline', { item: 'Defaults' })}
            </Typography>
          </Grid>
          <FormControl className={classes.form}>
            <Typography
              color="primary"
              variant="h6"
              className=''
            >
              {t('Domain create parameters')}
            </Typography>
            <TextField 
              className={classes.input} 
              label={t("Max users")}
              onChange={this.handleInput('maxUser')}
              fullWidth 
              value={maxUser || ''}
              autoFocus
            />
          </FormControl>
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

Defaults.contextType = CapabilityContext;
Defaults.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  createParams: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    createParams: state.defaults.CreateParams,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async createParams => await dispatch(editCreateParamsData(createParams))
      .catch(message => Promise.reject(message)),
    fetch: async () => await dispatch(fetchCreateParamsData())
      .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Defaults)));
