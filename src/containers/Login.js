import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  root: {
    display: 'flex',
  },
};

class Login extends Component {

  render() {
    const { classes } = this.props;
    return <div className={classes.root}>This is the Login</div>;
  }
}

Login.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Login);