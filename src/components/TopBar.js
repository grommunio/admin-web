// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { AppBar, Toolbar, Typography, Hidden, IconButton,
  Box, 
  Menu,
  MenuItem,
  Tooltip,
  Autocomplete,
  TextField,
  InputAdornment} from '@mui/material';
import { connect } from 'react-redux';
import Burger from '@mui/icons-material/Menu';
import { setDrawerExpansion, setDrawerOpen } from '../actions/drawer';
import { withTranslation } from 'react-i18next';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import Duo from '@mui/icons-material/Duo';
import Chat from '@mui/icons-material/Chat';
import Files from '@mui/icons-material/Description';
import Archive from '@mui/icons-material/Archive';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { authLogout } from '../actions/auth';
import i18n from 'i18next';
import { changeSettings } from '../actions/settings';
import { SYSTEM_ADMIN_READ, SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import { getLangs } from '../utils';
import { FilterAlt as Filter, KeyboardArrowLeft, KeyboardArrowRight, Search, Settings, Translate } from '@mui/icons-material';
import { globalSearchOptions } from '../constants';
import { useNavigate } from 'react-router';


const styles = theme => ({
  appbar: {
    height: 64,
    border: "none",
    borderRadius: 0,
  },
  toolbarExpanded: {
    height: 64,
    [theme.breakpoints.up('lg')]: {
      marginLeft: 260,
    },
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    paddingLeft: 12,
  },
  toolbarCollapsed: {
    height: 64,
    paddingLeft: 12,
    [theme.breakpoints.up('lg')]: {
      marginLeft: 75,
    },
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  title: {
    flexGrow: 1,
    fontWeight: 500,
    marginLeft: 4,
  },
  burger: {
    color: 'white',
  },
  iconButton: {
    color: '#fff',
    cursor: 'pointer',
  },
  add: {
    margin: theme.spacing(0, 0, 0, 1),
  },
  flexEndContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px 2px 8px',
    borderRadius: 25,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  profileIcon: {
    fontSize: 40,
    color: '#aaa',
    marginLeft: 4,
  },
  flag: {
    cursor: 'pointer',
  },
  username: {
    color: 'white',
  },
  langButton: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  autoComplete: {
    maxWidth: 240,
    marginRight: 8,
  },
  search: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.6)',
      },
      '&:hover fieldset': {
        borderColor: 'white',
      },
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  menu: {
    margin: 10,
  }
});

const TopBar = props => {
  const context = useContext(CapabilityContext);
  const [state, setState] = useState({
    menuAnchorEl: null,
    langsAnchorEl: null,
    search: '',
  });
  const navigate = useNavigate();

  const links = [
    { key: 'mailWebAddress', title: 'E-Mail', icon: MailOutlineIcon },
    { key: 'chatWebAddress', title: 'Chat', icon: Chat },
    { key: 'videoWebAddress', title: 'Video', icon: Duo },
    { key: 'fileWebAddress', title: 'Files', icon: Files },
    { key: 'archiveWebAddress', title: 'Archive', icon: Archive },
    { key: 'rspamdWebAddress', title: 'Rspamd', icon: Filter },
  ]

  const handleMenuToggle = () => {
    const { setDrawerOpen } = props;
    setDrawerOpen();
  }

  const handleMenuOpen = menu => e => setState({
    ...state, 
    [menu]: e.currentTarget,
  });

  const handleMenuClose = menu => () => setState({
    ...state, 
    [menu]: null,
  });

  const handleNavigation = path => event => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  const handleLogout = () => {
    const { authLogout } = props;
    navigate('/');
    authLogout();
  }

  const handleLangChange = lang => () => {
    const { changeSettings } = props;
    i18n.changeLanguage(lang);
    changeSettings('language', lang);
    window.localStorage.setItem('lang', lang);
    setState({
      ...state, 
      langsAnchorEl: null,
    });
  }

  const handleAutocomplete = (_, newVal) => {
    if(newVal?.route) navigate(newVal.route);
  }

  const { classes, t, profile, settings, drawer, setDrawerExpansion, config } = props;
  const { menuAnchorEl, langsAnchorEl } = state;
  const licenseVisible = context.includes(SYSTEM_ADMIN_WRITE);
  const sysAdmRead = context.includes(SYSTEM_ADMIN_READ);
  
  return (
    <AppBar color='inherit' position="fixed" className={classes.appbar}>
      <Toolbar className={drawer.expanded ? classes.toolbarExpanded : classes.toolbarCollapsed}>
        <Hidden lgUp>
          <IconButton color="inherit" onClick={handleMenuToggle} size="large">
            <Burger className={classes.burger}/>
          </IconButton>
        </Hidden>
        <Hidden lgDown>
          <IconButton color="inherit" onClick={setDrawerExpansion} size="large">
            {drawer.expanded ?
              <KeyboardArrowLeft className={classes.burger} /> :
              <KeyboardArrowRight className={classes.burger} />}
          </IconButton>
        </Hidden>
        <Hidden mdDown>
          {links.map((link, idx) =>
            <Tooltip
              placement="bottom"
              title={t(link.title) + (!config[link.key] ? ` (${t("Not configured")})` : '')} key={idx}
            >
              <span>
                <IconButton
                  href={config[link.key]}
                  disabled={!config[link.key]}
                  target="_blank"
                  className={classes.iconButton}
                  size="large">
                  <link.icon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Hidden>
        <div className={classes.flexEndContainer}>
          {sysAdmRead && <Autocomplete
            onChange={handleAutocomplete}
            getOptionLabel={o => t(o.label) || ''}
            className={classes.autoComplete}
            options={globalSearchOptions}
            autoHighlight
            fullWidth
            filterOptions={(options, state) => {
              const input = state.inputValue.toLowerCase();
              return options.filter(o => o.tags.some(tag =>
                tag.includes(input) || t(tag).includes(input)))
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                className={classes.search}
                placeholder={t("Search")}
                variant="standard"
                InputProps={{
                  ...params.InputProps,
                  style: { color: 'white' },
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <Search htmlColor='white' />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />}
          {licenseVisible && <Tooltip title={t("grommunio settings")}>
            <IconButton className={classes.langButton} onClick={handleNavigation("license")}>
              <Settings color="inherit" className={classes.username}/>
            </IconButton>
          </Tooltip>}
          <Tooltip title={t("Language")}>
            <IconButton className={classes.langButton} onClick={handleMenuOpen('langsAnchorEl')}>
              <Translate color="inherit" className={classes.username}/>
            </IconButton>
          </Tooltip>
          <Box className={classes.profileButton} onClick={handleMenuOpen('menuAnchorEl')}>
            <Typography className={classes.username}>{profile.Profile.user.username}</Typography>
            <AccountCircleIcon className={classes.profileIcon}></AccountCircleIcon>
          </Box>
          <Menu
            id="lang-menu"
            anchorEl={langsAnchorEl}
            keepMounted
            open={Boolean(langsAnchorEl)}
            onClose={handleMenuClose('langsAnchorEl')}
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
          <Menu
            id="simple-menu"
            anchorEl={menuAnchorEl}
            keepMounted
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose('menuAnchorEl')}
            PaperProps={{
              className: classes.menu
            }}
          >
            <MenuItem onClick={handleNavigation('settings')}>
              {t('Settings')}
            </MenuItem>
            <MenuItem onClick={handleNavigation('changePassword')}>
              {t('Change password')}
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              {t('Logout')}
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
}

TopBar.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  title: PropTypes.string,
  setDrawerExpansion: PropTypes.func.isRequired,
  setDrawerOpen: PropTypes.func.isRequired,
  Domains: PropTypes.array.isRequired,
  drawer: PropTypes.object.isRequired,
  onAdd: PropTypes.func,
  loading: PropTypes.bool,
  authLogout: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  changeSettings: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  const { drawer, settings, config } = state;
  return {
    Domains: state.domains.Domains,
    profile: state.profile,
    settings,
    drawer,
    config,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setDrawerExpansion: () => {
      dispatch(setDrawerExpansion());
    },
    setDrawerOpen: () => {
      dispatch(setDrawerOpen());
    },
    authLogout: async () => {
      await dispatch(authLogout());
    },
    changeSettings: async (field, value) => {
      await dispatch(changeSettings(field, value));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(TopBar, styles)));
