// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import Search from '@mui/icons-material/Search';
import BackIcon from '@mui/icons-material/ArrowBack';
import Import from '@mui/icons-material/ImportContacts';
import { CircularProgress, Divider, Grid, Grow, IconButton, InputAdornment, List, ListItem, ListItemText,
  Paper, TextField, Typography } from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { fetchLdapData } from '../actions/ldap';
import { debounce } from 'debounce';
import ImportDialog from '../components/Dialogs/ImportDialog';
import { CapabilityContext } from '../CapabilityContext';
import { DOMAIN_ADMIN_WRITE } from '../constants';
import ViewWrapper from '../components/ViewWrapper';

const styles = theme => ({
  pageTitle: {
    margin: theme.spacing(2, 2, 2, 2),
  },
  backIcon: {
    color: theme.palette.primary[500],
    position: 'relative',
    top: 4,
    right: 4,
    cursor: 'pointer',
  },
  searchTf: {
    maxWidth: 500,
  },
  loaderContainer: {
    margin: theme.spacing(2, 2, 2, 2),
  },
});

class Ldap extends PureComponent {

  state = {
    loading: false,
    confirming: null,
    snackbar: '',
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleLdapSearch = ({ target: t }) => {
    const query = t.value;
    if(query.length > 2) this.debounceFetch({ query });
  }

  debounceFetch = debounce(params => {
    const { fetch } = this.props;
    this.setState({ loading: true });
    fetch(params)
      .then(() => this.setState({ loading: false }))
      .catch(snackbar => this.setState({ snackbar, loading: false }));
  }, 200)

  handleImport = user => () => this.setState({ confirming: user });

  handleSuccess = () => this.setState({ confirming: false, snackbar: 'Success!' });

  handleClose = () => this.setState({ confirming: false });

  handleError = error => this.setState({ snackbar: error });

  render() {
    const { classes, t, domain, ldapUsers } = this.props;
    const { loading, snackbar, confirming } = this.state;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    return (
      <ViewWrapper
        topbarTitle={domain.domainname}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Typography variant="h2" className={classes.pageTitle}>
          <BackIcon onClick={this.handleNavigation(domain.ID + '/users')} className={classes.backIcon} />
          <span className={classes.pageTitleSecondary}>| </span>
          {t("LDAP")}
        </Typography>
        <Grid container justifyContent="center">
          <TextField
            autoFocus
            placeholder={t("Search LDAP")}
            onChange={this.handleLdapSearch}
            variant="outlined"
            color="primary"
            fullWidth
            className={classes.searchTf}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary"/>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        {ldapUsers.length > 0 && <Paper elevation={1}>
          <List>
            {ldapUsers.map((user, idx) => <React.Fragment key={idx}>
              <ListItem >
                <ListItemText
                  primary={user.name}
                  primaryTypographyProps={{ color: 'primary' }}
                  secondary={user.email}
                />
                {writable && <IconButton onClick={this.handleImport(user)} size="large">
                  <Import />
                </IconButton>}
              </ListItem>
              <Divider />
            </React.Fragment>
            )}
          </List>
        </Paper>}
        <Grid container justifyContent="center" className={classes.loaderContainer}>
          <Grow
            in={loading}
            timeout={{
              appear: 500,
              enter: 10,
              exit: 10,
            }}
          >
            <CircularProgress color="primary" size={40}/>
          </Grow>
        </Grid>
        <ImportDialog
          open={!!confirming}
          user={confirming || {}}
          onSuccess={this.handleSuccess}
          onClose={this.handleClose}
          onError={this.handleError}
        />
      </ViewWrapper>
    );
  }
}

Ldap.contextType = CapabilityContext;
Ldap.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  ldapUsers: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    ldapUsers: state.ldap.Users,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async params => await dispatch(fetchLdapData(params))
      .catch(err => Promise.reject(err)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Ldap)));