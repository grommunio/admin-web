import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Button, CircularProgress, Collapse, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Paper,
  Typography } from '@mui/material';
import { withTranslation } from 'react-i18next';
import { uploadLicenseData } from '../actions/license';
import { connect } from 'react-redux';
import TableViewContainer from '../components/TableViewContainer';
import { fetchDomainData } from '../actions/domains';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { fetchUsersData } from '../actions/users';

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
  headline: {
    marginRight: 8,
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
});

class License extends PureComponent {

  state = {
    snackbar: '',
    domainsExpanded: false,
    expandedDomainIdxs: [],
    domainUsers: {},
  }

  componentDidMount() {
    this.props.fetchDomains()
      .catch(snackbar => this.setState({ snackbar }));
  }

  handleUpload = () => {
    this.imageInputRef.click();
  }

  handleUploadConfirm = event => {
    this.props.upload(event.target.files[0])
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(snackbar => this.setState({ snackbar }));
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

  fetchUsers = async id => {
    const users = await this.props.fetchUsers(id)
      .catch(snackbar => this.setState({ snackbar }));
    this.setState({
      domainUsers: {
        ...this.state.domainUsers,
        [id]: users.data,
      },
    });
  }

  toggleDomainExpansion = () => this.setState({ domainsExpanded: !this.state.domainsExpanded });

  render() {
    const { classes, t, license, Domains } = this.props;
    const { snackbar, expandedDomainIdxs, domainUsers, domainsExpanded } = this.state;

    return (
      <TableViewContainer
        headline={t("License")}
        subtitle="In this view you can upload your license and check which users occupy user slots"
        href="https://docs.grommunio.com/admin/administration.html#license"
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
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
            <Typography variant="body2">{t("Don't have a license?")}</Typography>
            <Button
              className={classes.buyNow}
              variant="contained"
              color="primary"
              href="https://grommunio.com/product/"
              target="_blank"
              size="small"
            >
              {t('Buy now')}
            </Button>
          </Grid>
          <Grid container direction="column" className={classes.licenseContainer}>
            <Typography className={classes.data}>
              <span className={classes.description}>{t('Product')}:</span>
              {license.product}
            </Typography>
            <Typography className={classes.data}>
              <span className={classes.description}>{t('Created')}:</span>
              {license.notBefore}
            </Typography>
            <Typography className={classes.data}>
              <span className={classes.description}>{t('Expires')}:</span>
              {license.notAfter}
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
                      primary={domainname}
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
      </TableViewContainer>
    );
  }
}

License.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  license: PropTypes.object.isRequired,
  upload: PropTypes.func.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  Domains: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  const { license, domains } = state;
  return {
    license: license.License,
    Domains: domains.Domains,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchDomains: async () => {
      await dispatch(fetchDomainData({ sort: 'domainname,asc', level: 0, limit: 10000 }))
        .catch(error => Promise.reject(error));
    },
    fetchUsers: async (domainID) => 
      await dispatch(fetchUsersData(domainID, { sort: 'username,asc', level: 0, status: 0, limit: 10000 }))
        .catch(error => Promise.reject(error)),
    upload: async license => await dispatch(uploadLicenseData(license))
      .catch(err => Promise.reject(err)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(License)));
