// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
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
import { useNavigate } from 'react-router';

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

const Ldap = props => {
  const [state, setState] = useState({
    search: '',
    loading: false,
    confirming: null,
    snackbar: '',
    searchInOrg: false,
    showAll: false,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      props.clear();
    }
  }, []);

  const handleLdapSearch = ({ target: t }) => {
    const { searchInOrg, showAll } = state;
    const { domain } = props;
    const query = t.value;
    if(query.length > 2) {
      debounceFetch({
        query,
        domain: searchInOrg ? undefined : domain.ID,
        organization: searchInOrg ? domain.orgID : undefined,
        showAll,
      });
    }
    setState({
      ...state,
      search: query,
    });
  }

  const debounceFetch = debounce(params => {
    const { fetch } = props;
    setState({ ...state,loading: true });
    fetch(params)
      .then(() => setState({ ...state,loading: false }))
      .catch(snackbar => setState({ ...state,snackbar, loading: false }));
  }, 200)

  const handleImport = user => () => setState({ ...state,confirming: user });

  const handleSuccess = () => setState({ ...state,confirming: false, snackbar: 'Success!' });

  const handleClose = () => setState({ ...state,confirming: false });

  const handleError = error => setState({ ...state,snackbar: error });

  const handleCheckbox = field => e => {
    const { checked } = e.target;
    const { search } = state;
    const { domain } = props;
    setState({ ...state, [field]: checked });
    if(search.length > 2) debounceFetch({
      query: state.search,
      domain: checked ? undefined : domain.ID,
      organization: checked ? domain.orgID : undefined,
      showAll: checked,
    });
  }

  const { classes, t, domain, ldapUsers } = props;
  const { search, loading, snackbar, confirming, searchInOrg, showAll } = state;
  const writable = context.includes(DOMAIN_ADMIN_WRITE);
  return (
    <ViewWrapper
      topbarTitle={domain.domainname}
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state,snackbar: '' })}
    >
      <Typography variant="h2" className={classes.pageTitle}>
        <BackIcon onClick={() => navigate(-1)} className={classes.backIcon} />
        <span className={classes.pageTitleSecondary}>| </span>
        {t("LDAP")}
      </Typography>
      <Grid container justifyContent="center">
        <TextField
          autoFocus
          placeholder={t("Search LDAP")}
          onChange={handleLdapSearch}
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
              onChange={handleCheckbox('showAll')}
              color="primary"
            />
          }
          label={t('Show all')}
          className={classes.checkbox}
        />
        {context.includes(ORG_ADMIN) && <FormControlLabel
          control={
            <Checkbox
              checked={searchInOrg || false }
              value={searchInOrg || false}
              onChange={handleCheckbox('searchInOrg')}
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
                    onClick={handleImport(user)}
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
        onSuccess={handleSuccess}
        onClose={handleClose}
        onError={handleError}
      />
    </ViewWrapper>
  );
}

Ldap.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
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