import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import { switchView } from '../actions/auth';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

const styles = {
  root: {
    marginLeft: 260,
  },
  title: {
    flexGrow: 1,
    fontWeight: 500,
  },
};

class TopBar extends PureComponent {

  handleViewSwitch = async () => {
    const { dispatch } = this.props;
    this.props.history.push('/');
    await dispatch(switchView());
  }

  render() {
    const { classes, title, onAdd } = this.props;
    return (
      <AppBar className={classes.root}>
        <Toolbar className={classes.root}>
          <Typography className={classes.title} variant="h6">{title}</Typography>
          {onAdd && <Button onClick={onAdd} color="inherit">
            <Add />Add
          </Button>}
          <Button onClick={this.handleViewSwitch}>Switch View</Button>
        </Toolbar>
      </AppBar>
    );
  }
}

TopBar.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  onAdd: PropTypes.func,
};

export default withRouter(connect()(withStyles(styles)(TopBar)));