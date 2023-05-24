// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { Button, FormControl, Grid, MenuItem, Tab, Tabs, TextField } from '@mui/material';
import { withStyles, withTheme } from '@mui/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect as connecc } from 'react-redux';
import { fetchUserOof, setUserOof } from '../../actions/users';
import CustomDateTimePicker from '../CustomDateTimePicker';
import Feedback from '../Feedback';
import { withRouter } from 'react-router';
import moment from 'moment';
import {
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnRedo,
  BtnStrikeThrough,
  BtnStyles,
  BtnUnderline,
  BtnUndo,
  HtmlButton,
  Separator,
  EditorProvider,
  Editor,
  Toolbar } from 'react-simple-wysiwyg';
import * as DOMPurify from 'dompurify';

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
  editor: {
    backgroundColor: '#f0f !important',
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
      // Only send dates when oof is scheduled
      startTime: [0, 1].includes(state) ? undefined : moment(startTime).format('YYYY-MM-DD hh:mm') + ':00',
      endTime: [0, 1].includes(state) ? undefined : moment(endTime).format('YYYY-MM-DD hh:mm') + ':00',
      internalSubject: DOMPurify.sanitize(internalSubject),
      internalReply,
      externalSubject: DOMPurify.sanitize(externalSubject),
      externalReply,
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  render() {
    const { classes, t, history, theme } = this.props;
    const { tab, state, startTime, endTime, snackbar, internalReply, externalReply } = this.state;
    const editorClass = theme.palette.mode === "dark" ? "wysiwyg" : "";

    const tfProps = (label, field) => ({
      fullWidth: true,
      disabled: state === 0,
      label: t(label),
      value: this.state[field],
      onChange: this.handleInput(field),
    });

    return (<>
      <FormControl className={classes.form}>
        <div className={classes.flexRow}>
          <TextField
            {...tfProps("State ", "state")}
            select
            className={classes.input}
            disabled={false}
          >
            {this.oofStates.map((status, key) => (
              <MenuItem key={key} value={status.value}>
                {t(status.label)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            {...tfProps("External audience", "externalAudience")}
            select
            className={classes.input}
            disabled={false}
          >
            {this.externalAudiences.map((audience, key) => (
              <MenuItem key={key} value={audience.value}>
                {t(audience.label)}
              </MenuItem>
            ))}
          </TextField>
          <CustomDateTimePicker
            {...tfProps("Start time", "startTime")}
            onChange={this.handleDateInput('startTime')}
            className={classes.input}
          />
          <CustomDateTimePicker
            {...tfProps("End time", "endTime")}
            onChange={this.handleDateInput('endTime')}
            className={classes.input}
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
            {...tfProps("Internal subject", "internalSubject")}
            className={classes.mail}
          />
          <div className={classes.mail}>
            <EditorProvider>
              <Editor
                style={{ minHeight: 100 }}
                value={internalReply}
                onChange={this.handleInput("internalReply")}
              >
                <Toolbar id={editorClass}>
                  <BtnUndo id={editorClass}/>
                  <BtnRedo id={editorClass}/>
                  <Separator id={editorClass}/>
                  <BtnBold id={editorClass}/>
                  <BtnItalic id={editorClass}/>
                  <BtnUnderline id={editorClass}/>
                  <BtnStrikeThrough id={editorClass}/>
                  <Separator id={editorClass}/>
                  <BtnNumberedList id={editorClass}/>
                  <BtnBulletList id={editorClass}/>
                  <Separator id={editorClass}/>
                  <BtnLink id={editorClass}/>
                  <BtnClearFormatting id={editorClass}/>
                  <HtmlButton id={editorClass}/>
                  <Separator id={editorClass}/>
                  <BtnStyles id={editorClass}/>
                </Toolbar>
              </Editor>
            </EditorProvider>
          </div>
        </div>}
        {tab === 1 && <div className={classes.tabs}>
          <TextField
            {...tfProps("External subject", "externalSubject")}
            className={classes.mail}
          />
          <div className={classes.mail}>
            <Editor
              style={{ minHeight: 100 }}
              value={externalReply}
              onChange={this.handleInput("externalReply")}
            />
          </div>
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
  theme: PropTypes.object.isRequired,
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
  withTranslation()(withStyles(styles)(withTheme(Oof)))));