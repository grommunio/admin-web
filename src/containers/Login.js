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
import background from '../res/bootback.svg';
import {
  authLogin,
  authLoginWithToken,
} from '../actions/auth';
import MuiAlert from '@material-ui/lab/Alert';
import logo from '../res/grammm_logo.svg';
import { fetchDrawerDomains } from '../actions/drawer';

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
    maxWidth: 450,
    background: 'rgba(250, 250, 250, 0.9    )',
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
    display: 'flex',
    alignItems: 'Center',
    maxWidth: '100%',
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
  background: {
    backgroundImage: 'url(' + background + ')',
    backgroundSize: 'cover',
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 0,
  },
});


class Login extends Component {

  state = {
    user: '',
    pass: '',

  }
  
  componentDidMount() {
    let grammmAuthJwt = window.localStorage.getItem("grammmAuthJwt");
    if(grammmAuthJwt) {
      const { authLoginWithToken, fetchDomainData } = this.props;
      authLoginWithToken(grammmAuthJwt).catch(err => console.error(err));
      fetchDomainData().catch(err => console.error(err));
    }
  }

  handleTextinput = field => e => {
    this.setState({
      [field]: e.target.value,
    });
  }

  handleLogin = event => {
    const { authLogin, fetchDomainData } = this.props;
    const { user, pass } = this.state;
    event.preventDefault();
    authLogin(user, pass)
      .then(() => {
        fetchDomainData().catch(err => {
          console.error(err);
        });
      })
      .catch(err => {
        console.error(err);
      });
  }  

  render() {
    const { classes, t, auth } = this.props;
    const { user, pass } = this.state;

    return (
      <div className={classes.root}>
        <Paper elevation={3} className={classes.loginForm}>
          <div className={classes.logoContainer}>
            <img src={logo} width="300" alt="GRAMMM"/>
          </div>
          <Paper component="form" onSubmit={this.handleLogin} className={classes.inputContainer}>
            <AccountCircle className={classes.inputAdornment}/>
            <InputBase
              fullWidth
              autoFocus
              error={auth.error}
              className={classes.input}
              placeholder={t("Username")}
              value={user}
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
              value={pass}
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
              disabled={!user || !pass}
            >
              <Typography>{t('Login')}</Typography>
            </Button>
          </Paper>
        </Paper>
        <div className={classes.background}></div>
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
  fetchDomainData: PropTypes.func.isRequired,
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
      await dispatch(authLogin(user, pass)).catch(msg => Promise.reject(msg));
    },
    authLoginWithToken: async grammmAuthJwt => {
      await dispatch(authLoginWithToken(grammmAuthJwt)).catch(msg => Promise.reject(msg));
    },
    fetchDomainData: async () => {
      await dispatch(fetchDrawerDomains()).catch(msg => Promise.reject(msg));
    },
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(withStyles(styles)(Login))));