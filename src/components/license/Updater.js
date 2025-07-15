import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { Button, CircularProgress, IconButton, MenuItem, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { Check, CheckCircleOutline, CopyAll, Update, Upgrade } from '@mui/icons-material';
import { systemUpdate } from '../../actions/misc';
import { fetchUpdateLogData } from '../../actions/logs';
import { copyToClipboard, generateFormattedLogLine } from '../../utils';
import { connect, useSelector } from 'react-redux';
import { withTranslation } from 'react-i18next';
import moment from 'moment';

const styles = theme => ({
  data: {
    padding: '8px 0',
  },
  updates: {
    margin: theme.spacing(2, 2, 3, 2),
  },
  logs: {
    margin: theme.spacing(2, 0),
    padding: 2,
  },
  log: {
    fontSize: 16,
  },
  updateButton: {
    marginRight: 8,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    width: 200,
    marginRight: 8,
  },
});


const Loader = () => <CircularProgress color='inherit' size={20}/>;

const Updater = props => {
  const license = useSelector(state => state.license);
  const supportedReposAvailable = license ? moment().isBefore(license?.notAfter) : false;
  const [state, setState] = useState({
    checkLoading: false,
    updateLoading: false,
    upgradeLoading: false,
    copied: false,
  });
  const [updateLog, setUpdateLog] = useState([]);
  const [repo, setRepo] = useState(localStorage.getItem("packageRepository")
    || (supportedReposAvailable ? "supported" : "community"));

  useEffect(() => {
    const listener = window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      clearInterval(fetchInterval);
      window.removeEventListener("beforeunload", listener);
    }
  }, []);

  const onBeforeUnload = (e) => {
    const { checkLoading, updateLoading, upgradeLoading } = state;
    if (checkLoading || updateLoading || upgradeLoading) {
      e.preventDefault();
      e.returnValue = 'Updater is running! Are you sure you want to quit?';
      return;
    }
    delete e['returnValue'];
  }

  let fetchInterval = null;

  const handleRefresh = async pid => {
    const { setTabsDisabled, fetchLog } = props;
    const response = await fetchLog(pid).catch(snackbar => setState({ ...state, snackbar }));
    setUpdateLog(response?.data || []);
    if(response?.processRunning === false) {
      clearInterval(fetchInterval);
      setState({ ...state, checkLoading: false, updateLoading: false, upgradeLoading: false });
      setTabsDisabled(false);
    }
  }

  const handleUpdate = action => async () => {
    const { systemUpdate, setSnackbar, setTabsDisabled } = props;
    setUpdateLog([]);
    setState({ ...state, [action + "Loading"]: true, copied: false });
    setTabsDisabled(true);
    const response = await systemUpdate(action, repo)
      .catch(snackbar => {
        setSnackbar(snackbar);
        setState({ ...state, checkLoading: false, updateLoading: false, upgradeLoading: false });
      });
    if(response?.pid) fetchInterval = setInterval(() => {
      handleRefresh(response.pid);
    }, 1000);
  }

  const handleCopyLogs = msg => async () => {
    const success = await copyToClipboard(msg).catch(err => err);
    if(success) {
      setState({ ...state, copied: true });
    }
  }

  const handleRepoChange = e => {
    const { value } = e.target;
    localStorage.setItem("packageRepository", value);+
    setRepo(value);
  }

  const { classes, t } = props;
  const { checkLoading, updateLoading, upgradeLoading, copied } = state;
  const updating = checkLoading || updateLoading || upgradeLoading;

  return <div className={classes.updates}>
    <div style={{ marginBottom: 24 }}>
      <Typography variant="caption">
        {t("updater_sub")}
      </Typography>
    </div>
    <div className={classes.actions}>
      <TextField
        label={"Repository"}
        value={repo}
        onChange={handleRepoChange}
        select
        className={classes.select}
        size='small'
      >
        {supportedReposAvailable ?
          <MenuItem value="supported">Supported</MenuItem> : 
          <Tooltip placement='top' title={t("License required to fetch supported repositories")}>
            <span><MenuItem value="supported" disabled>Supported</MenuItem></span>
          </Tooltip>}
        <MenuItem value="community">Community</MenuItem>
      </TextField>
      <Button
        variant='contained'
        onClick={handleUpdate("check")}
        startIcon={checkLoading ? <Loader /> : <Check />}
        className={classes.updateButton}
        disabled={updating}
      >
        Check for updates
      </Button>
      <Button
        variant='contained'
        onClick={handleUpdate("update")}
        startIcon={updateLoading ? <Loader /> : <Update />}
        className={classes.updateButton}
        disabled={updating}
      >
        Update
      </Button>
      <Button
        variant='contained'
        onClick={handleUpdate("upgrade")}
        startIcon={upgradeLoading ? <Loader/> : <Upgrade />}
        disabled={updating}
      >
        Upgrade
      </Button>
    </div>
    <Paper elevation={0} className={classes.logs}>
      <Tooltip placement="top" title={t('Copy all')}>
        <IconButton onClick={handleCopyLogs(updateLog.join('\n'))} size="large">
          {copied ? <CheckCircleOutline /> : <CopyAll />}
        </IconButton>
      </Tooltip>
      {updateLog.length > 0 ? updateLog.map((log, idx) =>
        <pre
          key={idx}
          className={classes.log}
        >
          {generateFormattedLogLine(log)}
        </pre>
      ) : <Typography align='center'>--- no logs ---</Typography>}
    </Paper>
  </div>
}

Updater.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  systemUpdate: PropTypes.func.isRequired,
  fetchLog: PropTypes.func.isRequired,
  setSnackbar: PropTypes.func.isRequired,
  setTabsDisabled: PropTypes.func.isRequired,
}

const mapDispatchToProps = dispatch => {
  return {
    systemUpdate: async (action, repo) => await dispatch(systemUpdate(action, repo))
      .catch(err => Promise.reject(err)),
    fetchLog: async (pid) =>
      await dispatch(fetchUpdateLogData(pid))
        .catch(error => Promise.reject(error)),
  };
};


export default connect(null, mapDispatchToProps)(withTranslation()(
  withStyles(Updater, styles)));
