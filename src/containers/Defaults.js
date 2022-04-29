// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
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
} from '@mui/material';
import { connect } from 'react-redux';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { editCreateParamsData, fetchCreateParamsData } from '../actions/defaults';
import { red, yellow } from '@mui/material/colors';

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
    marginBottom: theme.spacing(3),
  },
  subheader: {
    marginBottom: 8,
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
    margin: theme.spacing(1, 1, 1, 1),
    flex: 1,
  },
});

class Defaults extends PureComponent {

  state = {
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
    unsaved: false,
  }

  componentDidMount() {
    const { fetch } = this.props;
    fetch()
      .then(() => {
        const { createParams } = this.props;
        // Update mask
        this.setState(this.getStateOverwrite(createParams));
      })
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  getStateOverwrite(createParams) {
    if(!createParams) return {};
    const user = {
      ...createParams.user,
    };
    let sizeUnits = {
      storagequotalimit: 1,
      prohibitreceivequota: 1,
      prohibitsendquota: 1,
    };
    for(let quotaLimit in sizeUnits) {
      if(user[quotaLimit] === undefined) continue;
      user[quotaLimit] = user[quotaLimit] / 1024;
      for(let i = 2; i >= 0; i--) {
        if(user[quotaLimit] === 0) break;
        let r = user[quotaLimit] % 1024 ** i;
        if(r === 0) {
          sizeUnits[quotaLimit] = i + 1;
          user[quotaLimit] = user[quotaLimit] / 1024 ** i;
          break;
        }
      }
      user[quotaLimit] = Math.ceil(user[quotaLimit]);
    }
    return {
      sizeUnits,
      createParams: {
        ...user,
        ...createParams.domain,
      },
    };
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

  handleEdit = () => {
    const { edit } = this.props;
    const { createParams, sizeUnits } = this.state;
    const { maxUser, storagequotalimit, prohibitreceivequota, prohibitsendquota } = createParams;

    const quotas = {
      storagequotalimit: storagequotalimit * 2 ** (10 * sizeUnits.storagequotalimit) || undefined,
      prohibitreceivequota: prohibitreceivequota * 2
        ** (10 * sizeUnits.prohibitreceivequota) || undefined,
      prohibitsendquota: prohibitsendquota * 2 ** (10 * sizeUnits.prohibitsendquota) || undefined,
    };
    edit({
      //TODO: Format properly
      domain: {
        maxUser: parseInt(maxUser) || '',
      },
      user: {
        ...quotas,
      },
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleUnitChange = unit => event => this.setState({
    sizeUnits: {
      ...this.state.sizeUnits,
      [unit]: event.target.value,
    },
  });

  render() {
    const { classes, t } = this.props;
    const { createParams, sizeUnits, snackbar } = this.state;
    const { maxUser, prohibitsendquota, prohibitreceivequota, storagequotalimit } = createParams;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);

    return (
      <ViewWrapper
        topbarTitle={t('Defaults')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container>
            <Typography
              color="primary"
              variant="h5"
            >
              {t('editHeadline', { item: 'Defaults' })}
            </Typography>
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
              className={classes.input} 
              label={t("Max users")}
              onChange={this.handleInput('maxUser')}
              fullWidth 
              value={maxUser || ''}
              autoFocus
            />
            <Typography
              color="primary"
              variant="h6"
              className={classes.subheader}
            >
              {t('User create parameters')}
            </Typography>
            <Grid container style={{ marginTop: 8 }}>
              <TextField 
                className={classes.flexInput}
                label={
                  <div className={classes.labelContainer}>
                    {t("Receive quota limit")}
                    <div style={{ width: 6, height: 6, backgroundColor: red['500'], marginLeft: 4 }}></div>
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
              <TextField 
                className={classes.flexInput}
                label={
                  <div className={classes.labelContainer}>
                    {t("Send quota limit")}
                    <div style={{ width: 6, height: 6, backgroundColor: yellow['500'], marginLeft: 4 }}></div>
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
            </Grid>
          </FormControl>
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
      </ViewWrapper>
    );
  }
}

Defaults.contextType = CapabilityContext;
Defaults.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  createParams: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Defaults)));
