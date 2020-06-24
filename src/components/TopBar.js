import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import Add from '@material-ui/icons/Add';

const styles = {
  root: {
    marginLeft: 260,
  },
  title: {
    flexGrow: 1,
  },
};

class TopBar extends PureComponent {

  render() {
    const { classes, title, onAdd } = this.props;
    return (
      <AppBar className={classes.root}>
        <Toolbar className={classes.root}>
          <Typography className={classes.title} variant="h6">{title}</Typography>
          {onAdd && <Button onClick={onAdd} color="inherit">
            <Add />Add
          </Button>}
        </Toolbar>
      </AppBar>
    );
  }
}

TopBar.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string,
  onAdd: PropTypes.func,
};

export default withStyles(styles)(TopBar);