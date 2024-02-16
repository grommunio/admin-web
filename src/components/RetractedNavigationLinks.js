// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
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
import { Add, AdminPanelSettings, BackupTable, ContactMail, Dns, Person, QueryBuilder, TableChart,
  TaskAlt, Topic } from '@mui/icons-material';
import { SYSTEM_ADMIN_READ } from '../constants';
import Feedback from './Feedback';
import AddDomain from './Dialogs/AddDomain';

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
  list: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
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

class RetractedNavigationLinks extends PureComponent {

  state = {
    filter: '',
    defaultsIn: false,
    adding: false,
    snackbar: '',
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleDrawer = domain => event => {
    event.preventDefault();
    this.props.selectDomain(domain);
    this.props.history.push(`/${domain}`);
  }

  handleTextInput = event => {
    this.setState({ filter: event.target.value });
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingClose = () => this.setState({ adding: false });

  handleAddingSuccess = () => this.setState({ adding: false, snackbar: 'Success!' });

  handleAddingError = (error) => this.setState({ snackbar: error });

  toggleTab = () => {
    const { tab, setTab } = this.props;
    setTab(tab === 0 ? 1 : 0);
  }

  ListElement = ({ label="", path, Icon, ...rest }) => {
    const { classes, t } = this.props;
    const selected = location.pathname.endsWith('/' + path);
    return <Tooltip title={t(label)} placement="right">
      <ListItemButton
        onClick={this.handleNavigation(path)}
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

  NestedListElement = ({ ID, label="", path, Icon }) => {
    const { classes, t, expandedDomain } = this.props;
    const selected = expandedDomain === ID &&
      location.pathname.startsWith('/' + ID + path);
    return <Tooltip title={t(label)} placement="right">
      <ListItemButton
        onClick={this.handleNavigation(ID + path)}
        classes={{ root: classes.flexCenter, selected: classes.selected }}
        selected={selected}
      >
        <ListItemIcon className={classes.flexCenter}>
          <Icon fontSize='large' className={classes.icon}/>
        </ListItemIcon>
      </ListItemButton>
    </Tooltip>;
  }

  render() {
    const { classes, t, expandedDomain, location, domains, capabilities, tab, config } = this.props;
    const { filter, adding, snackbar } = this.state;
    const isSysAdmin = capabilities.includes(SYSTEM_ADMIN_READ);
    const pathname = location.pathname;
    return(
      <React.Fragment>
        <div className={classes.drawerHeader}>
          <img
            src={config.customImages[window.location.hostname]?.icon || logo}
            height="32"
            alt="g"
            onClick={this.handleNavigation('')}
            className={classes.logo}
          />
        </div>
        {isSysAdmin && <div className={classes.flexCenter}>
          <Tooltip title={t('Toggle admin panel')} placement="right" arrow>
            <IconButton onClick={this.toggleTab}>
              <AdminPanelSettings color="inherit" fontSize='large' className={classes.icon}/>
            </IconButton>
          </Tooltip>
        </div>}
        <List className={classes.list}>
          {tab === 1 && isSysAdmin && <div className={classes.flexCenter}>
            <IconButton
              color="primary"
              onClick={this.handleAdd}
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
                      onClick={this.handleDrawer(ID)}
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
                      <this.NestedListElement
                        ID={ID}
                        label={"Users"}
                        path="/users"
                        Icon={Person}
                      />
                      <this.NestedListElement
                        ID={ID}
                        label={"Contacts"}
                        path="/contacts"
                        Icon={ContactMail}
                      />
                      <this.NestedListElement
                        ID={ID}
                        label={"Groups"}
                        path="/groups"
                        Icon={Groups}
                      />
                      <this.NestedListElement
                        ID={ID}
                        label={"Folders"}
                        path="/folders"
                        Icon={Topic}
                      />
                    </List>
                  </Collapse>
                </React.Fragment> : null;
            })}
          {(tab === 0 && !isSysAdmin) && <this.ListElement
            label={"Task queue"}
            path="taskq"
            Icon={TaskAlt}
            style={{ flexGrow: 0 }}
          />}
          {tab === 0 && isSysAdmin && <React.Fragment>
            <this.ListElement
              label={"Dashboard"}
              path=""
              Icon={Dashboard}
            />
            <this.ListElement
              label={"Organizations"}
              path="orgs"
              Icon={Orgs}
            />
            <this.ListElement
              label={"Domains"}
              path="domains"
              Icon={Domains}
            />
            <this.ListElement
              label={"Users"}
              path="users"
              Icon={Person}
            />
            <this.ListElement
              label={"Contacts"}
              path="contacts"
              Icon={ContactMail}
            />
            <this.ListElement
              label={"Roles"}
              path="roles"
              Icon={Roles}
            />
            <this.ListElement
              label={"Defaults"}
              path="defaults"
              Icon={BackupTable}
            />
            <this.ListElement
              label={"LDAP Directory"}
              path="directory"
              Icon={Ldap}
            />
            <this.ListElement
              label={"Configuration DB"}
              path="dbconf"
              Icon={Storage}
            />
            <this.ListElement
              label={"Servers"}
              path="servers"
              Icon={Dns}
            />
            <this.ListElement
              label={"Monitoring"}
              path="logs"
              Icon={Logs}
            />
            <this.ListElement
              label={"Mail queue"}
              path="mailq"
              Icon={QueryBuilder}
            />
            <this.ListElement
              label={"Task queue"}
              path="taskq"
              Icon={TaskAlt}
            />
            <this.ListElement
              label={"Mobile devices"}
              path="sync"
              Icon={Sync}
            />
            <this.ListElement
              label={"Live status"}
              path="status"
              Icon={TableChart}
            />
          </React.Fragment>
          }
        </List>
        <AddDomain
          open={adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          onClose={this.handleAddingClose}
        />
        <Feedback
          snackbar={snackbar}
          onClose={() => this.setState({ snackbar: "" })}
        />
      </React.Fragment>
    );
  }
}

RetractedNavigationLinks.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domains: PropTypes.array,
  capabilities: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
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
  withRouter(withTranslation()(withStyles(styles)(RetractedNavigationLinks))));
