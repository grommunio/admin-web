// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { Paper, Typography, Grid, Button } from '@mui/material';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import DeleteDomain from '../components/Dialogs/DeleteDomain';
import { PureComponent } from 'react';
import { deleteDomainData } from '../actions/domains';
import { ORG_ADMIN } from '../constants';
import TableViewContainer from '../components/TableViewContainer';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2, 2, 2, 2),
    flex: 1,
    display: 'flex',
    overflow: 'auto',
  }, 
  toolbar: theme.mixins.toolbar,
  tablePaper: {
    margin: theme.spacing(3, 2, 3, 2),
  },
  description: {
    display: 'inline-block',
    fontWeight: 500,
    width: 240,
  },
  data: {
    padding: '8px 0',
  },
  container: {
    margin: theme.spacing(2, 2, 2, 2),
  },
  firstRow: {
    display: 'flex',
    flex: 1,
    paddingBottom: 8,
  },
  editButtonContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
    marginRight: 28,
  },
});

class DomainMenu extends PureComponent {

  state = {
    deleting: false,
  }

  handleNav = () => {
    const { domain, history } = this.props;
    history.push('/domains/' + domain.ID);
  };

  handleDelete = (event) => {
    event.stopPropagation();
    this.setState({ deleting: true });
  };

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteError = (error) => this.setState({ snackbar: error });

  handleDeleteSuccess = () => {
    const { domain, history } = this.props;
    history.push('/' + domain.ID);
  };

  render() {
    const { classes, domain, t, capabilities } = this.props;
    const { deleting } = this.state;
    const editable = capabilities.includes(ORG_ADMIN);

    return (
      <TableViewContainer
        headline={t("Domain overview")}
      >
        <Paper className={classes.tablePaper} elevation={1}>
          <Grid container direction="column" className={classes.container}>
            <Grid item className={classes.firstRow}>
              <Typography variant="h6">
                <span className={classes.description}>{t('Domain name')}:</span>
                {domain.domainname}
              </Typography>
              {editable && <div className={classes.editButtonContainer}>
                <Button
                  onClick={this.handleNav}
                  variant="contained"
                  color="primary"
                  style={{ marginRight: 8 }}
                >
                  {t('editHeadline', { item: 'domain' })}
                </Button>
                <Button
                  onClick={this.handleDelete}
                  variant="contained"
                  color="secondary"
                >
                  {t('Delete domain')}
                </Button>
              </div>}
            </Grid>
            <Typography variant="h6" className={classes.data}>
              <span className={classes.description}>{t('Title')}:</span>
              {domain.title}
            </Typography>
            <Typography variant="h6" className={classes.data}>
              <span className={classes.description}>{t('Address')}:</span>
              {domain.address}
            </Typography>
            <Typography variant="h6" className={classes.data}>
              <span className={classes.description}>{t('Admin')}:</span>
              {domain.adminName}
            </Typography>
            <Typography variant="h6" className={classes.data}>
              <span className={classes.description}>{t('Users')}:</span>
              {`${domain.activeUsers} active, ${domain.inactiveUsers} inactive, ${domain.maxUser} maximum`}
            </Typography>
            <Typography variant="h6" className={classes.data}>
              <span className={classes.description}>{t('Telephone')}:</span>
              {domain.tel}
            </Typography>
          </Grid>
        </Paper>
        <DeleteDomain
          open={deleting}
          delete={this.props.delete}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
          item={domain.domainname}
          id={domain.ID}
        />
      </TableViewContainer>
    );
  }
}


DomainMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object,
  capabilities: PropTypes.array,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    capabilities: state.auth.capabilities,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    delete: async (id, params) => {
      await dispatch(deleteDomainData(id, params)).catch((error) =>
        Promise.reject(error)
      );
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DomainMenu))));
