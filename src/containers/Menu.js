import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  root: {
    display: 'flex',
  },
};

class Menu extends Component {

  render() {
    const { classes } = this.props;
    return <div className={classes.root}>This is the Menu</div>;
  }
}

Menu.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Menu);