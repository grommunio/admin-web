import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { Button, CircularProgress, IconButton, MenuItem, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { Check, CheckCircleOutline, CopyAll, Update, Upgrade } from '@mui/icons-material';
import { systemUpdate } from '../../actions/misc';
import { fetchUpdateLogData } from '../../actions/logs';
import { copyToClipboard } from '../../utils';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

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

class Updater extends PureComponent {

  constructor() {
    super();
    this.state = {
      checkLoading: false,
      updateLoading: false,
      upgradeLoading: false,
      copied: false,
      updateLog: [],
      repo: localStorage.getItem("packageRepository") || "supported"
    }
  }

  

  fetchInterval = null;

  handleRefresh = async pid => {
    const response = await this.props.fetchLog(pid).catch();
    this.setState({ updateLog: response.data });
    if(response?.processRunning === false) {
      clearInterval(this.fetchInterval);
      this.setState({ checkLoading: false, updateLoading: false, upgradeLoading: false });
    }
  }

  handleUpdate = action => async () => {
    const { systemUpdate, setSnackbar } = this.props;
    const { repo } = this.state;
    this.setState({ [action + "Loading"]: true, copied: false });
    const response = await systemUpdate(action, repo)
      .catch(snackbar => {
        setSnackbar(snackbar);
        this.setState({ checkLoading: false, updateLoading: false, upgradeLoading: false });
      });
    if(response.pid) this.fetchInterval = setInterval(() => {
      this.handleRefresh(response.pid);
    }, 1000);
  }

  handleCopyLogs = msg => async () => {
    const success = await copyToClipboard(msg).catch(err => err);
    if(success) {
      this.setState({ copied: true });
    }
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  handleRepoChange = e => {
    const { value } = e.target;
    localStorage.setItem("packageRepository", value);+
    this.setState({ repo: value });
  }

  render() {
    const { classes, t } = this.props;
    const { checkLoading, updateLoading, upgradeLoading, updateLog, copied, repo } = this.state;
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
          onChange={this.handleRepoChange}
          select
          className={classes.select}
          size='small'
        >
          <MenuItem value="supported">Supported</MenuItem>
          <MenuItem value="community">Community</MenuItem>
        </TextField>
        <Button
          variant='contained'
          onClick={this.handleUpdate("check")}
          startIcon={checkLoading ? <Loader /> : <Check />}
          className={classes.updateButton}
          disabled={updating}
        >
          Check for updates
        </Button>
        <Button
          variant='contained'
          onClick={this.handleUpdate("update")}
          startIcon={updateLoading ? <Loader /> : <Update />}
          className={classes.updateButton}
          disabled={updating}
        >
          Update
        </Button>
        <Button
          variant='contained'
          onClick={this.handleUpdate("upgrade")}
          startIcon={upgradeLoading ? <Loader/> : <Upgrade />}
          disabled={updating}
        >
          Upgrade
        </Button>
      </div>
      <Paper elevation={0} className={classes.logs}>
        <Tooltip placement="top" title={t('Copy all')}>
          <IconButton onClick={this.handleCopyLogs(updateLog.join('\n'))} size="large">
            {copied ? <CheckCircleOutline /> : <CopyAll />}
          </IconButton>
        </Tooltip>
        {updateLog.length > 0 ? updateLog.map((log, idx) =>
          <pre
            key={idx}
            className={classes.log}
          >
            {log}
          </pre>
        ) : <Typography align='center'>--- no logs ---</Typography>}
      </Paper>
    </div>
  }
}

Updater.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  systemUpdate: PropTypes.func.isRequired,
  fetchLog: PropTypes.func.isRequired,
  setSnackbar: PropTypes.func.isRequired,
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
  withStyles(styles)(Updater)));
