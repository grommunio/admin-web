// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { AppBar, Toolbar, Typography, Button, Hidden, IconButton, LinearProgress, Fade,
  Box, 
  Menu,
  MenuItem,
  Tooltip,
  Autocomplete,
  TextField,
  InputAdornment} from '@mui/material';
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
import Language from '@mui/icons-material/Language';
import { authLogout } from '../actions/auth';
import { config } from '../config';
import i18n from 'i18next';
import { changeSettings } from '../actions/settings';
import { fetchLicenseData } from '../actions/license';
import LicenseIcon from './LicenseIcon';
import { SYSTEM_ADMIN_READ, SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import { getLangs } from '../utils';
import { Search } from '@mui/icons-material';
import { globalSearchOptions } from '../constants';

const styles = theme => ({
  root: {
    [theme.breakpoints.up('lg')]: {
      marginLeft: 260,
    },
    backgroundImage: 'linear-gradient(150deg, rgb(0, 159, 253), rgb(42, 42, 114))',
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
  },
});

class TopBar extends PureComponent {

  state = {
    menuAnchorEl: null,
    langsAnchorEl: null,
    search: '',
  }

  links = [
    { key: 'mailWebAddress', title: 'E-Mail', icon: MailOutlineIcon },
    { key: 'chatWebAddress', title: 'Chat', icon: Chat },
    { key: 'videoWebAddress', title: 'Video', icon: Duo },
    { key: 'fileWebAddress', title: 'Files', icon: Files },
    { key: 'archiveWebAddress', title: 'Archive', icon: Archive },
  ]

  componentDidMount() {
    const { fetch } = this.props;
    if(this.context.includes(SYSTEM_ADMIN_WRITE)) fetch();
  }

  handleMenuToggle = () => {
    const { setDrawerExpansion } = this.props;
    setDrawerExpansion();
  }

  handleMenuOpen = menu => e => this.setState({
    [menu]: e.currentTarget,
  });

  handleMenuClose = menu => () => this.setState({
    [menu]: null,
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

  handleLangChange = lang => () => {
    const { changeSettings } = this.props;
    i18n.changeLanguage(lang);
    changeSettings('language', lang);
    window.localStorage.setItem('lang', lang);
    this.setState({
      langsAnchorEl: null,
    });
  }

  handleAutocomplete = (_, newVal) => {
    if(newVal?.route) this.props.history.push(newVal.route);
  }

  render() {
    const { classes, t, profile, title, onAdd, fetching, settings, license } = this.props;
    const { menuAnchorEl, langsAnchorEl } = this.state;
    const licenseVisible = this.context.includes(SYSTEM_ADMIN_WRITE);
    const sysAdmRead = this.context.includes(SYSTEM_ADMIN_READ);
  
    return (
      <AppBar color='inherit' position="fixed" className={classes.root}>
        <Toolbar className={classes.root}>
          <Hidden lgUp>
            <IconButton color="inherit" onClick={this.handleMenuToggle} size="large">
              <Burger />
            </IconButton>
          </Hidden>
          <Hidden smDown>
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
          </Hidden>
          {title && <Typography className={classes.title} variant="h6">{title}</Typography>}
          <div className={classes.flexEndContainer}>
            {sysAdmRead && <Autocomplete
              onChange={this.handleAutocomplete}
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
            <Box className={classes.profileButton} onClick={this.handleMenuOpen('menuAnchorEl')}>
              <Typography className={classes.username}>{profile.Profile.user.username}</Typography>
              <AccountCircleIcon className={classes.profileIcon}></AccountCircleIcon>
            </Box>
            {licenseVisible && <LicenseIcon
              activated={license.product && license.product !== "Community"}
              handleNavigation={this.handleNavigation}
            />}
            <IconButton className={classes.langButton} onClick={this.handleMenuOpen('langsAnchorEl')}>
              <Language color="inherit" className={classes.username}/>
            </IconButton>
            <Menu
              id="lang-menu"
              anchorEl={langsAnchorEl}
              keepMounted
              open={Boolean(langsAnchorEl)}
              onClose={this.handleMenuClose('langsAnchorEl')}
            >
              {getLangs().map(({key, value}) =>
                <MenuItem
                  selected={settings.language === key}
                  value={key}
                  key={key}
                  onClick={this.handleLangChange(key)}
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
              onClose={this.handleMenuClose('menuAnchorEl')}
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

TopBar.contextType = CapabilityContext;
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
  fetch: PropTypes.func.isRequired,
  license: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  const { domains, users, folders, dashboard, services, settings, license } = state;
  return {
    Domains: state.domains.Domains,
    profile: state.profile,
    settings,
    license: license.License,
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
    fetch: async () => await dispatch(fetchLicenseData())
      .catch(err => console.error(err)),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(TopBar))));
