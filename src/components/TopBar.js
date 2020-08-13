import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import { switchView } from '../actions/auth';
import { fetchDomainData } from '../actions/domains';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

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
});

class TopBar extends PureComponent {

  handleViewSwitch = async () => {
    const { dispatch, Domains } = this.props;
    this.props.history.push('/');
    if(Domains.length === 0) dispatch(fetchDomainData()); 
    await dispatch(switchView());
  }

  render() {
    const { classes, title, onAdd } = this.props;
    return (
      <AppBar className={classes.root}>
        <Toolbar className={classes.root}>
          <Typography className={classes.title} variant="h6">{title}</Typography>
          <Button onClick={this.handleViewSwitch}>Switch View</Button>
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