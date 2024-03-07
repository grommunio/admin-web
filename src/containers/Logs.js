// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect, useMemo, useState } from "react";
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
  TextField,
  InputAdornment,
} from "@mui/material";
import { connect } from "react-redux";
import { fetchLogsData, fetchLogData } from "../actions/logs";
import { ArrowUpward, Close, CopyAll, Refresh } from "@mui/icons-material";
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
    height: 0,
    minHeight: "99%", // Random 1px scroll, which i can't find, so 99% instead of 100%
    position: "relative",
    display: "flex",
    flexDirection: "column",
    marginTop: 0,
  },
  li: {
    cursor: 'pointer',
  },
  selected: {
    background: `${theme.palette.primary.main} !important`,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
  }
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
  const [scrollDivHeight, setScrollDivHeight] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    props.fetch({ sort: "name,asc" })
      .then(() => setState({ ...state, loading: false }))
      .catch(snackbar => setState({ ...state, snackbar, loading: false }));
  }, []);

  useEffect(() => {
    const list = document.getElementById("logsList");
    const newHeight = list.scrollHeight;
    // First fetch
    if(log.length <= 100) {
      // Scroll to bottom
      list.scrollTo({ top: newHeight });
    } else {
      // Keep scrolling position after appending list elements at the top
      list.scrollTo({ top: newHeight - scrollDivHeight });
    }
    // Update previous div height
    setScrollDivHeight(newHeight);
  }, [log]);

  const handleLog = filename => async () => {
    const freshLog = await props.fetchLog(filename)
      .catch(snackbar => setState({ ...state, snackbar }));
    if(freshLog) {
      setLog(freshLog.data);
      setFilename(filename);
      setState({ ...state, skip: 0 });
    }
  }

  const handleScroll = async () => {
    if (document.getElementById("logsList").scrollTop === 0) {
      const { skip } = state;
      let newLog = await props.fetchLog(filename, { skip: (skip + 1) * 100 })
        .catch(snackbar => setState({ ...state, snackbar }));
      if(newLog && newLog.data.length > 0) {
        newLog = newLog.data.concat(log);
        setState({ ...state, skip: skip + 1 });
        setLog(newLog);
      }
    }
  }

  const handleButtonScroll = async () => {
    const { skip } = state;
    let newLog = await props.fetchLog(filename, { skip: (skip + 1) * 100 })
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
      if(newLog && newLog.data?.length > 0) {
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

  const filteredlogs = useMemo(() => {
    return log.filter(l => l.message.toLowerCase().includes(search.toLowerCase()))
  }, [log, search])

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
          <div style={{ display: 'flex' }}>
            {log.length > 0 && <>
              <IconButton onClick={handleButtonScroll} size="large">
                <ArrowUpward />
              </IconButton>
              <Tooltip placement="top" title={t('Copy all')}>
                <IconButton onClick={handleCopyToClipboard(log.map(l => l.message).join('\n'))} size="large">
                  <CopyAll />
                </IconButton>
              </Tooltip>
              <TextField
                value={search}
                onChange={e => setSearch(e.target.value)}
                label={t("Search")}
                size="small"
                style={{ width: 400 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">
                    <IconButton onClick={() => setSearch("")}><Close /></IconButton>
                  </InputAdornment>,
                }}
              />
            </>}
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
          </div>
          {filename && filteredlogs.length ===  0 && <Typography>&lt;no logs&gt;</Typography>}
          <List className={classes.list} id="logsList" onScroll={handleScroll}>
            {filteredlogs.map((log, idx) =>
              <pre
                key={idx}
                className={log.level < 4 ? classes.errorLog : log.level < 6 ? classes.noticeLog : classes.log}
                onClick={handleCopyToClipboard(log.message)}
              >
                {'[' + log.time + ']: ' + log.message}
              </pre>
            )}
          </List>
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
      await dispatch(fetchLogData(filename, { n: 100, ...params }))
        .then(log => log)
        .catch(error => Promise.reject(error)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(withStyles(styles)(Logs)));
