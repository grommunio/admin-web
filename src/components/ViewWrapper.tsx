// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { ReactNode } from 'react';
import { makeStyles } from 'tss-react/mui';
import Feedback from './Feedback';
import { Fade, LinearProgress, Theme } from '@mui/material';


const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1, 0),
    },
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(2),
    },
    overflowY: 'scroll',
  },
  lp: {
    position: 'absolute',
    top: 64,
    width: '100%',
  },
}));

type ViewWrapperProps = {
  children: ReactNode;
  snackbar: string;
  onSnackbarClose: () => void;
  loading: boolean;
}

function ViewWrapper ({ children, snackbar, onSnackbarClose, loading }: ViewWrapperProps) {
  const { classes } = useStyles();

  return (
    <div className={classes.root}>
      <div>
        <Fade
          in={loading}
          style={{
            transitionDelay: '500ms',
          }}
        >
          <LinearProgress variant="indeterminate" color="primary" className={classes.lp}/>
        </Fade>
      </div>
      <div className={classes.base}>
        {children}
      </div>
      <Feedback
        snackbar={snackbar || ''}
        onClose={onSnackbarClose}
      />
    </div>
  );
}


export default ViewWrapper;
