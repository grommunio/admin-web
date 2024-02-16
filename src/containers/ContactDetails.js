// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import { Button, Divider, Grid, Paper, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import ViewWrapper from '../components/ViewWrapper';
import { withTranslation } from 'react-i18next';
import User from '../components/user/User';
import Contact from '../components/user/Contact';
import { editUserData, fetchUserData } from '../actions/users';
import { connect } from 'react-redux';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
  },
  header: {
    marginBottom: 16,
  },
  buttonGrid: {
    margin: theme.spacing(1, 0, 0, 1),
  },
  flexRow: {
    display: 'flex',
    margin: theme.spacing(0, 0, 2, 0),
  },
  propertyInput: {
    margin: theme.spacing(1, 1, 1, 1),
    flex: 1,
  },
});

class ContactDetails extends PureComponent {

  state = {
    user: {
      properties: {},
    },
    loading: true,
  }

  async componentDidMount() {
    const { fetch } = this.props;
    const splits = window.location.pathname.split('/');
    const user = await fetch(splits[1], splits[3])
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    user.syncPolicy = user.syncPolicy || {};
    this.setState({ user, loading: false });
  }

  handlePropertyChange = field => event => {
    const { user } = this.state;
    this.setState({
      user: {
        ...user,
        properties: {
          ...user.properties,
          [field]: event.target.value,
        },
      },
      unsaved: true,
    });
  }

  handleEdit = () => {
    const { edit, domain } = this.props;
    const { user } = this.state;
    const { properties } = user;
    
    edit(domain.ID, {
      ID: user.ID,
      properties: {
        ...properties,
        messagesizeextended: undefined,
        storagequotalimit: undefined,
        prohibitreceivequota: undefined,
        prohibitsendquota: undefined,
      },
    }).then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  render() {
    const { classes, t, history } = this.props;
    const { snackbar, user, loading } = this.state;
    const { properties } = user;

    return (
      <ViewWrapper
        topbarTitle={t('Users')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
        loading={loading}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container className={classes.header}>
            <Typography
              color="primary"
              variant="h5"
            >
              {t('editHeadline', { item: 'Contact' })} {properties.displayname ? ` - ${properties.displayname}` : ''}
            </Typography>
          </Grid>
          <div className={classes.flexRow}>
            <Typography variant="h6">{t('E-Mail')}</Typography>
          </div>
          <TextField
            className={classes.propertyInput}
            fullWidth
            label={t("E-Mail Address")}
            value={properties.smtpaddress || ''}
            onChange={this.handlePropertyChange('smtpaddress')}
          />
          <User
            user={user}
            handlePropertyChange={this.handlePropertyChange}
          />
          <Divider />
          <Contact
            user={user}
            handlePropertyChange={this.handlePropertyChange}
          />
          <Grid container className={classes.buttonGrid}>
            <Button
              onClick={history.goBack}
              style={{ marginRight: 8 }}
              color="secondary"
            >
              {t('Back')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleEdit}
            >
              {t('Save')}
            </Button>
          </Grid>
        </Paper>
      </ViewWrapper>
    );
  }
}

ContactDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, userID) => await dispatch(fetchUserData(domainID, userID, true))
      .then(user => user)
      .catch(msg => Promise.reject(msg)),
    edit: async (domainID, user) => 
      await dispatch(editUserData(domainID, user)).catch(msg => Promise.reject(msg)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(ContactDetails)));
