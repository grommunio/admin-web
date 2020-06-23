import React, { Component } from 'react';
import './App.css';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { withRouter } from "react-router-dom";
import PropTypes from 'prop-types';
import Routes from './Routes';
import ResponsiveDrawer from './components/ResponsiveDrawer';
import { authAuthenticating } from './actions/auth';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    backgroundColor: theme.palette.background.default,
    overflow: 'hidden',
  },
});

class App extends Component {

  async componentDidMount() {
    const { dispatch } = this.props;

    await dispatch(authAuthenticating(false));
  }
  
  render() {
    const { classes } = this.props;
    const { authenticating, authenticated } = this.props;

    const routesProps = {
      authenticating,
      authenticated,
    };

    return(
      <div className={classes.root}>
        {authenticated && <ResponsiveDrawer />}
        <Routes childProps={routesProps}/>
      </div>
      
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,

  authenticating: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
  const { authenticating, authenticated } = state.auth;

  return {
    authenticating,
    authenticated,
  };
};

export default withRouter(connect(mapStateToProps)(withStyles(styles)(App)));
