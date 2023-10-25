// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
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
import { Add, BackupTable, ContactMail, Dns, QueryBuilder, TableChart, TaskAlt } from '@mui/icons-material';
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
    paddingLeft: 16,
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

class NavigationLinks extends PureComponent {

  state = {
    tab: 0,
    filter: '',
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

  ListElement = ({ label, path, Icon }) => {
    const { classes, t } = this.props;
    const selected = location.pathname.endsWith('/' + path);
    return <ListItemButton
      onClick={this.handleNavigation(path)}
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

  NestedListElement = ({ ID, label, path, Icon }) => {
    const { classes, t, expandedDomain } = this.props;
    const selected = expandedDomain === ID &&
      location.pathname.startsWith('/' + ID + path);
    return <ListItemButton
      onClick={this.handleNavigation(ID + path)}
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

  render() {
    const { classes, t, tab, expandedDomain, location, domains, capabilities, config } = this.props;
    const { filter, adding, snackbar } = this.state;
    const isSysAdmin = capabilities.includes(SYSTEM_ADMIN_READ);
    const pathname = location.pathname;
    return(
      <React.Fragment>
        <div className={classes.drawerHeader}>
          <img
            src={config.customImages[window.location.hostname]?.logoLight || logo}
            height="32"
            alt="grommunio"
            onClick={this.handleNavigation('')}
            className={classes.logo}
          />
        </div>
        {isSysAdmin && <Tabs
          onChange={this.toggleTab}
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
                onChange={this.handleTextInput}
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
              onClick={this.handleAdd}
              className={classes.addButton}
            >
              {t("New domain")}
              <Add />
            </Button>
          </div>
          }
          {(tab === 1 || !isSysAdmin) &&
            domains.map(({ domainname: name, ID, domainStatus }) => 
              name.includes(filter) &&
                <React.Fragment key={name}>
                  <ListItemButton
                    onClick={this.handleDrawer(ID)}
                    selected={expandedDomain === ID && pathname === '/' + ID}
                    classes={{ selected: classes.selected }}
                  >
                    <ListItemIcon>
                      <Domains className={classes.icon}/>
                    </ListItemIcon>
                    <ListItemText primary={name + (domainStatus === 3 ? ` [${t('Deactivated')}]` : '')} />
                  </ListItemButton>
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
                        label={"Public folders"}
                        path="/folders"
                        Icon={Topic}
                      />
                    </List>
                  </Collapse>
                </React.Fragment>
            )}
          {(tab === 0 && !isSysAdmin) && <ListItemButton
            onClick={this.handleNavigation('taskq')}
            classes={{ selected: classes.selected }}
            selected={pathname.startsWith('/taskq')}
          >
            <ListItemIcon>
              <TaskAlt className={classes.icon}/>
            </ListItemIcon>
            <ListItemText primary={t('Task queue')} />
          </ListItemButton>}
          {tab === 0 && isSysAdmin && <React.Fragment>
            <Typography variant="inherit" className={classes.subheader}>{t('Overview')}</Typography>
            <this.ListElement
              label={"Dashboard"}
              path=""
              Icon={Dashboard}
            />
            <Typography variant="inherit" className={classes.subheader}>{t('Management')}</Typography>
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
            <Typography variant="inherit" className={classes.subheader}>{t('Configuration')}</Typography>
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

NavigationLinks.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domains: PropTypes.array,
  capabilities: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
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
  withRouter(withTranslation()(withStyles(styles)(NavigationLinks))));
