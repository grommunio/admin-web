// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  Button,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
} from '@mui/material';
import { connect } from 'react-redux';
import { getStoreLangs } from '../actions/users';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { editCreateParamsData, fetchCreateParamsData } from '../actions/defaults';
import { red, yellow } from '@mui/material/colors';
import { formatCreateParams } from '../utils';
import { HelpOutline } from '@mui/icons-material';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(0, 0, 3, 0),
  },
  subheader: {
    marginBottom: 16,
  },
  select: {
    minWidth: 60,
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  adornment: {
    display: 'contents',
  },
  buttonGrid: {
    margin: theme.spacing(2, 0, 0, 0),
  },
  flexInput: {
    margin: theme.spacing(1, 2, 1, 0),
    flex: 1,
  },
  checkboxes: {
    margin: theme.spacing(1, 0, 0, 0),
  },
});

const Defaults = props => {
  const [state, setState] = useState({
    createParams: {
      maxUser: '',
      prohibitsendquota: '',
      prohibitreceivequota: '',
      storagequotalimit: '',
    },
    sizeUnits: {
      storagequotalimit: 1,
      prohibitreceivequota: 1,
      prohibitsendquota: 1,
    },
    loading: true,
  });
  const [langs, setLangs] = useState([]);
  const context = useContext(CapabilityContext);

  useEffect(() => {
    const inner = async () => {
      const { fetch, storeLangs } = props;
      const langs = await storeLangs()
        .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
      if(langs) setLangs(langs);
      
      fetch()
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error', loading: false }));
    };

    inner();
  }, []);

  useEffect(() => {
    const { createParams } = props;
    // Update mask
    setState({ ...state, ...formatCreateParams(structuredClone(createParams)), loading: false });
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

  const handleEdit = () => {
    const { edit } = props;
    const { createParams, sizeUnits } = state;
    // eslint-disable-next-line camelcase
    const { maxUser, smtp, changePassword, pop3_imap, lang,
      privChat, privVideo, privFiles, privArchive,
      storagequotalimit, prohibitreceivequota, prohibitsendquota,
      chatUser, chatTeam } = createParams;

    // Convert quotas from selected size unit to KiB
    const quotas = {
      storagequotalimit: storagequotalimit * 2 ** (10 * sizeUnits.storagequotalimit) || undefined,
      prohibitreceivequota: prohibitreceivequota * 2
        ** (10 * sizeUnits.prohibitreceivequota) || undefined,
      prohibitsendquota: prohibitsendquota * 2 ** (10 * sizeUnits.prohibitsendquota) || undefined,
    };
    edit({
      domain: {
        maxUser: parseInt(maxUser) || undefined,
        chat: chatTeam,
      },
      user: {
        properties: {
          ...quotas,
        },
        // eslint-disable-next-line camelcase
        smtp, changePassword, lang, pop3_imap,
        privChat, privVideo, privFiles, privArchive,
        chat: chatUser,
      },
    })
      .then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const handleUnitChange = unit => event => setState({
    ...state, 
    sizeUnits: {
      ...state.sizeUnits,
      [unit]: event.target.value,
    },
  });

  const handleCheckbox = field => e => setState({
    ...state, 
    createParams: {
      ...state.createParams,
      [field]: e.target.checked,
    },
  });

  const { classes, t } = props;
  const { createParams, sizeUnits, snackbar, loading } = state;
  const { maxUser, prohibitsendquota, prohibitreceivequota, storagequotalimit,
    lang, privChat, privArchive, privFiles, privVideo,
    // eslint-disable-next-line camelcase
    smtp, changePassword, pop3_imap, chatTeam, chatUser } = createParams;
  const writable = context.includes(SYSTEM_ADMIN_WRITE);

  return (
    <ViewWrapper
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
      loading={loading}
    >
      <Paper className={classes.paper} elevation={1}>
        <Grid container>
          <Typography
            color="primary"
            variant="h5"
          >
            {t('editHeadline', { item: 'Defaults' })}
          </Typography>
          <IconButton
            size="small"
            href="https://docs.grommunio.com/admin/administration.html#defaults"
            target="_blank"
          >
            <HelpOutline fontSize="small"/>
          </IconButton>
        </Grid>
        <FormControl className={classes.form}>
          <Typography
            color="primary"
            variant="h6"
            className={classes.subheader}
          >
            {t('Domain create parameters')}
          </Typography>
          <TextField 
            style={{ marginBottom: 16 }}
            label={t("Max users")}
            onChange={handleInput('maxUser')}
            fullWidth 
            value={maxUser || ''}
            autoFocus
          />
          <Grid container className={classes.input}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={chatTeam || false }
                  onChange={handleCheckbox('chatTeam')}
                  color="primary"
                />
              }
              label={t('Create chat team')}
            />
          </Grid>
          <Typography
            color="primary"
            variant="h6"
            className={classes.subheader}
          >
            {t('User create parameters')}
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
          <Grid container style={{ marginTop: 8 }}>
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
          <Grid container className={classes.checkboxes}>
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
                />
              }
              label={t('Allow POP3/IMAP logins')}
            />
          </Grid>
          <Grid container className={classes.checkboxes}>
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
          <Grid container className={classes.checkboxes}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={chatUser || false }
                  onChange={handleCheckbox('chatUser')}
                  color="primary"
                />
              }
              label={t('Create chat user')}
            />
          </Grid>
        </FormControl>
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
    </ViewWrapper>
  );
}

Defaults.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  createParams: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  storeLangs: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    createParams: state.defaults.CreateParams,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async createParams => await dispatch(editCreateParamsData(createParams))
      .catch(message => Promise.reject(message)),
    fetch: async () => await dispatch(fetchCreateParamsData())
      .catch(message => Promise.reject(message)),
    storeLangs: async () => await dispatch(getStoreLangs()).catch(msg => Promise.reject(msg)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Defaults)));
