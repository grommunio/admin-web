// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import {
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Switch,
} from "@material-ui/core";
import { connect } from "react-redux";
import TopBar from "../components/TopBar";
import HomeIcon from "@material-ui/icons/Home";
import ArrowUp from '@material-ui/icons/ArrowUpward';
import blue from "../colors/blue";
import Feedback from "../components/Feedback";
import { fetchLogsData, fetchLogData } from "../actions/logs";
import { Refresh } from "@material-ui/icons";

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
      backgroundColor: '#bbb',
    },
  },
  noticeLog: {
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#bbb',
    },
  },
  errorLog: {
    fontSize: 16,
    cursor: 'pointer',
    color: 'red',
    '&:hover': {
      backgroundColor: '#bbb',
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
    autorefresh: false,
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

  handleScroll = async () => {
    const { skip, filename, log } = this.state;
    let newLog = await this.props.fetchLog(filename, { skip: (skip + 1) * 20 })
      .catch(snackbar => this.setState({ snackbar }));
    if(newLog && newLog.data) {
      newLog = newLog.data.concat(log);
      this.setState({ log: newLog, skip: skip + 1 });
    }
  }

  handleDate = time => async () => {
    const { filename } = this.state;
    const log = await this.props.fetchLog(filename, { after: time })
      .catch(snackbar => this.setState({ snackbar }));
    if(log) this.setState({ log: log.data, skip: 0 });
  }

  handleRefresh = async () => {
    const { filename, log } = this.state;
    if(log.length === 0) this.handleLog(filename)();
    else {
      const lastDate = log[log.length - 1].time;
      let newLog = await this.props.fetchLog(filename, { after: lastDate })
        .catch(snackbar => this.setState({ snackbar }));
      if(newLog && newLog?.data.length > 0) {
        newLog = log.concat(newLog.data);
        this.setState({ log: newLog, filename, skip: 0 });
      }
    }
  }

  fetchInterval = null;

  handleAutoRefresh = ({ target: t }) => {
    const checked = t.checked;
    this.setState({ autorefresh: checked });
    if(checked) this.fetchInterval = setInterval(() => {
      this.handleRefresh();
    }, 5000);
    else clearInterval(this.fetchInterval);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  render() {
    const { classes, t, logs } = this.props;
    const { snackbar, log, filename, autorefresh } = this.state;

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
                <ListItem
                  key={idx}
                  onClick={this.handleLog(log)}
                  button
                  className={classes.li}
                  selected={log === filename}
                >
                  <ListItemText
                    primary={log}
                    primaryTypographyProps={{ color: "textPrimary" }}
                  />
                </ListItem>
              )}
            </List>
            <Paper elevation={1} className={classes.paper}>
              {filename && <Grid container justify="flex-end">
                <IconButton onClick={this.handleRefresh} style={{ marginRight: 8 }}>
                  <Refresh />
                </IconButton>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autorefresh}
                      onChange={this.handleAutoRefresh}
                      name="autorefresh"
                      color="primary"
                    />
                  }
                  label="Autorefresh"
                />
              </Grid>}
              {log.length > 0 ? <IconButton onClick={this.handleScroll}>
                <ArrowUp />
              </IconButton> : filename && <Typography>&lt;no logs&gt;</Typography>}
              {log.map((log, idx) =>
                <pre
                  key={idx}
                  className={log.level < 4 ? classes.errorLog : log.level < 6 ? classes.noticeLog : classes.log}
                  onClick={this.handleDate(log.time)}
                >
                  {'[' + log.time + ']: ' + log.message}
                </pre>
              )}
            </Paper>
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
