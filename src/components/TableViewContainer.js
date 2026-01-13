// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Fade, IconButton, LinearProgress, Typography } from '@mui/material';
import { withStyles } from 'tss-react/mui';
import Feedback from './Feedback';
import { withTranslation } from 'react-i18next';
import { HelpOutline } from '@mui/icons-material';
import { throttle } from 'lodash';


const styles = theme => ({
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
  toolbar: theme.mixins.toolbar,
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
});

const TableViewContainer = ({classes, children, baseRef, handleScroll, headline, subtitle,
  snackbar, onSnackbarClose, href, loading }) => {

  const debouncedScroll = useCallback(throttle(handleScroll || (() => null), 100), [handleScroll]);

  return (
    <div
      className={classes.root}
      onScroll={debouncedScroll}
      id="scrollDiv"
    >
      <div className={classes.toolbar}>
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

TableViewContainer.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
  baseRef: PropTypes.any,
  handleScroll: PropTypes.func,
  headline: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  snackbar: PropTypes.string,
  onSnackbarClose: PropTypes.func,
  subtitle: PropTypes.string,
  href: PropTypes.string,
  loading: PropTypes.bool,
};

export default withTranslation()(withStyles(TableViewContainer, styles));
