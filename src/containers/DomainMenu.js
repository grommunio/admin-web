// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { Paper, Typography, Grid, Button, FormControl, TextField, FormControlLabel,
  Checkbox, Select, MenuItem, Divider, Tooltip } from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import DeleteDomain from '../components/Dialogs/DeleteDomain';
import { deleteDomainData, fetchDnsCheckData } from '../actions/domains';
import { DOMAIN_ADMIN_WRITE, ORG_ADMIN } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import { CapabilityContext } from '../CapabilityContext';
import { editCreateParamsData, fetchCreateParamsData } from '../actions/defaults';
import { red, yellow } from '@mui/material/colors';
import { getStoreLangs } from '../actions/users';
import { formatCreateParams } from '../utils';
import DnsHealth from '../components/DnsHealth';
import DNSLegend from '../components/DNSLegend';
import { HelpOutlineOutlined } from '@mui/icons-material';
import { fetchDrawerDomain } from '../actions/drawer';
import { useNavigate } from 'react-router';


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
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
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
    padding: theme.spacing(2),
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
  },
  defaultsContainer: {
    padding: theme.spacing(0, 2),
  },
  input: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  subheader: {
    marginBottom: theme.spacing(2),
  },
  select: {
    minWidth: 60,
  },
  flexInput: {
    margin: theme.spacing(1, 2, 1, 0),
    flex: 1,
  },
  checkboxes: {
    margin: theme.spacing(0, 0, 2, 1),
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  adornment: {
    display: 'contents',
  },
  flexRow: {
    display: 'flex',
    alignItems: 'center',
  },
  buttonGrid: {
    margin: theme.spacing(2, 0, 0, 0),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
});

const DomainMenu = props => {
  const [state, setState] = useState({
    deleting: false,
    sizeUnits: {
      storagequotalimit: 1,
      prohibitreceivequota: 1,
      prohibitsendquota: 1,
    },
    createParams: {},
    dnsCheck: {}, // TODO: Think about moving this into the store
    dnsLoading: true,
  });
  const [langs, setLangs] = useState([]);
  const [snackbar, setSnackbar] = useState("");
  const [loading, setLoading] = useState(true);
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  useEffect(() => {
    const inner = async () => {
      const { domain, fetch, fetchParams, storeLangs } = props;
      fetch(domain.ID).catch(msg => setSnackbar(msg || 'Unknown error'));
      fetchParams(null, { domain: domain.ID })
        .then(() => setLoading(false))
        .catch(message => {
          setState(message || 'Unknown error');
          setLoading(false);
        });
      const langs = await storeLangs()
        .catch(msg => setSnackbar(msg || 'Unknown error'));
      if(langs) setLangs(langs);
    };

    inner();
  }, []);

  useEffect(() => {
    const { createParams } = props;
    // Update mask
    setState({ ...state, ...formatCreateParams(structuredClone(createParams)) });
  }, [props.createParams]);

  const handleInput = field => event => {
    setState({
      ...state, 
      createParams: {
        ...state.createParams,
        [field]: event.target.value,
      },
    });
  }

  const handleUnitChange = unit => event => setState({
    ...state, 
    sizeUnits: {
      ...state.sizeUnits,
      [unit]: event.target.value,
    },
  });

  const handleCheckbox = field => e => {
    const checked = e.target.checked;
    if(field === "privArchive") {
      setState({
        ...state, 
        createParams: {
          ...state.createParams,
          // If archive is allowed, pop3 must be enabled
          "pop3_imap": checked || pop3_imap,
          [field]: checked,
        },
      });
    } else {
      setState({
        ...state, 
        createParams: {
          ...state.createParams,
          [field]: checked,
        },
      });
    }
  }
    

  const handleNav = () => {
    const { domain } = props;
    navigate('/domains/' + domain.ID);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    setState({ ...state, deleting: true });
  };

  const handleDeleteClose = () => setState({ ...state, deleting: false });

  const handleDeleteError = (error) => setSnackbar(error);

  const handleDeleteSuccess = () => {
    navigate('/');
  };

  const handleEdit = () => {
    const { edit, domain } = props;
    const { createParams, sizeUnits } = state;
    // eslint-disable-next-line camelcase
    const { smtp, changePassword, pop3_imap, lang,
      privChat, privVideo, privFiles, privArchive,
      storagequotalimit, prohibitreceivequota, prohibitsendquota } = createParams;

    // Convert quotas from selected size unit to KiB
    const quotas = {
      storagequotalimit: storagequotalimit * 2 ** (10 * sizeUnits.storagequotalimit) || undefined,
      prohibitreceivequota: prohibitreceivequota * 2
        ** (10 * sizeUnits.prohibitreceivequota) || undefined,
      prohibitsendquota: prohibitsendquota * 2 ** (10 * sizeUnits.prohibitsendquota) || undefined,
    };
    edit({
      user: {
        properties: {
          ...quotas,
        },
        // eslint-disable-next-line camelcase
        smtp, changePassword, lang, pop3_imap,
        privChat, privVideo, privFiles, privArchive,
      },
    }, domain.ID)
      .then(() => setSnackbar('Success!'))
      .catch(message => setSnackbar(message || 'Unknown error'));
  }

  const { classes, domain, t, capabilities } = props;
  const { deleting, sizeUnits, createParams } = state;
  const { prohibitsendquota, prohibitreceivequota, storagequotalimit,
    lang, privChat, privArchive, privFiles, privVideo,
    // eslint-disable-next-line camelcase
    smtp, changePassword, pop3_imap } = createParams;
  const writable = context.includes(DOMAIN_ADMIN_WRITE);
  const editable = capabilities.includes(ORG_ADMIN);

  return (
    <TableViewContainer
      headline={t("Domain overview")}
      snackbar={snackbar}
      onSnackbarClose={() => setSnackbar('')}
      loading={loading}
    >
      <Paper className={classes.paper} elevation={1}>
        <Grid container direction="column" className={classes.container}>
          <Grid item className={classes.firstRow}>
            <div className={classes.flexRow}>
              <Typography variant='h6' className={classes.description}>{t('Domain name')}:</Typography>
              {domain.domainname}
            </div>
            {editable && <div className={classes.editButtonContainer}>
              <Button
                onClick={handleNav}
                variant="contained"
                color="primary"
                style={{ marginRight: 8 }}
              >
                {t('editHeadline', { item: 'domain' })}
              </Button>
              <Button
                onClick={handleDelete}
                variant="contained"
                color="secondary"
              >
                {t('Delete domain')}
              </Button>
            </div>}
          </Grid>
          <div className={classes.flexRow}>
            <Typography variant='h6' className={classes.description}>{t('Title')}:</Typography>
            {domain.title}
          </div>
          <div className={classes.flexRow}>
            <Typography variant='h6' className={classes.description}>{t('Address')}:</Typography>
            {domain.address}
          </div>
          <div className={classes.flexRow}>
            <Typography variant='h6' className={classes.description}>{t('Admin')}:</Typography>
            {domain.adminName}
          </div>
          <div className={classes.flexRow}>
            <Typography variant='h6' className={classes.description}>{t('Users')}:</Typography>
            {`${domain.activeUsers || 0} ${t("active")},
              ${domain.inactiveUsers || 0} ${t("inactive")},
              ${domain.virtualUsers || 0} ${t("virtual")},
              ${domain.maxUser} ${t("maximum")}`}
            <Tooltip
              placement='right'
              arrow
              title={<div>
                <Typography><b>{t("Active")}</b>: {t("Normal mailboxes")}</Typography>
                <Typography><b>{t("Inactive")}</b>: {t("Deactivated mailboxes")}</Typography>
                <Typography><b>{t("Virtual")}</b>: {t("Shared users, contacts, mailing lists / groups")}</Typography>
                <Typography><b>{t("Maximum")}</b>: {t("The maximum amount of mailboxes in this domain")}</Typography>
              </div>}
            >
              <HelpOutlineOutlined style={{ marginLeft: 4 }}/>
            </Tooltip>
          </div>
          <div className={classes.flexRow}>
            <Typography variant='h6' className={classes.description}>{t('Telephone')}:</Typography>
            {domain.tel}
          </div>
          <Divider className={classes.divider}/>
          <div>
            <Typography variant='h6'>{t('DNS Health')}</Typography>
            <DnsHealth domain={domain}/>
            <DNSLegend />
          </div>
          <Divider className={classes.divider}/>
        </Grid>
        <div className={classes.defaultsContainer}>
          <Typography
            color="primary"
            variant="h6"
            className={classes.subheader}
          >
            {t('Default user parameters')}
          </Typography>
          <TextField
            select
            className={classes.input}
            label={t("Language")}
            fullWidth
            value={lang || ''}
            onChange={handleInput('lang')}
          >
            {langs.map((l) => (
              <MenuItem key={l.code} value={l.code}>
                {l.code + ": " + l.name}
              </MenuItem>
            ))}
          </TextField>
          <Grid container className={classes.input}>
            <TextField 
              className={classes.flexInput}
              label={
                <div className={classes.labelContainer}>
                  {t("Send quota limit")}
                  <div style={{ width: 6, height: 6, backgroundColor: yellow['500'], marginLeft: 4 }}></div>
                </div>
              }
              value={prohibitsendquota !== undefined ? prohibitsendquota : ''}
              onChange={handleInput('prohibitsendquota')}
              InputProps={{
                endAdornment:
                      <FormControl className={classes.adornment}>
                        <Select
                          onChange={handleUnitChange('prohibitsendquota')}
                          value={sizeUnits.prohibitsendquota}
                          className={classes.select}
                          variant="standard"
                        >
                          <MenuItem value={1}>MB</MenuItem>
                          <MenuItem value={2}>GB</MenuItem>
                          <MenuItem value={3}>TB</MenuItem>
                        </Select>
                      </FormControl>,
              }}
            />
            <TextField 
              className={classes.flexInput}
              label={
                <div className={classes.labelContainer}>
                  {t("Receive quota limit")}
                  <div style={{ width: 6, height: 6, backgroundColor: red['500'], marginLeft: 4 }}></div>
                </div>
              }
              value={prohibitreceivequota !== undefined ? prohibitreceivequota : ''}
              onChange={handleInput('prohibitreceivequota')}
              InputProps={{
                endAdornment:
                      <FormControl className={classes.adornment}>
                        <Select
                          onChange={handleUnitChange('prohibitreceivequota')}
                          value={sizeUnits.prohibitreceivequota}
                          className={classes.select}
                          variant="standard"
                        >
                          <MenuItem value={1}>MB</MenuItem>
                          <MenuItem value={2}>GB</MenuItem>
                          <MenuItem value={3}>TB</MenuItem>
                        </Select>
                      </FormControl>,
              }}
            />
            <TextField 
              className={classes.flexInput}
              style={{ marginRight: 0 }}
              label={
                <div className={classes.labelContainer}>
                  {t("Storage quota limit")}
                  <div style={{ width: 6, height: 6, backgroundColor: '#ddd', marginLeft: 4 }}></div>
                </div>
              }
              value={storagequotalimit !== undefined ? storagequotalimit : ''}
              onChange={handleInput('storagequotalimit')}
              InputProps={{
                endAdornment:
                      <FormControl className={classes.adornment}>
                        <Select
                          onChange={handleUnitChange('storagequotalimit')}
                          value={sizeUnits.storagequotalimit}
                          className={classes.select}
                          variant="standard"
                        >
                          <MenuItem value={1}>MB</MenuItem>
                          <MenuItem value={2}>GB</MenuItem>
                          <MenuItem value={3}>TB</MenuItem>
                        </Select>
                      </FormControl>,
              }}
            />
          </Grid>
          <Grid container className={classes.input}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={smtp || false }
                  onChange={handleCheckbox('smtp')}
                  color="primary"
                />
              }
              label={t('Allow SMTP sending (used by POP3/IMAP clients)')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={changePassword || false }
                  onChange={handleCheckbox('changePassword')}
                  color="primary"
                />
              }
              label={t('Allow password changes')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={pop3_imap || false /*eslint-disable-line*/}
                  onChange={handleCheckbox('pop3_imap')}
                  color="primary"
                  disabled={privArchive}
                />
              }
              label={t('Allow POP3/IMAP logins')}
            />
          </Grid>
          <Grid container className={classes.input}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={privChat || false }
                  onChange={handleCheckbox('privChat')}
                  color="primary"
                />
              }
              label={t('Allow Chat')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={privVideo || false }
                  onChange={handleCheckbox('privVideo')}
                  color="primary"
                />
              }
              label={t('Allow Meet')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={privFiles || false }
                  onChange={handleCheckbox('privFiles')}
                  color="primary"
                />
              }
              label={t('Allow Files')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={privArchive || false }
                  onChange={handleCheckbox('privArchive')}
                  color="primary"
                />
              }
              label={t('Allow Archive')}
            />
          </Grid>
        </div>
        <Grid container className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEdit}
            disabled={!writable}
          >
            {t('Save')}
          </Button>
        </Grid>
      </Paper>
      <DeleteDomain
        open={deleting}
        delete={props.delete}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
        onClose={handleDeleteClose}
        item={domain.domainname}
        id={domain.ID}
      />
    </TableViewContainer>
  );
}

DomainMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object,
  capabilities: PropTypes.array,
  delete: PropTypes.func.isRequired,
  createParams: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchParams: PropTypes.func.isRequired,
  checkDns: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  storeLangs: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    capabilities: state.auth.capabilities,
    createParams: state.defaults.CreateParams,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    delete: async (id, params) => {
      await dispatch(deleteDomainData(id, params)).catch((error) =>
        Promise.reject(error)
      );
    },
    fetch: async domainID => await dispatch(fetchDrawerDomain(domainID))
      .catch(message => Promise.reject(message)),
    edit: async (createParams, domainID) => await dispatch(editCreateParamsData(createParams, domainID))
      .catch(message => Promise.reject(message)),
    fetchParams: async (domainID, params) => await dispatch(fetchCreateParamsData(domainID, params))
      .catch(message => Promise.reject(message)),
    storeLangs: async () => await dispatch(getStoreLangs()).catch(msg => Promise.reject(msg)),
    checkDns: async domainID => await dispatch(fetchDnsCheckData(domainID)).catch(msg => Promise.reject(msg)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(DomainMenu, styles)));
