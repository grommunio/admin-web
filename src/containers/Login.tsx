// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from 'tss-react';
import {
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Theme,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Translate } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import {
  authError,
  authLogin,
  authLoginWithSession,
  authLoginWithToken,
} from '../actions/auth';
import { oidcLoginUrl, status } from '../api';
import logo from '../res/grommunio_logo_default.svg';
import logoLight from '../res/grommunio_logo_light.svg';
import { getLangs } from '../utils';
import i18n from 'i18next';
import { changeSettings } from '../actions/settings';
import { useAppDispatch, useAppSelector } from '../store';
import { ChangeEvent } from '@/types/common';
import { useTranslation } from 'react-i18next';


// Default background pattern (chevrons, white at 7% opacity)
const overlay = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOTIwIDEwODAiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA3Ij48cGF0aCBkPSJNMCAyNjUuMTZzMi41Ny0yLjkzIDIxLjYxIDE1LjkzbDM2NC44NCAzNjEuNTcgMzY0Ljg0IDM2MS41N2MzMC43MSAzMC40MyAyOC4zOCA3NS43NCAyOC4zOCA3NS43NEgwVjI2NS4xNloiLz48cGF0aCBkPSJNMCAwdjYyNGwxMzQuMzkgMTMzLjA3YzE5LjAzIDE4Ljg2IDQzLjk4IDI4LjMgNjguOTMgMjguM3M0OS45LTkuNDMgNjguOTMtMjguM0w2MzcuMDkgMzk1LjVsMzY0Ljg0LTM2MS41OEMxMDI4LjI5IDExLjY2IDEwMjQgMCAxMDI0IDBIMFpNMTkyMCAxMDgwaC0zNzdsLTE0NS43MS0xNDYuMWMtMTguOTQtMTkuMTItMjguNDItNDQuMTctMjguNDItNjkuMjIgMC0yNS4wNSA5LjQ3LTUwLjExIDI4LjQyLTY5LjIyTDE5MjAgMjY4djgxMloiLz48L2c+PC9zdmc+)';

// Product mark (Material Icons "tune", Apache-2.0)
const mark = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z'/%3E%3C/svg%3E")`;

const appear = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
`;

const useStyles = makeStyles()((theme: Theme) => {
  const dark = theme.palette.mode === 'dark';
  // Brand variables come from the host stylesheet; the second value is the product default
  const brand = (name: string, light: string, darkValue: string = light) =>
    `var(--brand-${name}, ${dark ? darkValue : light})`;
  const primary = brand('primary', '#009FFD');
  const surface = brand('surface', '#ffffff', '#23262b');
  const text = brand('text', '#1d2939', '#e6e6e6');
  const muted = brand('muted', '#667085', '#98a2b3');
  const field = brand('field', '#eef0f3', '#2b2f36');
  const fieldHover = brand('field-hover', '#e6e9ee', '#323740');
  const error = brand('error', '#b42318', '#fda29b');
  const errorBg = brand('error-bg', '#fef3f2', '#3a2320');
  const errorBorder = brand('error-border', '#fecdca', '#5c2e2a');
  const radius = 'var(--brand-radius, 20px)';
  const radiusSm = 'var(--brand-radius-sm, 10px)';
  // color-mix() values are applied under @supports; the plain value before them is the product default
  const supportsMix = '@supports (color: color-mix(in srgb, red, blue))';
  const focusRingPlain = '0 0 0 3px rgba(0, 159, 253, 0.18)';
  const focusRing = `0 0 0 3px color-mix(in srgb, ${primary} 18%, transparent)`;
  const gradientStart = 'var(--brand-gradient-start, #009FFD)';
  const gradientEnd = 'var(--brand-gradient-end, #2a2a72)';
  const gradientAngle = 'var(--brand-gradient-angle, 150deg)';
  const gradientPlain = dark ?
    `linear-gradient(${gradientAngle}, #055e94, #1c1e48)` :
    `linear-gradient(${gradientAngle}, ${gradientStart}, ${gradientEnd})`;
  const gradient = dark ?
    `linear-gradient(${gradientAngle}, color-mix(in srgb, ${gradientStart} 55%, #0b0f14), color-mix(in srgb, ${gradientEnd} 55%, #0b0f14))` :
    gradientPlain;
  const layers = [
    `var(--brand-bg-overlay, ${overlay})`,
    'var(--brand-bg-image, none)',
    ...(dark ? [] : ['radial-gradient(120% 90% at 100% 100%, rgba(255, 255, 255, 0.14), transparent 55%)']),
  ];
  const sizes = ['cover', 'var(--brand-bg-size, cover)', ...layers.slice(2).map(() => 'auto'), 'auto'];
  const positions = ['center', 'var(--brand-bg-position, center)', ...layers.slice(2).map(() => 'center'), 'center'];
  const glyph = {
    maskImage: mark,
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
  };

  return {
    root: {
      position: 'fixed',
      inset: 0,
      zIndex: 10,
      display: 'flex',
      overflow: 'auto',
      boxSizing: 'border-box',
      padding: '16px 16px calc(16px + 12.5vh)',
      fontFamily: 'var(--brand-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif)',
      fontSize: 13,
      color: text,
      backgroundColor: dark ? '#0b0f14' : '#2a2a72',
      backgroundImage: [...layers, gradientPlain].join(', '),
      backgroundSize: sizes.join(', '),
      backgroundPosition: positions.join(', '),
      backgroundRepeat: 'no-repeat',
      ...(dark ? {
        [supportsMix]: {
          backgroundImage: [...layers, gradient].join(', '),
        },
      } : {}),
    },
    card: {
      position: 'relative',
      overflow: 'hidden',
      width: 400,
      maxWidth: '100%',
      margin: 'auto',
      boxSizing: 'border-box',
      padding: '40px 40px 36px',
      background: surface,
      color: text,
      borderRadius: radius,
      boxShadow: '0 24px 64px rgba(16, 24, 40, 0.28), 0 2px 8px rgba(16, 24, 40, 0.12)',
      animation: `${appear} 0.35s ease-out both`,
      '@media (prefers-reduced-motion: reduce)': {
        animation: 'none',
      },
      '@media (max-width: 480px)': {
        padding: '28px 20px 24px',
      },
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 61,
    },
    logo: {
      width: 'var(--brand-logo-width, 220px)',
      height: 'var(--brand-logo-height, 52px)',
      maxWidth: '100%',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      ...(dark ? { filter: 'var(--brand-logo-filter, none)' } : {}),
    },
    chip: {
      display: 'flex',
      width: 'fit-content',
      alignItems: 'center',
      gap: 6,
      margin: '12px auto 22px',
      padding: '4px 10px',
      borderRadius: 999,
      background: 'rgba(0, 159, 253, 0.12)',
      color: primary,
      fontSize: 12,
      lineHeight: 1,
      fontWeight: 600,
      letterSpacing: '0.02em',
      [supportsMix]: {
        background: `color-mix(in srgb, ${primary} 12%, transparent)`,
      },
    },
    chipIcon: {
      width: 14,
      height: 14,
      backgroundColor: 'currentColor',
      ...glyph,
    },
    badge: {
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
      height: 44,
      borderRadius: '50%',
      background: 'rgba(0, 159, 253, 0.12)',
      pointerEvents: 'none',
      [supportsMix]: {
        background: `color-mix(in srgb, ${primary} 12%, transparent)`,
      },
      '&::before': {
        content: '""',
        width: 22,
        height: 22,
        backgroundColor: primary,
        ...glyph,
      },
      '@media (max-width: 480px)': {
        top: 12,
        right: 12,
      },
    },
    input: {
      display: 'block',
      boxSizing: 'border-box',
      width: '100%',
      height: 44,
      margin: '0 0 12px',
      padding: '0 16px',
      fontFamily: 'inherit',
      fontSize: 15,
      lineHeight: 1.5,
      color: text,
      background: field,
      border: '1px solid transparent',
      borderRadius: radiusSm,
      transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
      '&::placeholder': {
        color: muted,
        opacity: 1,
      },
      '&:hover': {
        background: fieldHover,
      },
      '&:focus': {
        outline: 0,
        background: surface,
        borderColor: primary,
        boxShadow: focusRingPlain,
        [supportsMix]: {
          boxShadow: focusRing,
        },
      },
      // Inset shadow hides the browser's own autofill colours
      '&:-webkit-autofill, &:-webkit-autofill:hover': {
        WebkitBoxShadow: `0 0 0 1000px ${field} inset`,
        boxShadow: `0 0 0 1000px ${field} inset`,
        WebkitTextFillColor: text,
        caretColor: text,
      },
      '&:-webkit-autofill:focus': {
        WebkitBoxShadow: `0 0 0 1000px ${surface} inset, ${focusRingPlain}`,
        boxShadow: `0 0 0 1000px ${surface} inset, ${focusRingPlain}`,
        [supportsMix]: {
          WebkitBoxShadow: `0 0 0 1000px ${surface} inset, ${focusRing}`,
          boxShadow: `0 0 0 1000px ${surface} inset, ${focusRing}`,
        },
      },
      '&:autofill, &:autofill:hover': {
        boxShadow: `0 0 0 1000px ${field} inset`,
        WebkitTextFillColor: text,
        color: text,
        caretColor: text,
      },
      '&:autofill:focus': {
        boxShadow: `0 0 0 1000px ${surface} inset, ${focusRingPlain}`,
        [supportsMix]: {
          boxShadow: `0 0 0 1000px ${surface} inset, ${focusRing}`,
        },
      },
      '@media (max-width: 480px)': {
        fontSize: 16,
      },
    },
    error: {
      margin: '0 0 12px',
      padding: '10px 12px',
      borderRadius: radiusSm,
      border: `1px solid ${errorBorder}`,
      borderLeftWidth: 4,
      background: errorBg,
      color: error,
      fontSize: 13,
      lineHeight: 1.4,
      textAlign: 'left',
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      width: '100%',
      height: 44,
      margin: '12px 0 0',
      padding: '0 9px',
      border: '1px solid transparent',
      borderRadius: radiusSm,
      background: primary,
      color: 'var(--brand-on-primary, #ffffff)',
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 600,
      lineHeight: 1.5,
      cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.16)',
      transition: 'filter 0.15s ease, box-shadow 0.15s ease',
      '&:hover': {
        filter: 'brightness(0.92)',
      },
      '&:active': {
        filter: 'brightness(0.86)',
      },
      '&:focus-visible': {
        outline: 'none',
        boxShadow: `0 0 0 2px ${surface}, 0 0 0 4px ${primary}`,
      },
      '&:disabled': {
        opacity: 0.6,
        cursor: 'default',
        filter: 'none',
      },
    },
    ssoButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      width: '100%',
      height: 44,
      margin: '12px 0 0',
      padding: '0 9px',
      border: `1px solid ${primary}`,
      borderRadius: radiusSm,
      background: 'transparent',
      color: primary,
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 600,
      lineHeight: 1.5,
      cursor: 'pointer',
      transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
      '&:hover': {
        background: 'rgba(0, 159, 253, 0.08)',
        [supportsMix]: {
          background: `color-mix(in srgb, ${primary} 8%, transparent)`,
        },
      },
      '&:active': {
        background: 'rgba(0, 159, 253, 0.14)',
        [supportsMix]: {
          background: `color-mix(in srgb, ${primary} 14%, transparent)`,
        },
      },
      '&:focus-visible': {
        outline: 'none',
        boxShadow: `0 0 0 2px ${surface}, 0 0 0 4px ${primary}`,
      },
    },
    lang: {
      position: 'absolute',
      top: 16,
      left: 16,
      padding: 12,
      color: muted,
      '& svg': {
        fontSize: 20,
      },
      '@media (max-width: 480px)': {
        top: 12,
        left: 12,
      },
    },
  };
});

interface LoginState {
  user: string;
  pass: string;
  loading: boolean;
  sso: boolean;
  langsAnchorEl: Element | null;
}

const Login = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { auth, settings, config: serverConfig } = useAppSelector(state => state);
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<LoginState>({
    user: '',
    pass: '',
    loading: false,
    sso: false,
    langsAnchorEl: null,
  });

  const login = async (user: string, pass: string) => await dispatch(authLogin(user, pass));
  const loginWithToken = async (grommunioAuthJwt: string) => await dispatch(authLoginWithToken(grommunioAuthJwt));
  const loginWithSession = async () => await dispatch(authLoginWithSession());
  const setSettings = async (field: string, value: string) => await dispatch(changeSettings(field, value));
  
  useEffect(() => {
    const sso = searchParams.get('sso');
    const ssoError = searchParams.get('sso_error');
    if(sso || ssoError) {
      // Returning from single sign-on, drop the parameters so a reload does not repeat it
      setSearchParams({}, { replace: true });
    }
    if(ssoError) {
      console.error("Single sign-on failed: " + ssoError);
      dispatch(authError(t("Single sign-on failed")));
    } else if(sso) {
      // The API has set the session cookie, exchange it for a token
      loginWithSession()
        .catch((err: string) => {
          console.error(err);
          dispatch(authError(t("Single sign-on failed")));
        });
    } else {
      // Check if JWT is already in local storage
      const grommunioAuthJwt = window.localStorage.getItem("grommunioAuthJwt");
      if(grommunioAuthJwt) {
        // token found, try to login
        loginWithToken(grommunioAuthJwt)
          .catch((err: string) => {
            setState({ ...state, loading: false });
            console.error(err);
          });
      }
    }
    // Offer single sign-on if the API has a provider configured; the login cookies need TLS
    status()
      .then(res => setState(s => ({ ...s, sso: !!res?.oidc && window.location.protocol === 'https:' })))
      .catch(() => null);
  }, []);

  const handleTextinput = (field: 'user' | 'pass') => (e: ChangeEvent) => {
    setState({
      ...state,
      [field]: e.target.value,
    });
  }

  const handleLogin = (event: React.MouseEvent | React.SyntheticEvent<HTMLFormElement>) => {
    const { user, pass } = state;
    event.preventDefault();
    setState({ ...state, loading: true });
    login(user, pass)
      .catch((err: string) => {
        setState({ ...state, loading: false });
        console.error(err);
      });
  }

  const handleSso = () => {
    window.location.href = oidcLoginUrl();
  }

  const handleMenu = (open: boolean) => (e: React.MouseEvent) => setState({
    ...state,
    langsAnchorEl: open ? e.currentTarget : null,
  });

  const handleLangChange = (lang: string) => () => {
    // Set language in i18n, redux store and local storage
    i18n.changeLanguage(lang);
    setSettings('language', lang);
    window.localStorage.setItem('lang', lang);
    setState({
      ...state,
      langsAnchorEl: null,
    });
  }

  const { user, pass, loading, sso, langsAnchorEl } = state;
  const config = serverConfig.customImages[window.location.hostname] || serverConfig.customImages["*"];
  const fallbackLogo = theme.palette.mode === 'dark' ?
    (config?.logoLight || logoLight) :
    (config?.logo || logo);

  return (
    <div className={classes.root}>
      <form className={classes.card} onSubmit={handleLogin}>
        <Tooltip title="Language">
          <IconButton size="small" className={classes.lang} onClick={handleMenu(true)}>
            <Translate color="inherit"/>
          </IconButton>
        </Tooltip>
        <Menu
          id="lang-menu"
          anchorEl={langsAnchorEl}
          keepMounted
          open={Boolean(langsAnchorEl)}
          onClose={handleMenu(false)}
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
        <span className={classes.badge} aria-hidden="true"/>
        <div className={classes.logoContainer}>
          <div
            role="img"
            aria-label="grommunio"
            className={classes.logo}
            style={{ backgroundImage: `var(--brand-logo, url("${fallbackLogo}"))` }}
          />
        </div>
        <div className={classes.chip}>
          <span className={classes.chipIcon} aria-hidden="true"/>
          Admin
        </div>
        <input
          className={classes.input}
          autoFocus
          aria-invalid={!!auth.error}
          placeholder={t("Username")}
          value={user}
          onChange={handleTextinput('user')}
          name="username"
          id="username"
          autoComplete="username"
        />
        <input
          className={classes.input}
          type="password"
          aria-invalid={!!auth.error}
          placeholder={t("Password")}
          value={pass}
          onChange={handleTextinput('pass')}
          name="password"
          id="password"
          autoComplete="current-password"
        />
        {auth.error && <div role="alert" className={classes.error}>
          {auth.error || t("Failed to login. Incorrect password or username")}
        </div>}
        <button
          className={classes.button}
          type="submit"
          onClick={handleLogin}
          disabled={!user || !pass}
        >
          {loading ? <CircularProgress size={20} color="inherit"/> : t('Login')}
        </button>
        {sso && <button
          className={classes.ssoButton}
          type="button"
          onClick={handleSso}
        >
          {t("Sign in with single sign-on")}
        </button>}
      </form>
    </div>
  );
}


export default Login;
