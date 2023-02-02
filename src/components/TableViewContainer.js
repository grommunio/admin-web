// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { debounce, IconButton, Typography } from '@mui/material';
import { withStyles } from '@mui/styles';
import TopBar from './TopBar';
import Feedback from './Feedback';
import { withTranslation } from 'react-i18next';
import { HelpOutline } from '@mui/icons-material';

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
});

class TableViewContainer extends PureComponent {

  render() {
    const { classes, children, baseRef, topbarTitle, handleScroll, headline, subtitle,
      snackbar, onSnackbarClose, href, loading } = this.props;
    return (
      <div
        className={classes.root}
        onScroll={debounce(handleScroll || (() => null), 100)}
        id="scrollDiv"
      >
        <TopBar title={topbarTitle} loading={loading}/>
        <div className={classes.toolbar}></div>
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
}

TableViewContainer.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
  baseRef: PropTypes.func,
  topbarTitle: PropTypes.string,
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

export default withTranslation()(withStyles(styles)(TableViewContainer));
