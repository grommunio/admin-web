import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import {
  Paper,
  TextField,
  FormControl,
  Button,
  Snackbar,
} from '@material-ui/core';
import TopBar from '../components/TopBar';
import { changePw } from '../api';
import Alert from '@material-ui/lab/Alert';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    padding: theme.spacing(2, 2),
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    overflowY: 'scroll',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  input: {
    marginBottom: theme.spacing(2),
  },
  toolbar: theme.mixins.toolbar,
  gird: {
    display: 'flex',
  },
});

class BaseSetup extends Component {

  state = {
    oldPw: '',
    newPw: '',
    reType: '',
    snackbar: '',
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleSave = () => changePw(this.state.oldPw, this.state.newPw)
    .then(() => this.setState({ snackbar: 'Success!' }))
    .catch(msg => this.setState({ snackbar: msg.message || 'Unknown error' }));;

  render() {
    const { classes, t } = this.props;
    const { oldPw, newPw, reType, snackbar } = this.state;

    return (
      <div className={classes.root}>
        <TopBar/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={1}>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("Old password")} 
                fullWidth 
                value={oldPw || ''}
                onChange={this.handleInput('oldPw')}
                type="password"
                autoFocus
              />
            </FormControl>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("New password")} 
                fullWidth 
                value={newPw || ''}
                onChange={this.handleInput('newPw')}
                type="password"
              />
            </FormControl>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("Repeat new password")} 
                fullWidth 
                value={reType || ''}
                onChange={this.handleInput('reType')}
                type="password"
              />
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleSave}
              disabled={!newPw || !oldPw || !reType || newPw !== reType}
            >
              {t('Save')}
            </Button>
          </Paper>
          <Snackbar
            open={!!snackbar}
            onClose={() => this.setState({ snackbar: '' })}
            autoHideDuration={snackbar === 'Success!' ? 1000 : 6000}
            transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
          >
            <Alert
              onClose={() => this.setState({ snackbar: '' })}
              severity={snackbar === 'Success!' ? "success" : "error"}
              elevation={6}
              variant="filled"
            >
              {snackbar}
            </Alert>
          </Snackbar>
        </div>
      </div>
    );
  }
}

BaseSetup.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(BaseSetup));