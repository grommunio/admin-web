import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from '@mui/material';
import { withStyles } from '@mui/styles';

const styles = theme => ({
  buttonGrid: {
    padding: theme.spacing(2),
  },
  actions: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});

function TableActionGrid({ classes, tf, children }) {
  return <Grid container alignItems="flex-end" className={classes.buttonGrid}>
    {children || null}
    <div className={classes.actions}>
      {tf || null}
    </div>
  </Grid>
}

TableActionGrid.propTypes = {
  classes: PropTypes.object.isRequired,
  tf: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
}

export default withStyles(styles)(TableActionGrid);