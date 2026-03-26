// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useRef, useState } from 'react';
import { Button, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid2, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, TextField, Theme, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { setDateTimeString } from '../../utils';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { fetchPlainUsersData } from '../../actions/users';
import { getLicenseCreds, submitLicenseCreds, uploadLicenseData } from '../../actions/license';
import { useNavigate } from 'react-router';
import { USER_STATUS } from '../../constants';
import { ChangeEvent } from '@/types/common';
import { useAppDispatch, useAppSelector } from '../../store';


const useStyles = makeStyles()((theme: Theme) => ({
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
}));


type LicenseTabProps = {
  counts: Record<string, number>;
  setSnackbar: (msg: string) => void;
}


const LicenseTab = (props: LicenseTabProps) => {
  const { counts, setSnackbar } = props;
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { license } = useAppSelector(state => state);
  const { Domains } = useAppSelector(state => state.domains);
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    domainsExpanded: false,
    domainUsers: {},
    dialogOpen: false,
    username: "",
    password: "",
  });
  const [expandedDomainIdxs, setExpandedDomainIdxs] = useState([]);
  const imageInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const creds = await dispatch(getLicenseCreds()).catch();
      if(creds?.username) {
        setState({ ...state, ...creds });
      }
    };

    fetchData();
  }, []);

  const handleExpansion = (ID: number, idx: number) => () => {
    const { domainUsers } = state;
    const copy = [...expandedDomainIdxs];
    if(copy.includes(idx)) {
      copy.splice(copy.findIndex(arrayIdx => arrayIdx === idx), 1);
    } else {
      if(!domainUsers[ID]) fetchUsers(ID);
      copy.push(idx);
    }
    setExpandedDomainIdxs(copy);
  }

  const toggleDomainExpansion = () => setState({ ...state, domainsExpanded: !state.domainsExpanded });

  const handleUpload = () => {
    imageInputRef.current.click();
  }

  const handleUploadConfirm = (event: ChangeEvent) => {
    const { setSnackbar } = props;
    dispatch(uploadLicenseData(event.target.files[0]))
      .then(() => setSnackbar("Success!"))
      .catch(setSnackbar);
  }

  const handleNavigation = (domainID: number) => () => {
    navigate(`/${domainID}/users`);
  }

  const fetchUsers = async domainID => {
    const { setSnackbar } = props;
    const users = await dispatch(fetchPlainUsersData(domainID, { status: USER_STATUS.NORMAL }))
      .catch(setSnackbar);
    setState({
      ...state, 
      domainUsers: {
        ...state.domainUsers,
        [domainID]: users.data,
      },
    });
  }

  const handleDialog = (dialogOpen: boolean) => () => setState({ ...state, dialogOpen });

  const handleInput = (field: keyof typeof state) => (e: ChangeEvent) =>
    setState({ ...state, [field]: e.target.value });

  const handleSubmit = () => {
    const { username, password } = state;
    dispatch(submitLicenseCreds({ username, password }))
      .then(() => setSnackbar("Success!"))
      .catch(setSnackbar);
  }

  const { domainsExpanded, domainUsers, dialogOpen, username, password } = state;
  
  return <>
    <Typography variant="caption" className={classes.subtitle}>
      {t("license_sub")}
    </Typography>
    <Paper className={classes.paper} elevation={1}>
      <Grid2 container alignItems="center">
        <Grid2 className={classes.gridItem}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDialog(true)}
            size="small"
          >
            {t(license?.certificate ?'Reactivate license' : 'Reactivate license')}
          </Button>
        </Grid2>
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
      </Grid2>
      <Grid2 container direction="column" className={classes.licenseContainer}>
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
              <Collapse in={expandedDomainIdxs.includes(idx)}>
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
      </Grid2>
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


export default LicenseTab;
