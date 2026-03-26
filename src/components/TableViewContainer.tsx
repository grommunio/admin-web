// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { ReactNode, Ref, useCallback } from 'react';
import { Fade, IconButton, LinearProgress, Theme, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import Feedback from './Feedback';
import { HelpOutline } from '@mui/icons-material';
import { throttle } from 'lodash';


const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    flex: 1,
    overflow: "auto",
    display: 'flex',
    flexDirection: 'column',
  },
  base: {
    flexDirection: "column",
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1, 0),
    },
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(2),
    },
    flex: 1,
    display: "flex",
  },
  pageTitle: {
    margin: theme.spacing(2, 2, 1, 2),
  },
  subtitle: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  lp: {
    position: 'absolute',
    top: 64,
    width: '100%',
  },
}));


type TableViewContainerProps = {
  children: ReactNode;
  baseRef?: Ref<HTMLDivElement>;
  handleScroll?: () => void;
  headline: string;
  subtitle?: string;
  snackbar?: string;
  onSnackbarClose: () => void;
  href?: string;
  loading?: boolean;
}

const TableViewContainer = ({ children, baseRef, handleScroll, headline, subtitle,
  snackbar, onSnackbarClose, href, loading }: TableViewContainerProps) => {
  const { classes } = useStyles();

  const debouncedScroll = useCallback(throttle(handleScroll || (() => null), 100), [handleScroll]);

  return (
    <div
      className={classes.root}
      onScroll={debouncedScroll}
      id="scrollDiv"
    >
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
      <div className={classes.base} ref={baseRef}>
        <Typography variant="h2" className={classes.pageTitle}>
          {headline}
          {href && <IconButton
            size="small"
            href={href}
            target="_blank"
          >
            <HelpOutline fontSize="small"/>
          </IconButton>}
        </Typography>
        {subtitle && <Typography variant="caption" className={classes.subtitle}>
          {subtitle}
        </Typography>}
        {children}
      </div>
      <Feedback
        snackbar={snackbar || ''}
        onClose={onSnackbarClose}
      />
    </div>
  );
}


export default TableViewContainer;
