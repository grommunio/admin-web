import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import {
  Paper,
  Button,
  InputBase,
  Typography,
} from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Key from '@material-ui/icons/VpnKey';
import {
  authLogin,
  authLoginWithToken,
} from '../actions/auth';
import MuiAlert from '@material-ui/lab/Alert';

const styles = theme => ({
  /* || General */
  root: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'auto',
    zIndex: 10,
  },

  /* || Login Form */
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    maxWidth: 400,
    padding: theme.spacing(2, 3),
    background: 'rgba(250, 250, 250, 0.6)',
    borderRadius: 30,
    zIndex: 1,
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  headline: {
    padding: theme.spacing(2),
  },
  button: {
    width: '100%',
    borderRadius: 10,
  },
  inputContainer: {
    marginTop: theme.spacing(3),
    display: 'flex',
    alignItems: 'Center',
    width: '100%',
    borderRadius: 10,
  },
  input: {
    margin: theme.spacing(1, 1, 1, 0),
  },
  inputAdornment: {
    margin: theme.spacing(1),
  },
  errorMessage: {
    marginTop: theme.spacing(3),
  },
  logo: {
    padding: 12,
    backgroundColor: 'black',
    borderRadius: 12,
  },
});

class Login extends Component {

  state = {
    user: '',
    pass: '',
  }
  
  componentDidMount() {
    let grammmAuthToken = window.localStorage.getItem("grammmAuthToken");
    if(grammmAuthToken) {
      const { authLoginWithToken } = this.props;
      authLoginWithToken();
    }
  }

  handleTextinput = field => e => {
    this.setState({
      [field]: e.target.value,
    });
  }

  handleLogin = event => {
    const { authLogin } = this.props;
    event.preventDefault();
    authLogin(this.state.user, this.state.pass);
  }

  render() {
    const { classes, t, auth } = this.props;

    return (
      <div className={classes.root}>
        <Paper elevation={3} className={classes.loginForm}>
          <div className={classes.logoContainer}>
            <Typography variant="h4">GRAMMM</Typography>
          </div>
          <Paper component="form" onSubmit={this.handleLogin} className={classes.inputContainer}>
            <AccountCircle className={classes.inputAdornment}/>
            <InputBase
              fullWidth
              error={auth.error}
              className={classes.input}
              placeholder={t("Username")}
              value={this.state.user}
              onChange={this.handleTextinput('user')}
            />
          </Paper>
          <Paper component="form" onSubmit={this.handleLogin} className={classes.inputContainer}>
            <Key className={classes.inputAdornment}/>
            <InputBase
              fullWidth
              type="password"
              className={classes.input}
              error={auth.error}
              placeholder={t("Password")}
              value={this.state.pass}
              onChange={this.handleTextinput('pass')}
            />
          </Paper>
          {auth.error && <MuiAlert elevation={6} variant="filled" severity="error" className={classes.errorMessage}>
            {t("Failed to login. Incorrect password or username")}
          </MuiAlert>}
          <Paper className={classes.inputContainer}>
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              onClick={this.handleLogin}
              disabled={!this.state.user || !this.state.pass}
            >
              {t('Login')}
            </Button>
          </Paper>
        </Paper>
      </div>
    );
  }
}

Login.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  authLogin: PropTypes.func.isRequired,
  authLoginWithToken: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { auth } = state;
  return {
    auth,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    authLogin: async (user, pass) => {
      await dispatch(authLogin(user, pass));
    },
    authLoginWithToken: async grammmAuthToken => {
      await dispatch(authLoginWithToken(grammmAuthToken));
    },
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(withStyles(styles)(Login))));