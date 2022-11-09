// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { Paper, Typography, Grid, Button, FormControl, TextField, FormControlLabel,
  Checkbox, Select, MenuItem } from '@mui/material';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import DeleteDomain from '../components/Dialogs/DeleteDomain';
import { PureComponent } from 'react';
import { deleteDomainData } from '../actions/domains';
import { DOMAIN_ADMIN_WRITE, ORG_ADMIN } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import { CapabilityContext } from '../CapabilityContext';
import { editCreateParamsData, fetchCreateParamsData } from '../actions/defaults';
import { red, yellow } from '@mui/material/colors';
import { getStoreLangs } from '../actions/users';
import { formatCreateParams } from '../utils';

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
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
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
});

class DomainMenu extends PureComponent {

  state = {
    deleting: false,
    sizeUnits: {
      storagequotalimit: 1,
      prohibitreceivequota: 1,
      prohibitsendquota: 1,
    },
    createParams: {},
    langs: [],
    snackbar: '',
    loading: true,
  }

  async componentDidMount() {
    const { domain, fetch, storeLangs } = this.props;
    fetch(null, { domain: domain.ID })
      .then(() => {
        const { createParams } = this.props;
        // Update mask
        this.setState({ ...formatCreateParams(createParams), loading: false });
      })
      .catch(message => this.setState({ snackbar: message || 'Unknown error', loading: false }));
    const langs = await storeLangs()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    if(langs) this.setState({ langs });
  }

  handleInput = field => event => {
    this.setState({
      createParams: {
        ...this.state.createParams,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleUnitChange = unit => event => this.setState({
    sizeUnits: {
      ...this.state.sizeUnits,
      [unit]: event.target.value,
    },
  });

  handleCheckbox = field => e => this.setState({
    createParams: {
      ...this.state.createParams,
      [field]: e.target.checked,
    },
  });

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
    const { history } = this.props;
    history.push('/');
  };

  handleEdit = () => {
    const { edit, domain } = this.props;
    const { createParams, sizeUnits } = this.state;
    // eslint-disable-next-line camelcase
    const { smtp, changePassword, pop3_imap, lang,
      privChat, privVideo, privFiles, privArchive,
      storagequotalimit, prohibitreceivequota, prohibitsendquota } = createParams;

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
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  render() {
    const { classes, domain, t, capabilities } = this.props;
    const { snackbar, deleting, sizeUnits, langs, createParams, loading } = this.state;
    const { prohibitsendquota, prohibitreceivequota, storagequotalimit,
      lang, privChat, privArchive, privFiles, privVideo,
      // eslint-disable-next-line camelcase
      smtp, changePassword, pop3_imap } = createParams;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const editable = capabilities.includes(ORG_ADMIN);

    return (
      <TableViewContainer
        headline={t("Domain overview")}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
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
              {`${domain.activeUsers} active, ${domain.inactiveUsers} inactive, ${domain.maxUser} maximum`}
            </div>
            <div className={classes.flexRow}>
              <Typography variant='h6' className={classes.description}>{t('Telephone')}:</Typography>
              {domain.tel}
            </div>
          </Grid>
          <div className={classes.defaultsContainer}>
            <FormControl className={classes.form}>
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
                onChange={this.handleInput('lang')}
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
                  onChange={this.handleInput('prohibitsendquota')}
                  InputProps={{
                    endAdornment:
                      <FormControl className={classes.adornment}>
                        <Select
                          onChange={this.handleUnitChange('prohibitsendquota')}
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
                  onChange={this.handleInput('prohibitreceivequota')}
                  InputProps={{
                    endAdornment:
                      <FormControl className={classes.adornment}>
                        <Select
                          onChange={this.handleUnitChange('prohibitreceivequota')}
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
                  onChange={this.handleInput('storagequotalimit')}
                  InputProps={{
                    endAdornment:
                      <FormControl className={classes.adornment}>
                        <Select
                          onChange={this.handleUnitChange('storagequotalimit')}
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
                      onChange={this.handleCheckbox('smtp')}
                      color="primary"
                    />
                  }
                  label={t('Allow SMTP sending (used by POP3/IMAP clients)')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={changePassword || false }
                      onChange={this.handleCheckbox('changePassword')}
                      color="primary"
                    />
                  }
                  label={t('Allow password changes')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                  checked={pop3_imap || false /*eslint-disable-line*/}
                      onChange={this.handleCheckbox('pop3_imap')}
                      color="primary"
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
                      onChange={this.handleCheckbox('privChat')}
                      color="primary"
                    />
                  }
                  label={t('Allow Chat')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={privVideo || false }
                      onChange={this.handleCheckbox('privVideo')}
                      color="primary"
                    />
                  }
                  label={t('Allow Meet')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={privFiles || false }
                      onChange={this.handleCheckbox('privFiles')}
                      color="primary"
                    />
                  }
                  label={t('Allow Files')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={privArchive || false }
                      onChange={this.handleCheckbox('privArchive')}
                      color="primary"
                    />
                  }
                  label={t('Allow Archive')}
                />
              </Grid>
            </FormControl>
          </div>
          <Grid container className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleEdit}
              disabled={!writable}
            >
              {t('Save')}
            </Button>
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


DomainMenu.contextType = CapabilityContext;
DomainMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object,
  capabilities: PropTypes.array,
  delete: PropTypes.func.isRequired,
  createParams: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
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
    edit: async (createParams, domainID) => await dispatch(editCreateParamsData(createParams, domainID))
      .catch(message => Promise.reject(message)),
    fetch: async (domainID, params) => await dispatch(fetchCreateParamsData(domainID, params))
      .catch(message => Promise.reject(message)),
    storeLangs: async () => await dispatch(getStoreLangs()).catch(msg => Promise.reject(msg)),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DomainMenu))));
