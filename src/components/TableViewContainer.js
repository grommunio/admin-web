import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { debounce, Typography, withStyles } from '@material-ui/core';
import TopBar from './TopBar';
import Feedback from './Feedback';
import { withTranslation } from 'react-i18next';

const styles = theme => ({
  root: {
    flex: 1,
    overflow: "auto",
  },
  base: {
    flexDirection: "column",
    padding: theme.spacing(2),
    flex: 1,
    display: "flex",
  },
  toolbar: theme.mixins.toolbar,
  pageTitle: {
    margin: theme.spacing(2),
  },
});

class TableViewContainer extends PureComponent {

  render() {
    const { classes, children, baseRef, topbarTitle, handleScroll, headline, snackbar, onSnackbarClose } = this.props;
    return (
      <div
        className={classes.root}
        onScroll={debounce(handleScroll || (() => null), 100)}
        id="scrollDiv"
      >
        <TopBar title={topbarTitle}/>
        <div className={classes.toolbar}></div>
        <div className={classes.base} ref={baseRef}>
          <Typography variant="h2" className={classes.pageTitle}>
            {headline}
          </Typography>
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
};

export default withTranslation()(withStyles(styles)(TableViewContainer));
