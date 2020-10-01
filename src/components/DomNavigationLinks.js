import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Http from '@material-ui/icons/Http';
import Settings from '@material-ui/icons/Settings';
import Aliases from '@material-ui/icons/AssignmentInd';
import Folder from '@material-ui/icons/Folder';
import Mail from '@material-ui/icons/Mail';
import Run from '@material-ui/icons/DirectionsRun';
import People from '@material-ui/icons/People';
import Search from '@material-ui/icons/Search';
import grey from '../colors/grey';
import blue from '../colors/blue';
import logo from '../res/grammm_logo_only.svg';
import { TextField, InputAdornment, Grid } from '@material-ui/core';
import { authLogout } from '../actions/auth';
import { connect } from 'react-redux';

const styles = theme => ({
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 2),
    ...theme.mixins.toolbar,
    justifyContent: 'center',
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
    display: 'block',
    padding: '9px 14px',
    transition: 'all 350ms linear',
    '&:hover': {
      backgroundColor: `rgba(255, 255, 255, 0.15)`,
    },
    '&.Mui-selected': {
      background: `linear-gradient(30deg, ${blue['700']}, ${blue['500']})`,
      color: 'black',
      '&:hover': {
        background: `linear-gradient(30deg, ${blue['700']}, ${blue['500']})`,
      },
    },
  },
  icon: {
    fontSize: '24px',
    lineHeight: '30px',
    float: 'left',
    marginTop: '2px',
    marginRight: '15px',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  nestedIcon: {
    float: 'left',
    paddingLeft: 16,
    paddingRight: 6,
  },
  logoutContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'flex-end',
    justifyContent: 'flex-end',
    flex: 1,
  },
  logout: {
    flex: 1,
    flexGrow: 0,
  },
  expandIcon: {
    float: 'right',
    marginTop: '2px',
  },
  textfield: {
    margin: theme.spacing(0, 1),
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
  input: {
    color: 'white',
    borderColor: 'white',
  },
});

class DomNavigationLinks extends PureComponent {

  constructor(props) {
    super(props);
    // Map domains array to bool obj with domains as keys
    const domains = this.props.domains.map(obj => obj.name)
      .reduce((a, b) => (a[b] = false, a), {});//eslint-disable-line
    this.listRef = React.createRef();
    this.state = {
      stateDomains: domains,
      filter: '',
    };
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleDrawer = domain => event => {
    event.preventDefault();
    let overwrite = {};
    for (const key in this.state) {
      overwrite[key] = false;
    }
    overwrite[domain] = !this.state[domain]
      || this.props.location.pathname !== '/' + domain;
    this.setState({ stateDomains: { ...overwrite } });
    this.props.history.push(`/${domain}`);
  }

  handleTextInput = event => {
    this.setState({ filter: event.target.value });
  }

  handleLogout = () => {
    const { history, authLogout } = this.props;
    history.push('/');
    authLogout();
  }

  render() {
    const { classes, t, domains, location } = this.props;
    const { filter, stateDomains } = this.state;

    return(
      <React.Fragment>
        <List className={classes.list} ref={this.listRef}>
          <div className={classes.drawerHeader}>
            <Button
              variant="text"
              color="primary"
              onClick={this.handleNavigation('')}
              className={classes.dashboard}
            >
              <img src={logo} width="80" alt="GRAMMM"/>
            </Button>
          </div>
          <Grid container>
            <TextField
              variant="outlined"
              label={t('Search')}
              value={filter}
              onChange={this.handleTextInput}
              InputLabelProps={{
                className: classes.input,
                shrink: true,
              }}
              InputProps={{
                classes: { root: classes.input },
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              color="primary"
              className={classes.textfield}
            />
          </Grid>
          {domains.map(({ domainname: name }) => {
            return name.includes(filter) ?
              <React.Fragment key={name}>
                <ListItem
                  onClick={this.handleDrawer(name)}
                  button
                  className={classes.li}
                  selected={stateDomains[name] && location.pathname === '/' + name}
                >
                  <Grid container alignItems="center">
                    <Http className={classes.icon} />
                    <ListItemText primary={name} />
                  </Grid>
                </ListItem>
                <Collapse in={stateDomains[name]} unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItem
                      className={classes.li}
                      button
                      onClick={this.handleNavigation(name + '/configuration')}
                      selected={stateDomains[name] &&
                        location.pathname.startsWith('/' + name + '/configuration')}
                    >
                      <Grid container alignItems="center">
                        <Settings className={classes.nestedIcon}/>
                        <ListItemText primary={t('Configuration')}/>
                      </Grid>
                    </ListItem>
                    <ListItem
                      className={classes.li}
                      button
                      onClick={this.handleNavigation(name + '/users')}
                      selected={stateDomains[name] &&
                        location.pathname.startsWith('/' + name + '/users')}
                    >
                      <Grid container alignItems="center">
                        <People className={classes.nestedIcon}/>
                        <ListItemText primary={t('Users')}/>
                      </Grid>
                    </ListItem>
                    <ListItem
                      className={classes.li}
                      button
                      onClick={this.handleNavigation(name + '/userAliases')}
                      selected={stateDomains[name] &&
                        location.pathname.startsWith('/' + name + '/userAliases')}
                    >
                      <Grid container alignItems="center">
                        <Aliases className={classes.nestedIcon}/>
                        <ListItemText primary={t('Aliases')}/>
                      </Grid>
                    </ListItem>
                    <ListItem
                      className={classes.li}
                      button
                      onClick={this.handleNavigation(name + '/folders')}
                      selected={stateDomains[name] &&
                        location.pathname.startsWith('/' + name + '/folders')}
                    >
                      <Grid container alignItems="center">
                        <Folder className={classes.nestedIcon}/>
                        <ListItemText primary={t('Folders')}/>
                      </Grid>
                    </ListItem>
                    <ListItem
                      className={classes.li}
                      button
                      onClick={this.handleNavigation(name + '/mailAddresses')}
                      selected={stateDomains[name] &&
                        location.pathname.startsWith('/' + name + '/mailAddresses')}
                    >
                      <Grid container alignItems="center">
                        <Mail className={classes.nestedIcon}/>
                        <ListItemText primary={t('Mail address list')}/>
                      </Grid>
                    </ListItem>
                  </List>
                </Collapse>
              </React.Fragment> : null;
          })}
          <div className={classes.logoutContainer}>
            <ListItem
              className={classes.li}
              button
              selected={location.pathname === '/settings'}
              onClick={this.handleNavigation('settings')}
            >
              <Grid container alignItems="center">
                <Settings className={classes.icon} />
                <ListItemText primary={t('Settings')} />
              </Grid>
            </ListItem>
            <ListItem button onClick={this.handleLogout} className={classes.li}>
              <Grid container alignItems="center">
                <Run className={classes.icon} />
                <ListItemText primary={t('Logout')} />
              </Grid>
            </ListItem>
          </div>
        </List>
      </React.Fragment>
    );
  }
}

DomNavigationLinks.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  domains: PropTypes.array.isRequired,
  authLogout: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    authLogout: async () => {
      await dispatch(authLogout());
    },
  };
};

export default withRouter(connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DomNavigationLinks))));