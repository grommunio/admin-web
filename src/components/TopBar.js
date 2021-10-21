// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { AppBar, Toolbar, Typography, Button, Hidden, IconButton, LinearProgress, Fade,
  Box, 
  Menu,
  MenuItem,
  Tooltip} from '@mui/material';
import Add from '@mui/icons-material/Add';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Burger from '@mui/icons-material/Menu';
import { setDrawerExpansion } from '../actions/drawer';
import { withTranslation } from 'react-i18next';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import Duo from '@mui/icons-material/Duo';
import Chat from '@mui/icons-material/Chat';
import Files from '@mui/icons-material/Description';
import Archive from '@mui/icons-material/Archive';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { authLogout } from '../actions/auth';
import { config } from '../config';
import german from '../res/flag_of_germany.svg';
import english from '../res/flag_of_uk.svg';
import i18n from 'i18next';
import { changeSettings } from '../actions/settings';

const mode = window.localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light';

const styles = theme => ({
  root: {
    [theme.breakpoints.up('lg')]: {
      marginLeft: 260,
    },
  },
  title: {
    flexGrow: 1,
    fontWeight: 500,
    marginLeft: 4,
  },
  burger: {
    marginRight: 16,
  },
  divider: {
    height: 40,
    width: 2,
    marginLeft: 16,
    backgroundColor: '#000',
    backgroundImage: `linear-gradient(rgba(250,250,250,1) 4%, rgba(120, 120, 120, 0.7), rgba(250,250,250,1) 96%)`,
  },
  iconButton: {
    color: mode === 'light' ? '#777' : '#fff',
    cursor: 'pointer',
  },
  add: {
    margin: theme.spacing(0, 0, 0, 1),
  },
  flexEndContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px 2px 8px',
    borderRadius: 25,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: mode === 'light' ? '#f3f3f3' : 'rgba(255, 255, 255, 0.1)',
    },
  },
  profileIcon: {
    fontSize: 40,
    color: mode === 'light' ? '#aaa' : '#444',
    marginLeft: 4,
  },
  flag: {
    cursor: 'pointer',
  },
});

class TopBar extends PureComponent {

  state = {
    anchorEl: null,
  }

  links = [
    { key: 'mailWebAddress', title: 'E-Mail', icon: MailOutlineIcon },
    { key: 'chatWebAddress', title: 'Chat', icon: Chat },
    { key: 'videoWebAddress', title: 'Video', icon: Duo },
    { key: 'fileWebAddress', title: 'Files', icon: Files },
    { key: 'archiveWebAddress', title: 'Archive', icon: Archive },
  ]

  handleMenuToggle = () => {
    const { setDrawerExpansion } = this.props;
    setDrawerExpansion();
  }

  handleMenuOpen = e => this.setState({
    anchorEl: e.currentTarget,
  });

  handleMenuClose = () => this.setState({
    anchorEl: null,
  });

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleLogout = () => {
    const { history, authLogout } = this.props;
    history.push('/');
    authLogout();
  }

  handleLangChange = () => {
    const { changeSettings, settings } = this.props;
    const lang = settings.lang === 'en-US' ? 'de-DE' : 'en-US';
    i18n.changeLanguage(lang);
    changeSettings('lang', lang);
    window.localStorage.setItem('lang', lang);
  }

  render() {
    const { classes, t, profile, title, onAdd, fetching, settings } = this.props;
    const { anchorEl } = this.state;
    return (
      <AppBar position="fixed" className={classes.root}>
        <Toolbar className={classes.root}>
          <Hidden lgUp>
            <IconButton color="inherit" onClick={this.handleMenuToggle} size="large">
              <Burger />
            </IconButton>
          </Hidden>
          {this.links.map((link, idx) =>
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
          {title && <Typography className={classes.title} variant="h6">{title}</Typography>}
          <div className={classes.flexEndContainer}>
            <Box className={classes.profileButton} onClick={this.handleMenuOpen}>
              <Typography className={classes.username}>{profile.Profile.user.username}</Typography>
              <AccountCircleIcon className={classes.profileIcon}></AccountCircleIcon>
            </Box>
            <img
              src={settings.lang === 'en-US' ? german : english}
              alt="flag"
              width={32}
              className={classes.flag}
              onClick={this.handleLangChange}
            />
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={this.handleMenuClose}
            >
              <MenuItem onClick={this.handleNavigation('settings')}>
                {t('Settings')}
              </MenuItem>
              <MenuItem onClick={this.handleNavigation('changePassword')}>
                {t('Change password')}
              </MenuItem>
              <MenuItem onClick={this.handleLogout}>
                {t('Logout')}
              </MenuItem>
            </Menu>
          </div>
          {onAdd && <div className={classes.divider}></div>}
          {onAdd && <Button onClick={onAdd} color="inherit" className={classes.add}>
            <Add />{t('Add')}
          </Button>}
        </Toolbar>
        <Fade
          in={fetching}
          style={{
            transitionDelay: '500ms',
          }}
        >
          <LinearProgress variant="indeterminate" color="primary"/>
        </Fade>
      </AppBar>
    );
  }
}

TopBar.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  title: PropTypes.string,
  setDrawerExpansion: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  Domains: PropTypes.array.isRequired,
  onAdd: PropTypes.func,
  fetching: PropTypes.bool,
  authLogout: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  changeSettings: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { domains, users, folders, dashboard, services, settings } = state;
  return {
    Domains: state.domains.Domains,
    profile: state.profile,
    settings,
    fetching: domains.loading || users.loading || folders.loading
      || dashboard.loading || services.loading ,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setDrawerExpansion: () => {
      dispatch(setDrawerExpansion());
    },
    authLogout: async () => {
      await dispatch(authLogout());
    },
    changeSettings: async (field, value) => {
      await dispatch(changeSettings(field, value));
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(TopBar))));
