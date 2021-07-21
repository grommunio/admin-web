// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button, Grid } from '@material-ui/core';
import { withRouter } from 'react-router';

const styles = {
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default withRouter(withStyles(styles)(function NotFound(props) {
  const { classes } = props;
  const handleButton = () => props.history.push('/');

  return (
    <div className={classes.root}>
      <Grid container justify="center" direction="column" alignItems="center">
        <Typography variant="h1">
          Page not found
        </Typography>
        <Button onClick={handleButton}>Return to Menu</Button>
      </Grid>
    </div>
  );
}));
