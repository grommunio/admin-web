import React, { Component } from 'react';
import './App.css';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { withRouter } from "react-router-dom";
import PropTypes from 'prop-types';
import AdminRoutes from './Routes';
import DomainRoutes from './DomainRoutes';
import { authAuthenticating } from './actions/auth';
import ResponsiveDomDrawer from './components/ResponsiveDomDrawer';
import background from './res/bootback.svg';
import darkBackground from './res/bootback-dark.svg';
import { fetchDomainData } from './actions/domains';

const styles = {
  root: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    backgroundImage: 'url(' + background + ')',
    backgroundSize: 'cover',
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 1,
  },
  layer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 10,
  },
  darkRoot: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    backgroundImage: 'url(' + darkBackground + ')',
    backgroundSize: 'cover',
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 1,
  },
  darkLayer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 10,
  },
  mainView: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    zIndex: 100,
  },
};

class App extends Component {

  async componentDidMount() {
    const { dispatch } = this.props;

    await dispatch(authAuthenticating(false));
    if(this.props.role !== 'sys') await dispatch(fetchDomainData());
  }

  render() {
    const { classes } = this.props;
    const { authenticating, authenticated, role } = this.props;

    const routesProps = {
      authenticating,
      authenticated,
      role,
    };

    return(
      <div className={ window.localStorage.getItem('darkMode') === 'true' ? 
        classes.darkRoot : classes.root}>
        <div
          className={window.localStorage.getItem('darkMode') === 'true' ?
            classes.darkLayer : classes.layer}
        />
        <div className={classes.mainView}>
          {authenticated &&
            <ResponsiveDomDrawer role={role} domains={this.props.domains.Domains}/>}
          {role === 'sys' ? <AdminRoutes childProps={routesProps}/> :
            <DomainRoutes domains={this.props.domains.Domains} childProps={routesProps}/>
          }
        </div>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  domains: PropTypes.object.isRequired,
  authenticating: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
  role: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  const { authenticating, authenticated, role } = state.auth;
  const { domains } = state;

  return {
    authenticating,
    authenticated,
    role,
    domains,
  };
};

export default withRouter(connect(mapStateToProps)(
  withStyles(styles)(App)));
