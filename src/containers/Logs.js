// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
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
  Portal,
  Snackbar,
  Alert,
} from "@mui/material";
import { connect } from "react-redux";
import ArrowUp from '@mui/icons-material/ArrowUpward';
import { fetchLogsData, fetchLogData } from "../actions/logs";
import { Refresh } from "@mui/icons-material";
import TableViewContainer from "../components/TableViewContainer";
import { copyToClipboard } from "../utils";

const styles = (theme) => ({
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
    padding: theme.spacing(1, 1, 1, 1),
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
    clipboardMessage: '',
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

  handleCopyToClipboard = msg => async () => {
    const success = await copyToClipboard(msg).catch(err => err);
    if(success) {
      this.setState({ clipboardMessage: 'copied log line contents into clipboard' });
    }
  }

  handleSnackbarClose = () => this.setState({ clipboardMessage: '' });

  render() {
    const { classes, t, logs } = this.props;
    const { snackbar, log, filename, autorefresh, clipboardMessage } = this.state;

    return (
      <TableViewContainer
        headline={t("Logs")}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <div className={classes.logViewer}>
          <List style={{ width: 200 }}>
            <ListItem>
              <ListItemText
                primary={t("Log files")}
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
            {filename && <Grid container justifyContent="flex-end">
              <IconButton onClick={this.handleRefresh} style={{ marginRight: 8 }} size="large">
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
            {log.length > 0 ? <IconButton onClick={this.handleScroll} size="large">
              <ArrowUp />
            </IconButton> : filename && <Typography>&lt;no logs&gt;</Typography>}
            {log.map((log, idx) =>
              <pre
                key={idx}
                className={log.level < 4 ? classes.errorLog : log.level < 6 ? classes.noticeLog : classes.log}
                onClick={this.handleCopyToClipboard(log.message)}
              >
                {'[' + log.time + ']: ' + log.message}
              </pre>
            )}
          </Paper>
        </div>
        <Portal>
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            open={!!clipboardMessage}
            onClose={this.handleSnackbarClose}
            autoHideDuration={2000}
            transitionDuration={{ in: 0, appear: 250, enter: 250, exit: 0 }}
          >
            <Alert
              onClose={this.handleSnackbarClose}
              severity={"success"}
              elevation={6}
              variant="filled"
            >
              {clipboardMessage}
            </Alert>
          </Snackbar>
        </Portal>
      </TableViewContainer>
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
