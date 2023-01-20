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
  Button,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import { connect } from 'react-redux';
import { getStringAfterLastSlash, getTaskState, setDateTimeString } from '../utils';
import Feedback from '../components/Feedback';
import ViewWrapper from '../components/ViewWrapper';
import { fetchTaskDetails } from '../actions/taskq';
import { green, red } from '@mui/material/colors';
import { Refresh } from '@mui/icons-material';

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
  select: {
    minWidth: 60,
  },
  description: {
    display: 'inline-block',
    fontWeight: 500,
    minWidth: 240,
  },
  data: {
    padding: '8px 0',
  },
  params: {
    padding: '16px 0 8px 0',
  },
  param: {
    padding: '4px 16px',
  },
  resultParam: {
    padding: '4px 8px 4px 0px',
  },
  resultKey: {
    display: 'inline-block',
    fontWeight: 500,
    minWidth: 120,
  },
  container: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  resultObj: {
    margin: theme.spacing(3, 0),
  },
  flexRow: {
    padding: '4px 0px',
    display: 'flex',
  },
  centerRow: {
    display: 'flex',
    alignItems: 'center',
  },
});

class TaskDetails extends PureComponent {

  state = {
    ID: -1,
    command: '',
    state: 0,
    created: null,
    updated: null,
    message: '',
    params: {},
    loading: false,
  }

  componentDidMount() {
    this.refresh();
  }

  refresh = async () => {
    const { fetch } = this.props;
    this.setState({ loading: true });
    const task = await fetch(getStringAfterLastSlash())
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    this.setState({
      loading: false,
      ...(task ? {
        ...task,
        params: task.params || {},
      } : {})
    });
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  render() {
    const { classes, t } = this.props;
    const { loading, snackbar, ID, command, state, created, updated, message, params } = this.state;

    return (
      <ViewWrapper
        topbarTitle={t('Task queue')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
        loading={loading}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container direction="column" className={classes.container}>
            <div className={classes.centerRow}>
              <Typography variant='h6' className={classes.description}>{t('Task ID')}:</Typography>
              {ID || t('Unknown')}
            </div>
            <div className={classes.centerRow}>
              <Typography variant='h6' className={classes.description}>{t('Command')}:</Typography>
              {command || t('Unknown')}
            </div>
            <div className={classes.centerRow}>
              <Typography variant='h6' className={classes.description}>{t('State ')}:</Typography>
              {t(getTaskState(state)) || t('Unknown')}
              <IconButton onClick={this.refresh}>
                <Refresh color="primary"/>
              </IconButton>
            </div>
            <div className={classes.centerRow}>
              <Typography variant='h6' className={classes.description}>{t('Message')}:</Typography>
              {message || t('Unknown')}
            </div>
            <div className={classes.centerRow}>
              <Typography variant='h6' className={classes.description}>{t('Created')}:</Typography>
              {setDateTimeString(created) || t('Unknown')}
            </div>
            <div className={classes.centerRow}>
              <Typography variant='h6' className={classes.description}>{t('Updated')}:</Typography>
              {setDateTimeString(updated) || t('Unknown')}
            </div>
            
            <Divider style={{ marginTop: 8 }}/>
            <Typography variant="h6" className={classes.params}>
              {t('Params')}
            </Typography>
            {Object.entries(params).map(([param, value], key) => {
              const displayValue = JSON.stringify(value);
              return param !== 'result' ? <div className={classes.centerRow}>
                <Typography className={classes.description}>{param}:</Typography>
                {displayValue || t('Unknown')}
              </div> :
                <div className={classes.flexRow} key={key}>
                  <div className={classes.description}>{param}</div>
                  <div>
                    {(value || []).map(({username, code, message}, idx) =>
                      <Tooltip key={idx} placement='right' title={message || ''}>
                        <Typography className={classes.resultParam}>
                          <span
                            style={{
                              marginRight: 8,
                              backgroundColor: code < 300 /* code 2xx */ ? green['500'] : red['500'],
                              borderRadius: 4,
                              padding: '2px 4px',
                            }}
                          >
                            {code}
                          </span>
                          {username}
                        </Typography>
                      </Tooltip>
                    )}
                  </div>
                </div>;
            })}
          </Grid>
          <Button
            color="secondary"
            onClick={this.handleNavigation('taskq')}
          >
            {t('Back')}
          </Button>
        </Paper>
        <Feedback
          snackbar={snackbar}
          onClose={() => this.setState({ snackbar: '' })}
        />
      </ViewWrapper>
    );
  }
}

TaskDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, id) => await dispatch(fetchTaskDetails(domainID, id))
      .then(task => task)
      .catch(message => Promise.reject(message)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(TaskDetails)));
