// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import Search from '@mui/icons-material/Search';
import BackIcon from '@mui/icons-material/ArrowBack';
import Import from '@mui/icons-material/ImportContacts';
import { Checkbox, CircularProgress, Divider, FormControlLabel, Grid, IconButton, InputAdornment, List, ListItem, ListItemAvatar, ListItemText,
  Paper, TextField, Tooltip, Typography } from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { clearLdapSearch, fetchLdapData } from '../actions/ldap';
import { debounce } from 'debounce';
import ImportDialog from '../components/Dialogs/ImportDialog';
import { CapabilityContext } from '../CapabilityContext';
import { DOMAIN_ADMIN_WRITE, ORG_ADMIN } from '../constants';
import ViewWrapper from '../components/ViewWrapper';
import { AccountCircle, ContactMail, Groups } from '@mui/icons-material';

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
  checkbox: {
    marginLeft: 16,
  },
});

class Ldap extends PureComponent {

  state = {
    search: '',
    loading: false,
    confirming: null,
    snackbar: '',
    searchInOrg: false,
    showAll: false,
  }

  componentWillUnmount() {
    this.props.clear();
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleLdapSearch = ({ target: t }) => {
    const { searchInOrg, showAll } = this.state;
    const { domain } = this.props;
    const query = t.value;
    if(query.length > 2) {
      this.debounceFetch({
        query,
        domain: searchInOrg ? undefined : domain.ID,
        organization: searchInOrg ? domain.orgID : undefined,
        showAll,
      });
    }
    this.setState({
      search: query,
    });
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

  handleCheckbox = field => e => {
    const { checked } = e.target;
    const { search } = this.state;
    const { domain } = this.props;
    this.setState({ [field]: checked });
    if(search.length > 2) this.debounceFetch({
      query: this.state.search,
      domain: checked ? undefined : domain.ID,
      organization: checked ? domain.orgID : undefined,
      showAll: checked,
    });
  }

  render() {
    const { classes, t, domain, ldapUsers, history } = this.props;
    const { search, loading, snackbar, confirming, searchInOrg, showAll } = this.state;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    return (
      <ViewWrapper
        topbarTitle={domain.domainname}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Typography variant="h2" className={classes.pageTitle}>
          <BackIcon onClick={history.goBack} className={classes.backIcon} />
          <span className={classes.pageTitleSecondary}>| </span>
          {t("LDAP")}
        </Typography>
        <Grid container justifyContent="center">
          <TextField
            autoFocus
            placeholder={t("Search LDAP")}
            onChange={this.handleLdapSearch}
            value={search}
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
          <FormControlLabel
            control={
              <Checkbox
                checked={showAll || false }
                value={showAll || false}
                onChange={this.handleCheckbox('showAll')}
                color="primary"
              />
            }
            label={t('Show all')}
            className={classes.checkbox}
          />
          {this.context.includes(ORG_ADMIN) && <FormControlLabel
            control={
              <Checkbox
                checked={searchInOrg || false }
                value={searchInOrg || false}
                onChange={this.handleCheckbox('searchInOrg')}
                color="primary"
              />
            }
            label={t('Search in entire organisation')}
            className={classes.checkbox}
          />}
        </Grid>
        {ldapUsers.length > 0 && <Paper elevation={1}>
          <List>
            {ldapUsers.map((user, idx) => <React.Fragment key={idx}>
              <ListItem >
                <ListItemAvatar>
                  {user.type === "contact" ?
                    <ContactMail /> : user.type === "group" ?
                      <Groups /> :
                      <AccountCircle />
                  }
                </ListItemAvatar>
                <ListItemText
                  primary={user.name}
                  primaryTypographyProps={{ color: 'primary' }}
                  secondary={user.email}
                />
                {writable && <Tooltip title={user.error || t("Import user")}>
                  <span>
                    <IconButton
                      disabled={!!user.error}
                      onClick={this.handleImport(user)}
                      size="large"
                    >
                      <Import />
                    </IconButton>
                  </span>
                </Tooltip>}
              </ListItem>
              <Divider />
            </React.Fragment>
            )}
          </List>
        </Paper>}
        {loading && <Grid container justifyContent="center">
          <CircularProgress color="primary" size={40}/>
        </Grid>}
        <ImportDialog
          domainID={domain.ID}
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
  clear: PropTypes.func.isRequired,
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
    clear: () => dispatch(clearLdapSearch())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Ldap)));