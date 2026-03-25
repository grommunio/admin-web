// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { ReactNode } from 'react';
import { Grid2, Theme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';


const useStyles = makeStyles()((theme: Theme) => ({
  buttonGrid: {
    padding: theme.spacing(2),
  },
  actions: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
}));

type TableActionGridProps = {
  children?: ReactNode;
  tf?: ReactNode 
}

function TableActionGrid({ tf, children }: TableActionGridProps) {
  const { classes } = useStyles();
  return <Grid2 container alignItems="flex-end" className={classes.buttonGrid}>
    {children || null}
    <div className={classes.actions}>
      {tf || null}
    </div>
  </Grid2>
}


export default TableActionGrid;
