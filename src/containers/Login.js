// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect, useState } from 'react';
import { withStyles } from 'tss-react/mui';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import {
  Paper,
  Button,
  InputBase,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Key from '@mui/icons-material/VpnKey';
import {
  authLogin,
  authLoginWithToken,
} from '../actions/auth';
import logo from '../res/grommunio_logo_default.svg';
import { Translate } from '@mui/icons-material';
import { getLangs } from '../utils';
import i18n from 'i18next';
import { changeSettings } from '../actions/settings';

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
    background: 'rgba(250, 250, 250, 0.9)',
    borderRadius: 30,
    zIndex: 1,
    padding: theme.spacing(1, 0),
    position: 'relative',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: theme.spacing(1, 0),
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
    margin: theme.spacing(1, 2, 1, 2),
  },
  input: {
    margin: theme.spacing(1, 1, 1, 0),
  },
  inputAdornment: {
    margin: theme.spacing(1, 1, 1, 1),
  },
  errorMessage: {
    margin: theme.spacing(1, 2, 0, 2),
  },
  logo: {
    padding: 12,
    backgroundColor: 'black',
    borderRadius: 12,
  },
  loader: {
    color: 'white',
  },
  lang: {
    position: 'absolute',
    top: 8,
    right: 8,
    color: 'black',
  },
});


function Login(props) {

  const [state, setState] = useState({
    user: '',
    pass: '',
    loading: false,
    langsAnchorEl: null,
  });
  
  useEffect(() => {
    // Check if JWT is already in local storage
    const grommunioAuthJwt = window.localStorage.getItem("grommunioAuthJwt");
    if(grommunioAuthJwt) {
      // token found, try to login
      const { authLoginWithToken } = props;
      authLoginWithToken(grommunioAuthJwt).catch(err => console.error(err));
    }
  }, []);

  const handleTextinput = field => e => {
    setState({
      ...state,
      [field]: e.target.value,
    });
  }

  const handleLogin = event => {
    const { authLogin } = props;
    const { user, pass } = state;
    event.preventDefault();
    setState({ ...state, loading: true });
    authLogin(user, pass)
      .catch(err => {
        setState({ ...state, loading: false });
        console.error(err);
      });
  }

  const handleMenu = (menu, open) => e => setState({
    ...state,
    [menu]: open ? e.currentTarget : null,
  });

  const handleLangChange = lang => () => {
    const { changeSettings } = props;
    // Set language in i18n, redux store and local storage
    i18n.changeLanguage(lang);
    changeSettings('language', lang);
    window.localStorage.setItem('lang', lang);
    setState({
      ...state,
      langsAnchorEl: null,
    });
  }

  const { classes, t, auth, settings, serverConfig } = props;
  const { user, pass, loading, langsAnchorEl } = state;
  const config = serverConfig.customImages[window.location.hostname];

  return (
    <div className={classes.root}>
      <Paper elevation={3} className={classes.loginForm} component="form" onSubmit={handleLogin} >
        <Tooltip title="Language">
          <IconButton className={classes.lang} onClick={handleMenu('langsAnchorEl', true)}>
            <Translate color="inherit"/>
          </IconButton>
        </Tooltip>
        <Menu
          id="lang-menu"
          anchorEl={langsAnchorEl}
          keepMounted
          open={Boolean(langsAnchorEl)}
          onClose={handleMenu('langsAnchorEl', false)}
        >
          {getLangs().map(({key, value}) =>
            <MenuItem
              selected={settings.language === key}
              value={key}
              key={key}
              onClick={handleLangChange(key)}
            >
              {value}
            </MenuItem>  
          )}
        </Menu>
        <div className={classes.logoContainer}>
          <img
            src={config?.logo || logo}
            height={64}
            alt="grommunio"
          />
        </div>
        <Paper className={classes.inputContainer}>
          <AccountCircle className={classes.inputAdornment}/>
          <InputBase
            fullWidth
            autoFocus
            error={!!auth.error}
            className={classes.input}
            placeholder={t("Username")}
            value={user}
            onChange={handleTextinput('user')}
            name="username"
            id="username"
            autoComplete="username"
          />
        </Paper>
        <Paper className={classes.inputContainer}>
          <Key className={classes.inputAdornment}/>
          <InputBase
            fullWidth
            type="password"
            className={classes.input}
            error={!!auth.error}
            placeholder={t("Password")}
            value={pass}
            onChange={handleTextinput('pass')}
            name="password"
            id="password"
            autoComplete="currect-password"
          />
        </Paper>
        {auth.error && <Alert elevation={6} variant="filled" severity="error" className={classes.errorMessage}>
          {auth.error || t("Failed to login. Incorrect password or username")}
        </Alert>}
        <Paper className={classes.inputContainer}>
          <Button
            className={classes.button}
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleLogin}
            disabled={!user || !pass}
          >
            {loading ? <CircularProgress size={24}  color="inherit" className={classes.loader}/> :
              <Typography>{t('Login')}</Typography>}
          </Button>
        </Paper>
      </Paper>
    </div>
  );
}

Login.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  authLogin: PropTypes.func.isRequired,
  authLoginWithToken: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  changeSettings: PropTypes.func.isRequired,
  serverConfig: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  const { auth, settings, config } = state;
  return {
    auth,
    settings,
    serverConfig: config,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    authLogin: async (user, pass) => {
      await dispatch(authLogin(user, pass)).catch(msg => Promise.reject(msg));
    },
    authLoginWithToken: async grommunioAuthJwt => {
      await dispatch(authLoginWithToken(grommunioAuthJwt)).catch(msg => Promise.reject(msg));
    },
    changeSettings: async (field, value) => {
      await dispatch(changeSettings(field, value));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(Login, styles)));
