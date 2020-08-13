import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button, Hidden, IconButton } from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import { switchView } from '../actions/auth';
import { fetchDomainData } from '../actions/domains';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Burger from '@material-ui/icons/Menu';
import { setDrawerExpansion } from '../actions/drawer';

const styles = theme => ({
  root: {
    [theme.breakpoints.up('lg')]: {
      marginLeft: 260,
    },
  },
  title: {
    flexGrow: 1,
    fontWeight: 500,
  },
  burger: {
    marginRight: 16,
  },
});

class TopBar extends PureComponent {

  handleViewSwitch = async () => {
    const { dispatch, Domains } = this.props;
    this.props.history.push('/');
    if(Domains.length === 0) dispatch(fetchDomainData()); 
    await dispatch(switchView());
  }

  handleMenuToggle = async () => {
    const { dispatch } = this.props;
    await dispatch(setDrawerExpansion());
  }

  render() {
    const { classes, title, onAdd } = this.props;
    return (
      <AppBar className={classes.root}>
        <Toolbar className={classes.root}>
          <Hidden lgUp>
            <IconButton color="inherit" onClick={this.handleMenuToggle}>
              <Burger />
            </IconButton>
          </Hidden>
          <Typography className={classes.title} variant="h6">{title}</Typography>
          <Button onClick={this.handleViewSwitch} color="inherit">Switch View</Button>
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
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  Domains: PropTypes.array.isRequired,
  onAdd: PropTypes.func,
};

const mapStateToProps = state => {
  return { Domains: state.domains.Domains };
};

export default withRouter(connect(mapStateToProps)(withStyles(styles)(TopBar)));