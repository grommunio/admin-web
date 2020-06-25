import React, { Component } from 'react';
import './App.css';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { withRouter } from "react-router-dom";
import PropTypes from 'prop-types';
import AdminRoutes from './Routes';
import DomainRoutes from './DomainRoutes';
import ResponsiveDrawer from './components/ResponsiveDrawer';
import { authAuthenticating } from './actions/auth';
import ResponsiveDomDrawer from './components/ResponsiveDomDrawer';
import background from './res/bootback.svg';

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
  }
  
  render() {
    const { classes } = this.props;
    const { authenticating, authenticated, role } = this.props;

    const routesProps = {
      authenticating,
      authenticated,
      role,
    };

    const domains = [
      { name: 'full-speed.net'},
      { name: 'netitwork.net'},
      { name: 'grammm.com'},
    ];

    return(
      <div className={classes.root}>
        <div className={classes.layer} />
        <div className={classes.mainView}>
          {authenticated && (role === 'sys' ? <ResponsiveDrawer /> :
            <ResponsiveDomDrawer domains={domains}/>)
          }
          {role === 'sys' ? <AdminRoutes childProps={routesProps}/> :
            <DomainRoutes domains={domains} childProps={routesProps}/>
          }
        </div>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,

  authenticating: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
  role: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  const { authenticating, authenticated, role } = state.auth;

  return {
    authenticating,
    authenticated,
    role,
  };
};

export default withRouter(connect(mapStateToProps)(withStyles(styles)(App)));
