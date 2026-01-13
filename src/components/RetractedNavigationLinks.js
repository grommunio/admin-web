// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { withStyles } from 'tss-react/mui';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import Dashboard from '@mui/icons-material/Dashboard';
import Domains from '@mui/icons-material/Domain';
import Ldap from '@mui/icons-material/Contacts';
import Groups from '@mui/icons-material/Groups';
import Storage from '@mui/icons-material/Storage';
import Orgs from '@mui/icons-material/GroupWork';
import Logs from '@mui/icons-material/ViewHeadline';
import Sync from '@mui/icons-material/Sync';
import Roles from '@mui/icons-material/VerifiedUser';
import grey from '../colors/grey';
import logo from '../res/grommunio_icon_light.svg';
import { IconButton, Tooltip, Avatar, ListItemButton, ListItemIcon } from '@mui/material';
import { selectDrawerDomain, setDrawerExpansion } from '../actions/drawer';
import { Add, AdminPanelSettings, BackupTable, ContactMail, Dns, Person, QueryBuilder, ReportGmailerrorred, TableChart,
  TaskAlt, Topic } from '@mui/icons-material';
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
  nested: {
    paddingLeft: 30,
  },
  li: {
    width: 'auto',
    margin: '6px 12px 6px',
    borderRadius: '3px',
    position: 'relative',
    display: 'flex',
    padding: '9px 14px',
    transition: 'all 200ms linear',
    '&:hover': {
      backgroundColor: 'transparent',
      textShadow: '0px 0px 1px white',
      color: 'white',
    },
  },
  icon: {
    float: 'left',
    textAlign: 'center',
    verticalAlign: 'middle',
    transition: 'all 200ms linear',
    color: '#e6e6e6',
    '&:hover': {
      backgroundColor: 'transparent',
      textShadow: '0px 0px 1px white',
      color: 'white',
    },
  },
  nestedIcon: {
    float: 'left',
    paddingLeft: 16,
    paddingRight: 6,
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
    margin: theme.spacing(2, 0, 0, 1),
    fontWeight: 600,
  },
  addButton: {
    margin: '0 8px',
  },
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
  },
  selected: {
    background: `${theme.palette.primary.main} !important`,
  },
});

const RetractedNavigationLinks = props => {
  const [state, setState] = useState({
    filter: '',
    defaultsIn: false,
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

  const handleAdd = () => setState({ ...state, adding: true });

  const handleAddingClose = () => setState({ ...state, adding: false });

  const handleAddingSuccess = () => setState({ ...state, adding: false, snackbar: 'Success!' });

  const handleAddingError = (error) => setState({ ...state, snackbar: error });

  const toggleTab = () => {
    const { tab, setTab } = props;
    setTab(tab === 0 ? 1 : 0);
  }

  // eslint-disable-next-line react/prop-types
  const ListElement = ({ label="", path, Icon, ...rest }) => {
    const { classes, t } = props;
    const selected = location.pathname.endsWith('/' + path);
    return <Tooltip title={t(label)} placement="right">
      <ListItemButton
        onClick={handleNavigation(path)}
        classes={{ root: classes.flexCenter, selected: classes.selected }}
        selected={selected}
        {...rest}
      >
        <ListItemIcon className={classes.flexCenter}>
          <Icon fontSize='large' className={classes.icon}/>
        </ListItemIcon>
      </ListItemButton>
    </Tooltip>;
  }

  // eslint-disable-next-line react/prop-types
  const NestedListElement = ({ ID, label="", path, Icon }) => {
    const { classes, t, expandedDomain } = props;
    const selected = expandedDomain === ID &&
      location.pathname.startsWith('/' + ID + path);
    return <Tooltip title={t(label)} placement="right">
      <ListItemButton
        onClick={handleNavigation(ID + path)}
        classes={{ root: classes.flexCenter, selected: classes.selected }}
        selected={selected}
      >
        <ListItemIcon className={classes.flexCenter}>
          <Icon fontSize='large' className={classes.icon}/>
        </ListItemIcon>
      </ListItemButton>
    </Tooltip>;
  }

  const { classes, t, expandedDomain, domains, capabilities, tab, config } = props;
  const { filter, adding, snackbar } = state;
  const isSysAdmin = capabilities.includes(SYSTEM_ADMIN_READ);
  const pathname = location.pathname;
  return(
    <React.Fragment>
      <div className={classes.drawerHeader}>
        <img
          src={config.customImages[window.location.hostname]?.icon || logo}
          height="32"
          alt="g"
          onClick={handleNavigation('')}
          className={classes.logo}
        />
      </div>
      {isSysAdmin && <div className={classes.flexCenter}>
        <Tooltip title={t('Toggle admin panel')} placement="right" arrow>
          <IconButton onClick={toggleTab}>
            <AdminPanelSettings color="inherit" fontSize='large' className={classes.icon}/>
          </IconButton>
        </Tooltip>
      </div>}
      <List className={classes.list}>
        {tab === 1 && isSysAdmin && <div className={classes.flexCenter}>
          <IconButton
            color="primary"
            onClick={handleAdd}
            className={classes.addButton}
          >
            <Add fontSize='large'/>
          </IconButton>
        </div>}
        {(tab === 1 || !isSysAdmin) &&
            domains.map(({ domainname: name, ID, domainStatus }) => {
              return name.includes(filter) ?
                <React.Fragment key={name}>
                  <Tooltip  placement="right" title={name + (domainStatus === 3 ? ` [${t('Deactivated')}]` : '')}>
                    <ListItemButton
                      onClick={handleDrawer(ID)}
                      classes={{ root: classes.flexCenter, selected: classes.selected }}
                      selected={expandedDomain === ID && pathname === '/' + ID}
                      style={{ flexGrow: 0 }}
                    >
                      <Avatar>
                        {name[0]}
                      </Avatar>
                    </ListItemButton>
                  </Tooltip>
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
                        label={"Folders"}
                        path="/folders"
                        Icon={Topic}
                      />
                    </List>
                  </Collapse>
                </React.Fragment> : null;
            })}
        {(tab === 0 && !isSysAdmin) && <ListElement
          label={"Task queue"}
          path="taskq"
          Icon={TaskAlt}
          style={{ flexGrow: 0 }}
        />}
        {tab === 0 && isSysAdmin && <React.Fragment>
          <ListElement
            label={"Dashboard"}
            path=""
            Icon={Dashboard}
          />
          <ListElement
            label={"Spam Handling"}
            path="spam"
            Icon={ReportGmailerrorred}
          />
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

RetractedNavigationLinks.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domains: PropTypes.array,
  capabilities: PropTypes.array.isRequired,
  expandedDomain: PropTypes.number,
  selectDomain: PropTypes.func.isRequired,
  toggleExpansion: PropTypes.func.isRequired,
  tab: PropTypes.number.isRequired,
  setTab: PropTypes.func.isRequired,
  config:  PropTypes.object.isRequired,
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
    toggleExpansion: () => dispatch(setDrawerExpansion())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(RetractedNavigationLinks, styles)));
