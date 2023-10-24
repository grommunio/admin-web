import { Button, CircularProgress, Collapse, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { setDateTimeString } from '../../utils';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { withTranslation } from 'react-i18next';
import { fetchDomainData } from '../../actions/domains';
import { fetchPlainUsersData, fetchUserCount } from '../../actions/users';
import { uploadLicenseData } from '../../actions/license';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom/cjs/react-router-dom.min';


const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
  },
  description: {
    display: 'inline-block',
    fontWeight: 500,
    width: 200,
  },
  data: {
    padding: '8px 0',
  },
  licenseContainer: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  buyNow: {
    margin: theme.spacing(0, 0, 0, 1),
  },
  gridItem: {
    display: 'flex',
    flex: 1,
  },
  progressContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: theme.spacing(1),
  },
  input: {
    margin: theme.spacing(1),
  },
  subtitle: {
    margin: theme.spacing(2, 0, 0, 2),
  }
});


class LicenseTab extends PureComponent {

  state = {
    domainsExpanded: false,
    expandedDomainIdxs: [],
    domainUsers: {},
    counts: {},
  }

  handleExpansion = (ID, idx) => () => {
    const { expandedDomainIdxs, domainUsers } = this.state;
    const copy = [...expandedDomainIdxs];
    if(copy.includes(idx)) {
      copy.splice(copy.findIndex(arrayIdx => arrayIdx === idx), 1);
    } else {
      if(!domainUsers[ID]) this.fetchUsers(ID);
      copy.push(idx);
    }
    this.setState({ expandedDomainIdxs: copy });
  }

  toggleDomainExpansion = () => this.setState({ domainsExpanded: !this.state.domainsExpanded });

  handleUpload = () => {
    this.imageInputRef.click();
  }

  handleUploadConfirm = event => {
    const { upload, setSnackbar } = this.props;
    upload(event.target.files[0])
      .then(() => setSnackbar("Success!"))
      .catch(setSnackbar);
  }

  handleNavigation = domainID => () => {
    this.props.history.push(`/${domainID}/users`);
  }

  fetchUsers = async id => {
    const { fetchUsers, setSnackbar } = this.props;
    const users = await fetchUsers(id)
      .catch(setSnackbar);
    this.setState({
      domainUsers: {
        ...this.state.domainUsers,
        [id]: users.data,
      },
    });
  }

  render() {
    const { classes, t, license, Domains, counts } = this.props;
    const { domainsExpanded, expandedDomainIdxs, domainUsers } = this.state;

    return <>
      <Typography variant="caption" className={classes.subtitle}>
        {t("license_sub")}
      </Typography>
      <Paper className={classes.paper} elevation={1}>
        <Grid container alignItems="center">
          <Grid item className={classes.gridItem}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleUpload}
              size="small"
            >
              {t('Upload')}
            </Button>
          </Grid>
          {license.maxUsers < 6 && <><Typography variant="body2">{t("Don't have a license?")}</Typography>
            <Button
              className={classes.buyNow}
              variant="contained"
              color="primary"
              href="https://grommunio.com/product/"
              target="_blank"
              size="small"
            >
              {t('Buy now')}
            </Button></>}
        </Grid>
        <Grid container direction="column" className={classes.licenseContainer}>
          <Typography className={classes.data}>
            <span className={classes.description}>{t('Product')}:</span>
            {license.product}
          </Typography>
          <Typography className={classes.data}>
            <span className={classes.description}>{t('Created')}:</span>
            {setDateTimeString(license.notBefore)}
          </Typography>
          <Typography className={classes.data}>
            <span className={classes.description}>{t('Expires')}:</span>
            {setDateTimeString(license.notAfter)}
          </Typography>
          <Typography className={classes.data}>
            <span className={classes.description}>{t('Users')}:</span>
            {license.currentUsers}
            <IconButton onClick={this.toggleDomainExpansion} size="small">
              {domainsExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Typography>
          <Collapse in={domainsExpanded} unmountOnExit>
            <List>
              {Domains.map(({ ID, domainname }, idx) => <React.Fragment key={idx}>
                <ListItemButton onClick={this.handleExpansion(ID, idx)}>
                  <ListItemText
                    primary={`${domainname} (${counts[domainname] || 0})`}
                  />
                  {expandedDomainIdxs.includes(idx) ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={expandedDomainIdxs.includes(idx)} unmountOnExit>
                  <List component="div" disablePadding>
                    {domainUsers[ID] ? domainUsers[ID].map((user, idx) => 
                      <ListItem key={idx} sx={{ pl: 4 }}>
                        <ListItemText primary={user.username}/>
                      </ListItem> 
                    ) : <div className={classes.progressContainer}>
                      <CircularProgress/>
                    </div>}
                    <ListItemButton onClick={this.handleNavigation(ID)} sx={{ pl: 4 }}>
                      <ListItemText primary={t('View all') + "..."}/>
                    </ListItemButton>
                  </List>
                </Collapse>
              </React.Fragment>)}
            </List>
          </Collapse>
          <Typography className={classes.data}>
            <span className={classes.description}>{t('Max users')}:</span>
            {license.maxUsers}
          </Typography>
        </Grid>
        <input
          accept=".crt,.pem"
          style={{ display: 'none' }}
          id="license-upload-input"
          type="file"
          ref={r => (this.imageInputRef = r)}
          onChange={this.handleUploadConfirm}
        />
      </Paper>
    </>;
  }
}

LicenseTab.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  license: PropTypes.object.isRequired,
  Domains: PropTypes.array.isRequired,
  counts: PropTypes.object.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  upload: PropTypes.func.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  fetchCount: PropTypes.func.isRequired,
  setSnackbar: PropTypes.func.isRequired,
}

const mapStateToProps = state => {
  const { license, domains } = state;
  return {
    license: license,
    Domains: domains.Domains,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchDomains: async () => {
      await dispatch(fetchDomainData({ sort: 'domainname,asc', level: 0, limit: 10000 }))
        .catch(error => Promise.reject(error));
    },
    fetchCount: async domainID => await dispatch(fetchUserCount(domainID))
      .catch(error => Promise.reject(error)),
    fetchUsers: async (domainID) => 
      await dispatch(fetchPlainUsersData(domainID, { status: 0 }))
        .catch(error => Promise.reject(error)),
    upload: async license => await dispatch(uploadLicenseData(license))
      .catch(err => Promise.reject(err)),
  };
};


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(withTranslation()(LicenseTab))));
