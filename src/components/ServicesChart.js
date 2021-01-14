// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Typography, Chip, IconButton, CircularProgress, Snackbar, Portal } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import Stop from '@material-ui/icons/HighlightOff';
import Restart from '@material-ui/icons/Replay';
import Start from '@material-ui/icons/PlayCircleFilledOutlined';
import { connect } from 'react-redux';
import { serviceAction } from '../actions/services';
import { withTranslation } from 'react-i18next';
import green from '../colors/green';
import red from '../colors/red';
import grey from '../colors/grey';
import orange from '../colors/orange';

const styles = theme => ({
  chipLabel: {
    width: 220,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipsPaper: {
    display: 'flex',
    flexWrap: 'wrap',
    borderRadius: 8,
    padding: theme.spacing(0, 0, 2, 0),
  },
  chipContainer: {
    margin: theme.spacing(1, 2),
    display: 'flex',
    alignItems: 'center',
    flex: '0 1 auto',
    minWidth: 250,
  },
  chipIcon: {
    padding: 6,
  },
  iconButton: {
    color: 'black',
  },
  activeChip: {
    backgroundColor: green['500'],
  },
  errorChip: {
    backgroundColor: red['500'],
  },
  inactiveChip: {
    color: 'white',
    backgroundColor: grey['700'],
  },
  failedChip: {
    backgroundColor: red['800'],
  },
  activatingChip: {
    backgroundColor: orange['500'],
  },
  deactivatingChip: {
    backgroundColor: grey['300'],
  },
  legendContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(0, 0, 2, 0),
  },
  serviceName: {
    fontWeight: 300,
  },
});

class ServicesChart extends Component {

  state = {
    snackbar: null,
    starting: false,
    restarting: false,
    stoping: false,
  }

  handleServiceAction = (service, action) => () => {
    this.setState({ [action + 'ing']: service.name });
    this.props.serviceAction(service.unit, action)
      .then(() => this.setState({ [action + 'ing']: false }))
      .catch(msg => this.setState({ snackbar: msg, [action + 'ing']: false }));
  }

  getChipColor(state) {
    const { activeChip, errorChip, inactiveChip, failedChip, activatingChip, deactivatingChip } = this.props.classes;
    switch(state) {
      case 'active': return activeChip;
      case 'error': return errorChip;
      case 'inactive': return inactiveChip;
      case 'failedChip': return failedChip;
      case 'activatingChip': return activatingChip;
      case 'deactivating': return deactivatingChip;
      default: return inactiveChip;
    }
  }

  render() {
    const { classes, Services } = this.props;
    const { starting, restarting, stoping } = this.state;

    return (
      <div>
        <div className={classes.chipsPaper}>
          {Services.map((service, idx) =>
            <div key={idx} className={classes.chipContainer}>
              <Chip
                label={
                  <div className={classes.chipLabel}>
                    <Typography className={classes.serviceName} variant="inherit">
                      {service.name}
                    </Typography>
                    <div>
                      {stoping !== service.name ? <IconButton
                        onClick={this.handleServiceAction(service, 'stop')}
                        className={classes.chipIcon}
                      >
                        <Stop className={classes.iconButton} color="inherit" fontSize="small"/>
                      </IconButton> : 
                        <IconButton disabled className={classes.chipIcon}>
                          <CircularProgress size={18}/>
                        </IconButton>}
                      {restarting !== service.name ? <IconButton
                        onClick={this.handleServiceAction(service, 'restart')}
                        className={classes.chipIcon}
                      >
                        <Restart className={classes.iconButton} color="inherit" fontSize="small"/>
                      </IconButton> : 
                        <IconButton disabled className={classes.chipIcon}>
                          <CircularProgress size={18}/>
                        </IconButton>}
                      {starting !== service.name ? <IconButton
                        onClick={this.handleServiceAction(service, 'start')}
                        className={classes.chipIcon}
                      >
                        <Start className={classes.iconButton} color="inherit" fontSize="small"/>
                      </IconButton> : 
                        <IconButton disabled className={classes.chipIcon}>
                          <CircularProgress size={18}/>
                        </IconButton>}
                    </div>
                  </div>
                }
                color="secondary"
                classes={{
                  root: classes.chip,
                  colorSecondary: this.getChipColor(service.state),
                }}
              />
            </div>
          )}
        </div>
        <div className={classes.legendContainer}>
          <BarChart width={510} height={24} data={[{ name: "fake", value: 1 }]}>
            <Bar dataKey="active" fill={green['500']} />
            <Bar dataKey="inactive" fill={grey['700']} />
            <Bar dataKey="error" fill={red['500']} />
            <Bar dataKey="failed" fill={red['800']} />
            <Bar dataKey="activating" fill={orange['500']} />
            <Bar dataKey="deactivating" fill={grey['300']} />
            <Legend />
          </BarChart>
        </div>
        <Portal>
          <Snackbar
            open={!!this.state.snackbar}
            onClose={() => this.setState({ snackbar: '' })}
            autoHideDuration={this.state.snackbar === 'Success!' ? 1000 : 6000}
            transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
          >
            <Alert
              onClose={() => this.setState({ snackbar: '' })}
              severity={this.state.snackbar === 'Success!' ? "success" : "error"}
              elevation={6}
              variant="filled"
            >
              {this.state.snackbar}
            </Alert>
          </Snackbar>
        </Portal>
      </div>
    );
  }
}

ServicesChart.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  Services: PropTypes.array.isRequired,
  serviceAction: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Services: state.services.Services,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    serviceAction: async (service, action) => await dispatch(serviceAction(service, action))
      .catch(error => Promise.reject(error)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(ServicesChart)));
