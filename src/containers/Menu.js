import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
    overflow: 'auto',
  }, 
  column: {
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
  },
  toolbar: theme.mixins.toolbar,
  addFab: {
    position: 'absolute',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    width: 70,
    height: 70,
    '& svg': {
      fontSize: 40,
    },
    zIndex: 100,
  },
});

class Menu extends Component {

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          This is the Menu
        </div>
      </div>
    );
  }
}

Menu.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Menu);