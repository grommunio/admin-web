// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect, useState } from "react";
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
  Tooltip,
} from "@mui/material";
import { connect } from "react-redux";
import ArrowUp from '@mui/icons-material/ArrowUpward';
import { fetchLogsData, fetchLogData } from "../actions/logs";
import { CopyAll, Refresh } from "@mui/icons-material";
import TableViewContainer from "../components/TableViewContainer";
import { copyToClipboard } from "../utils";
import { withRouter } from "../hocs/withRouter";

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

const Logs = props => {
  const [state, setState] = useState({
    snackbar: null,
    log: [],
    skip: 0,
    filename: '',
    autorefresh: false,
    clipboardMessage: '',
    loading: true,
  });

  useEffect(() => {
    props.fetch({ sort: "name,asc" })
      .then(() => setState({ ...state, loading: false }))
      .catch(snackbar => setState({ ...state, snackbar, loading: false }))
    
    return () => {
      clearInterval(fetchInterval);
    }
  }, []);

  const handleLog = filename => async () => {
    const log = await props.fetchLog(filename)
      .catch(snackbar => setState({ ...state, snackbar }));
    if(log) setState({ ...state, log: log.data, filename, skip: 0 });
  }

  // Fetches additional log rows, append on top
  const handleScroll = async () => {
    const { skip, filename, log } = state;
    let newLog = await props.fetchLog(filename, { skip: (skip + 1) * 20 })
      .catch(snackbar => setState({ ...state, snackbar }));
    if(newLog && newLog.data) {
      newLog = newLog.data.concat(log);
      setState({ ...state, log: newLog, skip: skip + 1 });
    }
  }

  /*
    Handles autorefresh.
    Appends new logs at the bottom of the list
  */
  const handleRefresh = async () => {
    const { filename, log } = state;
    if(log.length === 0) handleLog(filename)();
    else {
      const lastDate = log[log.length - 1].time;
      let newLog = await props.fetchLog(filename, { after: lastDate })
        .catch(snackbar => setState({ ...state, snackbar }));
      if(newLog && newLog?.data.length > 0) {
        newLog = log.concat(newLog.data);
        setState({ ...state, log: newLog, filename, skip: 0 });
      }
    }
  }

  let fetchInterval = null;

  const handleAutoRefresh = ({ target: t }) => {
    const checked = t.checked;
    setState({ ...state, autorefresh: checked });
    if(checked) fetchInterval = setInterval(() => {
      handleRefresh();
    }, 5000);
    else clearInterval(fetchInterval);
  }

  const handleCopyToClipboard = msg => async () => {
    const success = await copyToClipboard(msg).catch(err => err);
    if(success) {
      setState({ ...state, clipboardMessage: 'copied log line contents into clipboard' });
    }
  }

  const handleSnackbarClose = () => setState({ ...state, clipboardMessage: '' });

  const { classes, t, logs } = props;
  const { snackbar, log, filename, autorefresh, clipboardMessage, loading } = state;

  return (
    <TableViewContainer
      headline={t("Logging")}
      subtitle={t("logs_sub")}
      href="https://docs.grommunio.com/admin/administration.html#logs"
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
      loading={loading}
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
              onClick={handleLog(log)}
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
            <IconButton onClick={handleRefresh} style={{ marginRight: 8 }} size="large">
              <Refresh />
            </IconButton>
            <FormControlLabel
              control={
                <Switch
                  checked={autorefresh}
                  onChange={handleAutoRefresh}
                  name="autorefresh"
                  color="primary"
                />
              }
              label={t("Autorefresh")}
            />
          </Grid>}
          {log.length > 0 ? <>
            <IconButton onClick={handleScroll} size="large">
              <ArrowUp />
            </IconButton>
            <Tooltip placement="top" title={t('Copy all')}>
              <IconButton onClick={handleCopyToClipboard(log.map(l => l.message).join('\n'))} size="large">
                <CopyAll />
              </IconButton>
            </Tooltip>
          </>: filename && <Typography>&lt;no logs&gt;</Typography>}
          {log.map((log, idx) =>
            <pre
              key={idx}
              className={log.level < 4 ? classes.errorLog : log.level < 6 ? classes.noticeLog : classes.log}
              onClick={handleCopyToClipboard(log.message)}
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
          onClose={handleSnackbarClose}
          autoHideDuration={2000}
          transitionDuration={{ in: 0, appear: 250, enter: 250, exit: 0 }}
        >
          <Alert
            onClose={handleSnackbarClose}
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

Logs.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
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

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(withStyles(styles)(Logs))));
