// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { withStyles } from 'tss-react/mui';
import { withTranslation } from "react-i18next";
import {
  FormControlLabel,
  Grid2,
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
  MenuItem,
} from "@mui/material";
import { connect } from "react-redux";
import { fetchLogsData, fetchLogData } from "../actions/logs";
import { ArrowUpward, Clear, Close, CopyAll, Refresh } from "@mui/icons-material";
import TableViewContainer from "../components/TableViewContainer";
import { copyToClipboard } from "../utils";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { ANSI_CODE_TO_JSS_CLASS } from "../constants";

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
    paddingTop: 0,
    flex: 1,
    overflowY: 'auto',
  }
});


const generateFormattedLogLine = message => {
  const parts = message.split("\u001b")
  
  // No formatting detected
  if(parts.length === 1) return message;

  const paragraphs = parts.map((part, idx) => {
    // First part is always empty or plain message
    if(idx === 0) return part;

    // Outside formatting scope
    if(idx % 0) {
      // Cut "[0m"
      return part.splice(3);
    }

    // Get formatting
    const ansiEndIndex = part.search("m");
    const formatting = part.slice(1, ansiEndIndex);
    const formattingClass = ANSI_CODE_TO_JSS_CLASS[formatting] || { color: "#888" }

    const plainMessage = part.slice(ansiEndIndex + 1);

    return <p
      key={idx}
      style={{ margin: 0, display: "inline", ...formattingClass }}
    >
      {plainMessage}
    </p>;
  });


  return paragraphs;
}

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
  const [n, setN] = useState(100);
  const [date, setDate] = useState(null);

  const nOptions = [100, 500, 1000, 5000];

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
    if (!date && document.getElementById("logsList").scrollTop === 0) {
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

    if(autorefresh && !date) fetchInterval = setInterval(() => {
      handleRefresh();
    }, 5000);
    else clearInterval(fetchInterval);

    return () => {
      clearInterval(fetchInterval);
    }
  }, [state.autorefresh, filename, date]);

  const handleCopyToClipboard = msg => async () => {
    const success = await copyToClipboard(msg).catch(err => err);
    if(success) {
      setState({ ...state, clipboardMessage: 'copied log line contents into clipboard' });
    }
  }

  const handleSnackbarClose = () => setState({ ...state, clipboardMessage: '' });

  const filteredlogs = useMemo(() => {
    return log.filter(l => l.message.toLowerCase().includes(search.toLowerCase()))
  }, [log, search]);

  const handleDateChange = async newVal => {
    setDate(newVal);
    setState({ ...state, skip: 0, autorefresh: false });
    const time = newVal.toISOString().replace("T", " ").replace("Z", "");
    const freshLog = await props.fetchLog(filename, { n, after: time })
      .catch(snackbar => setState({ ...state, snackbar }));
    if(freshLog) {
      setLog(freshLog.data);
    }
  }

  const handleNChange = async e => {
    const { value } = e.target;
    setN(value);
    if(date) {
      const time = date.toISOString().replace("T", " ").replace("Z", "");
      const freshLog = await props.fetchLog(filename, { n: value, after: time })
        .catch(snackbar => setState({ ...state, snackbar }));
      if(freshLog) {
        setLog(freshLog.data);
      }
    }
  }

  const handleClear = () => {
    setDate(null);
    handleLog(filename)();
  }

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
              slotProps={{
                primary: { color: "primary", variant: 'h6' }
              }}
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
                slotProps={{
                  primary: { color: "textPrimary" }
                }}
              />
            </ListItemButton>
          )}
        </List>
        <Paper elevation={1} className={classes.paper}>
          <div style={{ display: 'flex', paddingBottom: 8 }}>
            {log.length > 0 && <>
              {!date && <IconButton onClick={handleButtonScroll} size="large">
                <ArrowUpward />
              </IconButton>}
              <Tooltip placement="top" title={t('Copy all')}>
                <IconButton onClick={handleCopyToClipboard(log.map(l => l.message).join('\n'))} size="large">
                  <CopyAll />
                </IconButton>
              </Tooltip>
              <TextField
                value={search}
                onChange={e => setSearch(e.target.value)}
                label={t("Search")}
                style={{ marginRight: 8, minWidth: 200 }}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">
                      <IconButton onClick={() => setSearch("")}><Close /></IconButton>
                    </InputAdornment>,
                  }
                }}
              />
            </>}
            {filename && <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateTimePicker
                label="From-time"
                ampm={false}
                timezone="UTC"
                closeOnSelect={false}
                onAccept={handleDateChange}
                value={date}
                sx={{ minWidth: 250 }}
                renderInput={(params) => <TextField
                  {...params}
                  size="small"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Clear color="secondary" />
                        </InputAdornment>
                      ),
                    }
                  }}
                />}
              />
              <Tooltip title={t("Clear date")}>
                <IconButton onClick={handleClear}>
                  <Close />
                </IconButton>
              </Tooltip>
            </LocalizationProvider>}
            {filename && <TextField
              value={n}
              onChange={handleNChange}
              label={t("Count")}
              select
              style={{ width: 169, marginLeft: 8 }}
            >
              {nOptions.map(c => <MenuItem value={c} key={c}>{c}</MenuItem>)}
            </TextField>}
            {filename && <Grid2 container justifyContent="flex-end">
              <IconButton disabled={!!date} onClick={handleRefresh} style={{ marginRight: 8 }} size="large">
                <Refresh />
              </IconButton>
              <FormControlLabel
                control={
                  <Switch
                    checked={autorefresh && !date}
                    onChange={handleAutoRefresh}
                    name="autorefresh"
                    color="primary"
                    disabled={!!date}
                  />
                }
                label={t("Autorefresh")}
              />
            </Grid2>}
          </div>
          {filename && filteredlogs.length ===  0 && <Typography>&lt;no logs&gt;</Typography>}
          <List className={classes.list} id="logsList" onScroll={handleScroll}>
            {filteredlogs.map((log, idx) =>
              <pre
                key={idx}
                className={log.level < 4 ? classes.errorLog : log.level < 6 ? classes.noticeLog : classes.log}
                onClick={handleCopyToClipboard(log.message)}
              >
                <p style={{ margin: 0, display: "inline" }}>{'[' + log.time + ']: '}</p>
                {generateFormattedLogLine(log.message)}
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
)(withTranslation()(withStyles(Logs, styles)));
