// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { makeStyles } from 'tss-react/mui';
import { Typography, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router';


const useStyles = makeStyles()(() => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export default function NotFound() {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const handleButton = () => navigate('/');

  return (
    <div className={classes.root}>
      <Grid
        container
        sx={{ flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}>
        <Typography variant="h1">
          Page not found
        </Typography>
        <Button onClick={handleButton}>Return to Menu</Button>
      </Grid>
    </div>
  );
}
