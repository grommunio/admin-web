// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { Typography, IconButton, CircularProgress, Paper, Table, TableHead, 
  TableRow, TableCell, TableBody, Tooltip, Grid } from "@material-ui/core";
import Stop from "@material-ui/icons/HighlightOff";
import Restart from "@material-ui/icons/Replay";
import Start from "@material-ui/icons/PlayCircleFilledOutlined";
import Enable from "@material-ui/icons/PowerSettingsNew";
import { connect } from "react-redux";
import { serviceAction } from "../actions/services";
import { withTranslation } from "react-i18next";
import Feedback from "./Feedback";

const styles = (theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  paper: {
    flex: 1,
  },
  servicePaper: {
    display: "flex",
    flexWrap: "wrap",
    borderRadius: 8,
    padding: theme.spacing(0, 0, 2, 0),
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
    },
  },
  serviceContainer: {
    margin: theme.spacing(1, 2),
  },
  serviceBox: {
    width: 232,
    borderRadius: 25,
    padding: "2px 10px 2px 15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "default",
    transition: "transform 0.2s ease",

    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  chipIcon: {
    padding: 6,
  },
  label: {
    padding: 2,
    borderRadius: 25,
    minWidth: 40,
    maxWidth: 80,
    margin: 0,
    textAlign: 'center',
    fontSize: 12,
  },
  activeChip: {
    color: "#fff",
    background: "linear-gradient(150deg, #56ab2f, #a8e063)",
  },
  errorChip: {
    color: "#fff",
    fontWeight: "bold",
    background: "linear-gradient(150deg, #FF512F, #DD2476)",
  },
  inactiveChip: {
    color: "white",
    background: "linear-gradient(150deg, #232526, #414345)",
  },
  failedChip: {
    background: "linear-gradient(150deg, #000000, #434343)",
  },
  activatingChip: {
    background: "linear-gradient(150deg, #FFB75E, #ED8F03)",
  },
  deactivatingChip: {
    background: "linear-gradient(150deg, #F2F2F2, #EAEAEA)",
  },
  legendContainer: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 10px",
  },
  rectangle: {
    display: "inline-block",
    width: 15,
    height: 10,
    marginRight: 5,
    backgroundColor: "#abc",
  },
  serviceName: {
    fontWeight: 400,
  },
});

class ServicesChart extends Component {
  state = {
    snackbar: null,
    starting: false,
    restarting: false,
    stoping: false,
    enableing: false,
  };

  handleServiceAction = (service, action) => () => {
    this.setState({ [action + "ing"]: service.name });
    this.props
      .serviceAction(service.unit, action)
      .then(() => this.setState({ [action + "ing"]: false }))
      .catch((msg) =>
        this.setState({ snackbar: msg, [action + "ing"]: false })
      );
  };

  getChipColor(state) {
    const {
      activeChip,
      errorChip,
      inactiveChip,
      failedChip,
      activatingChip,
      deactivatingChip,
    } = this.props.classes;
    switch (state) {
      case "active":
        return activeChip;
      case "error":
        return errorChip;
      case "inactive":
        return inactiveChip;
      case "failedChip":
        return failedChip;
      case "activatingChip":
        return activatingChip;
      case "deactivating":
        return deactivatingChip;
      default:
        return inactiveChip;
    }
  }

  render() {
    const { classes, Services, t } = this.props;
    const { starting, restarting, stoping, snackbar } = this.state;

    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  {"Service"}
                </TableCell>
                <TableCell align="center" style={{ width: 108 }}>
                  {"State | Autostart"}
                </TableCell>
                <TableCell align="center" style={{ width: 132 }}>
                  {"Actions"}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Services.map((service, idx) => (
                <TableRow key={idx} hover style={{cursor: "default"}}>
                  <TableCell>
                    <Typography className={classes.serviceName}>
                      {service.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Grid container>
                      <div
                        style={{ marginRight: 4 }}
                        className={classes.label + " " + this.getChipColor(service.state)}
                      >
                        {service.state}
                      </div>
                      <div className={classes.label + " " +
                        this.getChipColor(service.autostart === "enabled" ? "active" : "error")}>
                        {service.autostart}
                      </div>
                    </Grid>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t("Enable/Disable")} placement="top">
                      <IconButton
                        onClick={this.handleServiceAction(service, service.autostart ? "disable" : "enable")}
                        className={classes.chipIcon}
                      >
                        <Enable className={classes.iconButton} fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {stoping !== service.name ? (
                      <Tooltip title={t("Stop")} placement="top">
                        <IconButton
                          onClick={this.handleServiceAction(service, "stop")}
                          className={classes.chipIcon}
                        >
                          <Stop className={classes.iconButton} fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <IconButton className={classes.chipIcon}>
                        <CircularProgress size={18} />
                      </IconButton>
                    )}
                    {restarting !== service.name ? (
                      <Tooltip title={t("Restart")}placement="top">
                        <IconButton
                          onClick={this.handleServiceAction(service, "restart")}
                          className={classes.chipIcon}
                        >
                          <Restart
                            className={classes.iconButton}
                            fontSize="small"
                          />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <IconButton className={classes.chipIcon}>
                        <CircularProgress size={18} />
                      </IconButton>
                    )}
                    {starting !== service.name ? (
                      <Tooltip title={t("Start")} placement="top">
                        <IconButton
                          onClick={this.handleServiceAction(service, "start")}
                          className={classes.chipIcon}
                        >
                          <Start className={classes.iconButton} fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <IconButton className={classes.chipIcon}>
                        <CircularProgress size={18} />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <Feedback
          snackbar={snackbar}
          onClose={() => this.setState({ snackbar: "" })}
        />
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

const mapStateToProps = (state) => {
  return {
    Services: state.services.Services,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    serviceAction: async (service, action) =>
      await dispatch(serviceAction(service, action)).catch((error) =>
        Promise.reject(error)
      ),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(withStyles(styles)(ServicesChart)));
