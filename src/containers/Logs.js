// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import {
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@material-ui/core";
import { connect } from "react-redux";
import TopBar from "../components/TopBar";
import HomeIcon from "@material-ui/icons/Home";
import ArrowUp from '@material-ui/icons/ArrowUpward';
import ArrowDown from '@material-ui/icons/ArrowDownward';
import blue from "../colors/blue";
import Feedback from "../components/Feedback";
import { fetchLogsData, fetchLogData } from "../actions/logs";

const styles = (theme) => ({
  root: {
    flex: 1,
    overflow: "auto",
  },
  base: {
    flexDirection: "column",
    padding: theme.spacing(2),
    flex: 1,
    display: "flex",
  },
  grid: {
    padding: theme.spacing(0, 2),
  },
  toolbar: theme.mixins.toolbar,
  flexRowEnd: {
    display: "flex",
    justifyContent: "flex-end",
  },
  pageTitle: {
    margin: theme.spacing(2),
  },
  pageTitleSecondary: {
    color: "#aaa",
  },
  homeIcon: {
    color: blue[500],
    position: "relative",
    top: 4,
    left: 4,
    cursor: "pointer",
  },
  circularProgress: {
    margin: theme.spacing(1, 0),
  },
  textfield: {
    margin: theme.spacing(2, 0, 1, 0),
  },
  tools: {
    margin: theme.spacing(0, 2, 2, 2),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  actions: {
    display: 'flex',
    flex: 1,
    margin: theme.spacing(0, 4, 0, 0),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  buttonGrid: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  logViewer: {
    display: 'flex',
    flex: 1,
  },
  log: {
    fontSize: 16,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
  noticeLog: {
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
  errorLog: {
    fontSize: 16,
    cursor: 'pointer',
    color: 'red',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
  paper: {
    flex: 1,
    padding: theme.spacing(1),
  },
  li: {
    cursor: 'pointer',
  },
});

class Logs extends PureComponent {

  state = {
    snackbar: null,
    log: [],
    skip: 0,
    filename: '',
  };

  componentDidMount() {
    this.props.fetch({ sort: "name,asc" });
  }

  handleNavigation = (path) => (event) => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  };

  handleLog = filename => async () => {
    const log = await this.props.fetchLog(filename)
      .catch(snackbar => this.setState({ snackbar }));
    if(log) this.setState({ log: log.data, filename, skip: 0 });
  }

  handleScroll = addend => async () => {
    const { skip, filename } = this.state;
    const log = await this.props.fetchLog(filename, { skip: (skip + addend) * 20 })
      .catch(snackbar => this.setState({ snackbar }));
    if(log) this.setState({ log: log.data, skip: skip + addend });
  }

  handleDate = time => async () => {
    const { filename } = this.state;
    const log = await this.props.fetchLog(filename, { after: time })
      .catch(snackbar => this.setState({ snackbar }));
    if(log) this.setState({ log: log.data, skip: 0 });
  }

  render() {
    const { classes, t, logs } = this.props;
    const { snackbar, log, skip } = this.state;

    return (
      <div className={classes.root}>
        <TopBar />
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Logs")}
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon
              onClick={this.handleNavigation("")}
              className={classes.homeIcon}
            />
          </Typography>
          <div className={classes.logViewer}>
            <List style={{ width: 200 }}>
              <ListItem>
                <ListItemText
                  primary="Log files"
                  primaryTypographyProps={{ color: "primary", variant: 'h6' }}
                />
              </ListItem>
              {logs.Logs.map((log, idx) =>
                <ListItem key={idx} onClick={this.handleLog(log)} button className={classes.li}>
                  <ListItemText
                    primary={log}
                    primaryTypographyProps={{ color: "textPrimary" }}
                  />
                </ListItem>
              )}
            </List>
            {<Paper elevation={1} className={classes.paper}>
              {log.length > 0 && <IconButton onClick={this.handleScroll(1)}>
                <ArrowUp />
              </IconButton>}
              {log.map((log, idx) =>
                <pre
                  key={idx}
                  className={log.level < 4 ? classes.errorLog : log.level < 6 ? classes.noticeLog : classes.log}
                  onClick={this.handleDate(log.time)}
                >
                  {'[' + log.time + ']: ' + log.message}
                </pre>
              )}
              {skip > 0 && <IconButton onClick={this.handleScroll(-1)}>
                <ArrowDown />
              </IconButton>}
            </Paper>}
          </div>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: "" })}
          />
        </div>
      </div>
    );
  }
}

Logs.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  logs: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchLog: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return { logs: state.logs };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: async (params) => {
      await dispatch(fetchLogsData(params)).catch((error) =>
        Promise.reject(error)
      );
    },
    fetchLog: async (filename, params) =>
      await dispatch(fetchLogData(filename, { ...params, n: 20 }))
        .then(log => log)
        .catch(error => Promise.reject(error)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(withStyles(styles)(Logs)));
