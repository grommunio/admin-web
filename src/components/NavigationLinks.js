// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useState } from 'react';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import Search from '@mui/icons-material/Search';
import Dashboard from '@mui/icons-material/Dashboard';
import Person from '@mui/icons-material/Person';
import Domains from '@mui/icons-material/Domain';
import Topic from '@mui/icons-material/Topic';
import Ldap from '@mui/icons-material/Contacts';
import Groups from '@mui/icons-material/Groups';
import Storage from '@mui/icons-material/Storage';
import Orgs from '@mui/icons-material/GroupWork';
import Logs from '@mui/icons-material/ViewHeadline';
import Sync from '@mui/icons-material/Sync';
import Roles from '@mui/icons-material/VerifiedUser';
import grey from '../colors/grey';
import logo from '../res/grommunio_logo_light.svg';
import { Grid, Tabs, Tab, TextField, InputAdornment, Typography, Button, ListItemButton, ListItemIcon } from '@mui/material';
import { selectDrawerDomain } from '../actions/drawer';
import { Add, BackupTable, ContactMail, Dns, QueryBuilder, ReportGmailerrorred, TableChart, TaskAlt } from '@mui/icons-material';
import { SYSTEM_ADMIN_READ } from '../constants';
import Feedback from './Feedback';
import AddDomain from './Dialogs/AddDomain';
import { useNavigate } from 'react-router';

const styles = theme => ({
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 2, 0, 2),
    ...theme.mixins.toolbar,
    justifyContent: 'center',
    height: 64,
  },
  dashboard: {
    '&:hover': {
      backgroundColor: `${grey['900']}`, 
    },
    flex: 1,
  },
  nestedIcon: {
    float: 'left',
    paddingLeft: 16,
    paddingRight: 6,
    color: 'white',
  },
  drawerItemLabel: {
    fontWeight: 700,
  },
  nestedLabel: {
    fontWeight: 700,
  },
  tabs: {
    width: 260,
    minWidth: 260,
    marginLeft: 8,
    color: '#333',
  },
  tab: {
    width: 122,
    minWidth: 122,
    color: '#ccc',
  },
  logo: {
    cursor: 'pointer',
  },
  input: {
    color: 'white',
  },
  textfield: {
    margin: theme.spacing(1, 1, 1, 1),
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'grey',
      },
      '&:hover fieldset': {
        borderColor: 'white',
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
  },
  subheader: {
    margin: theme.spacing(2, 0, 1, 1),
    fontWeight: 600,
  },
  addButton: {
    margin: '0 8px',
    padding: '8px 16px',
  },
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
  },
  selected: {
    background: `${theme.palette.primary.main} !important`,
  },
  icon: {
    color: '#fff',
  }
});

const NavigationLinks = props => {
  const [state, setState] = useState({
    tab: 0,
    filter: '',
    adding: false,
    snackbar: '',
  });
  const navigate = useNavigate();

  const handleNavigation = path => event => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  const handleDrawer = domain => event => {
    event.preventDefault();
    props.selectDomain(domain);
    navigate(`/${domain}`);
  }

  const handleTextInput = event => {
    setState({ ...state, filter: event.target.value });
  }

  const handleAdd = () => setState({ ...state, adding: true });

  const handleAddingClose = () => setState({ ...state, adding: false });

  const handleAddingSuccess = () => setState({ ...state, adding: false, snackbar: 'Success!' });

  const handleAddingError = (error) => setState({ ...state, snackbar: error });

  const toggleTab = () => {
    const { tab, setTab } = props;
    setTab(tab === 0 ? 1 : 0);
  }

  // eslint-disable-next-line react/prop-types
  const ListElement = ({ label, path, Icon }) => {
    const { classes, t } = props;
    const selected = location.pathname.endsWith('/' + path);
    return <ListItemButton
      onClick={handleNavigation(path)}
      classes={{ selected: classes.selected }}
      selected={selected}
    >
      <ListItemIcon>
        <Icon className={classes.icon}/>
      </ListItemIcon>
      <ListItemText
        primary={t(label)}
        primaryTypographyProps={{ className: selected ? classes.drawerItemLabel : null }}
      />
    </ListItemButton>;
  }

  // eslint-disable-next-line react/prop-types
  const NestedListElement = ({ ID, label, path, Icon }) => {
    const { classes, t, expandedDomain } = props;
    const selected = expandedDomain === ID &&
      location.pathname.startsWith('/' + ID + path);
    return <ListItemButton
      onClick={handleNavigation(ID + path)}
      selected={selected}
      classes={{ selected: classes.selected }}
    >
      <ListItemIcon>
        <Icon className={classes.nestedIcon}/>
      </ListItemIcon>
      <ListItemText
        primary={t(label)}
        primaryTypographyProps={{ className: selected ? classes.nestedLabel : null }}
      />
    </ListItemButton>
  }

  const { classes, t, tab, expandedDomain, domains, capabilities, config } = props;
  const { filter, adding, snackbar } = state;
  const isSysAdmin = capabilities.includes(SYSTEM_ADMIN_READ);
  const pathname = location.pathname;
  return(
    <React.Fragment>
      <div className={classes.drawerHeader}>
        <img
          src={config.customImages[window.location.hostname]?.logoLight || logo}
          height="32"
          alt="grommunio"
          onClick={handleNavigation('')}
          className={classes.logo}
        />
      </div>
      {isSysAdmin && <Tabs
        onChange={toggleTab}
        value={tab}
        className={classes.tabs}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab className={classes.tab} label={t('Admin')} />
        <Tab className={classes.tab} label={t('Domains')} />
      </Tabs>}
      {(tab === 1 || !isSysAdmin) &&
            <Grid container component="form" autoComplete="off">
              <TextField
                variant="outlined"
                label={t('Search')}
                value={filter}
                onChange={handleTextInput}
                InputLabelProps={{
                  classes: {
                    root: classes.input,
                  },
                  shrink: true,
                }}
                InputProps={{
                  classes: { root: classes.input },
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="secondary" />
                    </InputAdornment>
                  ),
                }}
                color="primary"
                className={classes.textfield}
              />
            </Grid>}
      <List>
        {tab === 1 && isSysAdmin && <div className={classes.flexCenter}>
          <Button
            color="primary"
            onClick={handleAdd}
            className={classes.addButton}
          >
            {t("New domain")}
            <Add />
          </Button>
        </div>
        }
        {(tab === 1 || !isSysAdmin) &&
            domains
              .filter(({ domainname }) => domainname.includes(filter))
              .map(({ domainname: name, ID, domainStatus }) => {
                const selected = expandedDomain === ID && pathname === '/' + ID;
                return <React.Fragment key={name}>
                  <ListItemButton
                    onClick={handleDrawer(ID)}
                    selected={selected}
                    classes={{ selected: classes.selected }}
                  >
                    <ListItemIcon>
                      <Domains className={classes.icon}/>
                    </ListItemIcon>
                    <ListItemText
                      primary={name + (domainStatus === 3 ? ` [${t('Deactivated')}]` : '')}
                      primaryTypographyProps={{ className: selected ? classes.drawerItemLabel : null }}
                    />
                  </ListItemButton>
                  <Collapse in={expandedDomain === ID} unmountOnExit>
                    <List component="div" disablePadding>
                      <NestedListElement
                        ID={ID}
                        label={"Users"}
                        path="/users"
                        Icon={Person}
                      />
                      <NestedListElement
                        ID={ID}
                        label={"Contacts"}
                        path="/contacts"
                        Icon={ContactMail}
                      />
                      <NestedListElement
                        ID={ID}
                        label={"Groups"}
                        path="/groups"
                        Icon={Groups}
                      />
                      <NestedListElement
                        ID={ID}
                        label={"Public folders"}
                        path="/folders"
                        Icon={Topic}
                      />
                    </List>
                  </Collapse>
                </React.Fragment>
              })}
        {(tab === 0 && !isSysAdmin) && <ListElement
          label={"Task queue"}
          path="taskq"
          Icon={TaskAlt}
        />}
        {tab === 0 && isSysAdmin && <React.Fragment>
          <Typography variant="inherit" className={classes.subheader}>{t('Overview')}</Typography>
          <ListElement
            label={"Dashboard"}
            path=""
            Icon={Dashboard}
          />
          {config?.["loadAntispamData"] !== false && <ListElement
            label={"Spam History"}
            path="spam"
            Icon={ReportGmailerrorred}
          />}
          <Typography variant="inherit" className={classes.subheader}>{t('Management')}</Typography>
          <ListElement
            label={"Organizations"}
            path="orgs"
            Icon={Orgs}
          />
          <ListElement
            label={"Domains"}
            path="domains"
            Icon={Domains}
          />
          <ListElement
            label={"Users"}
            path="users"
            Icon={Person}
          />
          <ListElement
            label={"Contacts"}
            path="contacts"
            Icon={ContactMail}
          />
          <ListElement
            label={"Roles"}
            path="roles"
            Icon={Roles}
          />
          <ListElement
            label={"Defaults"}
            path="defaults"
            Icon={BackupTable}
          />
          <Typography variant="inherit" className={classes.subheader}>{t('Configuration')}</Typography>
          <ListElement
            label={"LDAP Directory"}
            path="directory"
            Icon={Ldap}
          />
          <ListElement
            label={"Configuration DB"}
            path="dbconf"
            Icon={Storage}
          />
          <ListElement
            label={"Servers"}
            path="servers"
            Icon={Dns}
          />
          <ListElement
            label={"Monitoring"}
            path="logs"
            Icon={Logs}
          />
          <ListElement
            label={"Mail queue"}
            path="mailq"
            Icon={QueryBuilder}
          />
          <ListElement
            label={"Task queue"}
            path="taskq"
            Icon={TaskAlt}
          />
          <ListElement
            label={"Mobile devices"}
            path="sync"
            Icon={Sync}
          />
          <ListElement
            label={"Live status"}
            path="status"
            Icon={TableChart}
          />
        </React.Fragment>
        }
      </List>
      <AddDomain
        open={adding}
        onSuccess={handleAddingSuccess}
        onError={handleAddingError}
        onClose={handleAddingClose}
      />
      <Feedback
        snackbar={snackbar}
        onClose={() => setState({ ...state, snackbar: "" })}
      />
    </React.Fragment>
  );
}

NavigationLinks.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domains: PropTypes.array,
  capabilities: PropTypes.array.isRequired,
  expandedDomain: PropTypes.number,
  selectDomain: PropTypes.func.isRequired,
  tab: PropTypes.number.isRequired,
  setTab: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  const { auth, drawer, config } = state;
  return {
    capabilities: auth.capabilities,
    expandedDomain: drawer.selectedDomain,
    config,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    selectDomain: id => dispatch(selectDrawerDomain(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(NavigationLinks)));
