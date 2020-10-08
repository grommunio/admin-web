import React, { Component } from 'react';
import './App.css';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';
import Loader from './components/LoadingMainView';
import { withRouter } from "react-router-dom";
import PropTypes from 'prop-types';
import { authAuthenticating } from './actions/auth';
import background from './res/bootback.svg';
import darkBackground from './res/bootback-dark.svg';
import i18n from './i18n';
import { changeSettings } from './actions/settings';

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

let MainView = Loadable({
  loader: () => import('./components/LoadableMainView'),
  loading: Loader,
  timeout: 20000,
  delay: 300,
});

class App extends Component {

  async componentDidMount() {
    const { dispatch } = this.props;
    const lang = localStorage.getItem('lang');
    if(lang) {
      i18n.changeLanguage(lang);
      await dispatch(changeSettings('language', lang));
    }
    await dispatch(authAuthenticating(false));
  }

  render() {
    const { classes, Domains } = this.props;
    const { authenticating, authenticated, role } = this.props;
    const darkMode = window.localStorage.getItem('darkMode');
    const routesProps = {
      authenticating,
      authenticated,
      role,
    };

    return(
      <div className={darkMode === 'true' ? 
        classes.darkRoot : classes.root}>
        <div className={darkMode === 'true' ?
          classes.darkLayer : classes.layer}
        />
        <MainView
          classes={classes}
          authenticated={authenticated}
          role={role}
          domains={Domains}
          routesProps={routesProps}
        />
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  Domains: PropTypes.array.isRequired,
  authenticating: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
  role: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  const { authenticating, authenticated, role } = state.auth;
  const { Domains } = state.drawer;

  return {
    authenticating,
    authenticated,
    role,
    Domains,
  };
};

export default withRouter(connect(mapStateToProps)(
  withStyles(styles)(App)));
