import { Button, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, TextField, Typography } from '@mui/material';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { setDateTimeString } from '../../utils';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { withTranslation } from 'react-i18next';
import { fetchPlainUsersData } from '../../actions/users';
import { getLicenseCreds, submitLicenseCreds, uploadLicenseData } from '../../actions/license';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';


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
  },
  tf: {
    marginTop: 8,
  }
});


const LicenseTab = props => {
  const [state, setState] = useState({
    domainsExpanded: false,
    expandedDomainIdxs: [],
    domainUsers: {},
    dialogOpen: false,
    username: "",
    password: "",
  });
  const imageInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const creds = await props.getCreds().catch();
      if(creds?.username) {
        setState({ ...state, ...creds });
      }
    };

    fetchData();
  }, []);

  const handleExpansion = (ID, idx) => () => {
    const { expandedDomainIdxs, domainUsers } = state;
    const copy = [...expandedDomainIdxs];
    if(copy.includes(idx)) {
      copy.splice(copy.findIndex(arrayIdx => arrayIdx === idx), 1);
    } else {
      if(!domainUsers[ID]) fetchUsers(ID);
      copy.push(idx);
    }
    setState({ ...state, expandedDomainIdxs: copy });
  }

  const toggleDomainExpansion = () => setState({ ...state, domainsExpanded: !state.domainsExpanded });

  const handleUpload = () => {
    imageInputRef.current.click();
  }

  const handleUploadConfirm = event => {
    const { upload, setSnackbar } = props;
    upload(event.target.files[0])
      .then(() => setSnackbar("Success!"))
      .catch(setSnackbar);
  }

  const handleNavigation = domainID => () => {
    navigate(`/${domainID}/users`);
  }

  const fetchUsers = async id => {
    const { fetchUsers, setSnackbar } = props;
    const users = await fetchUsers(id)
      .catch(setSnackbar);
    setState({
      ...state, 
      domainUsers: {
        ...state.domainUsers,
        [id]: users.data,
      },
    });
  }

  const handleDialog = dialogOpen => () => setState({ ...state, dialogOpen });

  const handleInput = field => e => setState({ ...state, [field]: e.target.value });

  const handleSubmit = () => {
    const { setSnackbar } = props;
    const { username, password } = state;
    props.submitLicenseCreds({ username, password })
      .then(() => setSnackbar("Success!"))
      .catch(setSnackbar);
  }

  const { classes, t, license, Domains, counts } = props;
  const { domainsExpanded, expandedDomainIdxs, domainUsers, dialogOpen, username, password } = state;
  
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
            onClick={handleDialog(true)}
            size="small"
          >
            {t(license?.certificate ?'Reactivate license' : 'Reactivate license')}
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
          <IconButton onClick={toggleDomainExpansion} size="small">
            {domainsExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Typography>
        <Collapse in={domainsExpanded} unmountOnExit>
          <List>
            {Domains.map(({ ID, domainname }, idx) => <React.Fragment key={idx}>
              <ListItemButton onClick={handleExpansion(ID, idx)}>
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
                  <ListItemButton onClick={handleNavigation(ID)} sx={{ pl: 4 }}>
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
        ref={imageInputRef}
        onChange={handleUploadConfirm}
      />
      <Dialog
        maxWidth="md"
        fullWidth
        onClose={handleDialog(false)}
        open={dialogOpen}
      >
        <DialogTitle>
          {t("License activation")}
        </DialogTitle>
        <DialogContent>
          <Typography>Input your license credentials to automatically fetch a certificate or upload it manually</Typography>
          <div style={{ marginTop: 16 }}>
            <TextField
              fullWidth
              label={t("Username")}
              value={username}
              onChange={handleInput("username")}
              className={classes.tf}
            />
            <TextField
              fullWidth
              label={t("Password")}
              value={password}
              onChange={handleInput("password")}
              type="password"
              className={classes.tf}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            size="small"
          >
            {t('Upload license')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            size="small"
          >
            {t('Submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  </>;
}

LicenseTab.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  license: PropTypes.object.isRequired,
  Domains: PropTypes.array.isRequired,
  counts: PropTypes.object.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  upload: PropTypes.func.isRequired,
  setSnackbar: PropTypes.func.isRequired,
  submitLicenseCreds: PropTypes.func.isRequired,
  getCreds: PropTypes.func.isRequired,
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
    fetchUsers: async (domainID) => 
      await dispatch(fetchPlainUsersData(domainID, { status: 0 }))
        .catch(error => Promise.reject(error)),
    upload: async license => await dispatch(uploadLicenseData(license))
      .catch(err => Promise.reject(err)),
    submitLicenseCreds: async creds => await dispatch(submitLicenseCreds(creds))
      .catch(error => Promise.reject(error)),
    getCreds: async () => await dispatch(getLicenseCreds())
      .catch(error => Promise.reject(error)),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(withTranslation()(LicenseTab), styles));
