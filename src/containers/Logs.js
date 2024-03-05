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
  ListItemButton,
} from "@mui/material";
import { connect } from "react-redux";
import ArrowUp from '@mui/icons-material/ArrowUpward';
import { fetchLogsData, fetchLogData } from "../actions/logs";
import { CopyAll, Refresh } from "@mui/icons-material";
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
  selected: {
    background: `${theme.palette.primary.main} !important`,
  },
});

const Logs = props => {
  const [state, setState] = useState({
    snackbar: null,
    skip: 0,
    autorefresh: false,
    clipboardMessage: '',
    loading: true,
  });
  const [filename, setFilename] = useState("");
  const [log, setLog] = useState([]);

  useEffect(() => {
    props.fetch({ sort: "name,asc" })
      .then(() => setState({ ...state, loading: false }))
      .catch(snackbar => setState({ ...state, snackbar, loading: false }))
    
    
  }, []);

  const handleLog = filename => async () => {
    const freshLog = await props.fetchLog(filename)
      .catch(snackbar => setState({ ...state, snackbar }));
    if(freshLog) {
      setLog(freshLog.data);
      setFilename(filename);
      setState({ ...state, skip: 0 });
    }
  }

  // Fetches additional log rows, append on top
  const handleScroll = async () => {
    const { skip } = state;
    let newLog = await props.fetchLog(filename, { skip: (skip + 1) * 20 })
      .catch(snackbar => setState({ ...state, snackbar }));
    if(newLog && newLog.data) {
      newLog = newLog.data.concat(log);
      setState({ ...state, skip: skip + 1 });
      setLog(newLog);
    }
  }

  /*
    Handles autorefresh.
    Appends new logs at the bottom of the list
  */
  const handleRefresh = async () => {
    if(log.length === 0) handleLog(filename)();
    else {
      const lastDate = log[log.length - 1].time;
      let newLog = await props.fetchLog(filename, { after: lastDate })
        .catch(snackbar => setState({ ...state, snackbar }));
      if(newLog && newLog?.data.length > 0) {
        newLog = log.concat(newLog.data);
        setState({ ...state, skip: 0 });
        setLog(newLog);
      }
    }
  }

  const handleAutoRefresh = ({ target: t }) => {
    const checked = t.checked;
    setState({ ...state, autorefresh: checked });
  }

  useEffect(() => {
    const { autorefresh } = state;
    let fetchInterval;

    if(autorefresh) fetchInterval = setInterval(() => {
      handleRefresh();
    }, 5000);
    else clearInterval(fetchInterval);

    return () => {
      clearInterval(fetchInterval);
    }
  }, [state.autorefresh, filename]);

  const handleCopyToClipboard = msg => async () => {
    const success = await copyToClipboard(msg).catch(err => err);
    if(success) {
      setState({ ...state, clipboardMessage: 'copied log line contents into clipboard' });
    }
  }

  const handleSnackbarClose = () => setState({ ...state, clipboardMessage: '' });

  const { classes, t, logs } = props;
  const { snackbar, autorefresh, clipboardMessage, loading } = state;

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
            <ListItemButton
              key={idx}
              onClick={handleLog(log)}
              className={classes.li}
              selected={log === filename}
              classes={{ selected: classes.selected }}
            >
              <ListItemText
                primary={log}
                primaryTypographyProps={{ color: "textPrimary" }}
              />
            </ListItemButton>
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
