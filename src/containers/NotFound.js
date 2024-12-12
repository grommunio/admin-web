// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import { withStyles } from 'tss-react/mui';
import { Typography, Button, Grid2 } from '@mui/material';
import { useNavigate } from 'react-router';

const styles = {
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default withStyles(function NotFound(props) {
  const { classes } = props;
  const navigate = useNavigate();
  const handleButton = () => navigate('/');

  return (
    <div className={classes.root}>
      <Grid2 container justifyContent="center" direction="column" alignItems="center">
        <Typography variant="h1">
          Page not found
        </Typography>
        <Button onClick={handleButton}>Return to Menu</Button>
      </Grid2>
    </div>
  );
}, styles);
