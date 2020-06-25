import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TopBar from '../components/TopBar';

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
  toolbar: theme.mixins.toolbar,
});

class DomainMenu extends Component {

  render() {
    const { classes, domain } = this.props;
    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title={domain}/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <img src="https://pbs.twimg.com/media/DwCx5qKUUAEfMTz.jpg" width="400" alt="fucking donkey" />
        </div>
      </div>
    );
  }
}

DomainMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  domain: PropTypes.string,
};

export default withStyles(styles)(DomainMenu);