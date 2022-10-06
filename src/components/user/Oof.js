// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { Button, FormControl, Grid, MenuItem, Tab, Tabs, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect as connecc } from 'react-redux';
import { fetchUserOof, setUserOof } from '../../actions/users';
import CustomDateTimePicker from '../CustomDateTimePicker';
import Feedback from '../Feedback';
import { withRouter } from 'react-router';
import moment from 'moment';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  gridItem: {
    display: 'flex',
  },
  divider: {
    margin: theme.spacing(2, 0, 2, 0),
  },
  flexRow: {
    display: 'flex',
    margin: theme.spacing(1, 0),
  },
  datePicker: {
    marginRight: 8,
  },
  tabs: {
    margin: theme.spacing(1),
  },
  mail: {
    margin: theme.spacing(1, 0),
  },
});

class Oof extends PureComponent {

  state = {
    state: 0,
    externalAudience: 0,
    startTime: null,
    endTime: null,
    internalSubject: "",
    internalReply: "",
    externalSubject: "",
    externalReply: "",
    tab: 0,
    snackbar: '',
  }

  async componentDidMount() {
    const { domainID, userID, fetchOof } = this.props;
    const oof = await fetchOof(domainID, userID)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    this.setState({
      ...(oof || {}),
    })
  }

  oofStates = [
    { value: 0, label: 'Disabled' },
    { value: 1, label: 'Enabled' },
    { value: 2, label: 'Scheduled' },
  ]

  externalAudiences = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Known' },
    { value: 2, label: 'All' },
  ]

  handleInput = field => e => {
    this.setState({ [field]: e.target.value });
  }

  handleDateInput = field => newVal => {
    this.setState({ [field]: newVal });
  }

  handleTabChange = (e, tab) => this.setState({ tab });

  handleSave = () => {
    const { domainID, userID, setOof } = this.props;
    const { state, externalAudience, startTime, endTime, internalSubject, internalReply, externalSubject, externalReply } = this.state;
    setOof(domainID, userID, {
      state,
      externalAudience,
      startTime: state == 0 ? undefined : moment(startTime).format('YYYY-MM-DD hh:mm') + ':00',
      endTime: state == 0 ? undefined : moment(endTime).format('YYYY-MM-DD hh:mm') + ':00',
      internalSubject,
      internalReply,
      externalSubject,
      externalReply,
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  render() {
    const { classes, t, history } = this.props;
    const { tab, state, externalAudience, startTime, endTime, internalSubject, internalReply, externalReply, externalSubject,
      snackbar } = this.state;
    return (<>
      <FormControl className={classes.form}>
        <div className={classes.flexRow}>
          <TextField
            select
            className={classes.input}
            label={t("State ")}
            fullWidth
            value={state}
            onChange={this.handleInput('state')}
          >
            {this.oofStates.map((status, key) => (
              <MenuItem key={key} value={status.value}>
                {t(status.label)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            className={classes.input}
            label={t("External audience")}
            fullWidth
            value={externalAudience}
            onChange={this.handleInput('externalAudience')}
          >
            {this.externalAudiences.map((audience, key) => (
              <MenuItem key={key} value={audience.value}>
                {t(audience.label)}
              </MenuItem>
            ))}
          </TextField>
          <CustomDateTimePicker
            label="Start time"
            value={startTime}
            onChange={this.handleDateInput('startTime')}
            className={classes.input}
            fullWidth
            disabled={state === 0}
          />
          <CustomDateTimePicker
            label="End time"
            value={endTime}
            onChange={this.handleDateInput('endTime')}
            className={classes.input}
            fullWidth
            disabled={state === 0}
          />
        </div>
        <Tabs
          indicatorColor="primary"
          value={tab}
          onChange={this.handleTabChange}
          className={classes.tabs}
        >
          <Tab label={t("Inside my organization")} />
          <Tab label={t("Outside my organization")} />
        </Tabs>
        {tab === 0 && <div className={classes.tabs}>
          <TextField 
            label={t("Internal subject")}
            fullWidth
            value={internalSubject || ''}
            onChange={this.handleInput('internalSubject')}
            className={classes.mail}
            disabled={state === 0}
          />
          <TextField 
            label={t("Internal reply")}
            fullWidth
            value={internalReply || ''}
            onChange={this.handleInput('internalReply')}
            multiline
            rows={4}
            className={classes.mail}
            disabled={state === 0}
          />
        </div>}
        {tab === 1 && <div className={classes.tabs}>
          <TextField 
            label={t("External subject")}
            fullWidth
            value={externalSubject || ''}
            onChange={this.handleInput('externalSubject')}
            className={classes.mail}
            disabled={state === 0}
          />
          <TextField 
            label={t("External reply")}
            fullWidth
            value={externalReply || ''}
            onChange={this.handleInput('externalReply')}
            multiline
            rows={4}
            className={classes.mail}
            disabled={state === 0}
          />
        </div>}
      </FormControl>
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
          onClick={this.handleSave}
          disabled={startTime && moment(startTime).isAfter(endTime)}
        >
          {t('Save')}
        </Button>
      </Grid>
      <Feedback
        snackbar={snackbar}
        onClose={() => this.setState({ snackbar: '' })}
      />
    </>
    );
  }
}

Oof.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  fetchOof: PropTypes.func.isRequired,
  setOof: PropTypes.func.isRequired,
  domainID: PropTypes.number.isRequired,
  userID: PropTypes.number.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    fetchOof: async (domainID, userID) => 
      await dispatch(fetchUserOof(domainID, userID))
        .catch(err => Promise.reject(err)),
    setOof: async (domainID, userID, oofSettings) => 
      await dispatch(setUserOof(domainID, userID, oofSettings))
        .catch(err => Promise.reject(err)),
  };
}

export default withRouter(connecc(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Oof))));