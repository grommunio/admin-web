// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Button, CircularProgress, Collapse, Dialog, DialogContent, DialogTitle, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Paper,
  TextField,
  Tooltip,
  Typography } from '@mui/material';
import { Trans, withTranslation } from 'react-i18next';
import { uploadLicenseData } from '../actions/license';
import { connect } from 'react-redux';
import TableViewContainer from '../components/TableViewContainer';
import { fetchDomainData } from '../actions/domains';
import { AddCircle, CopyAll, ExpandLess, ExpandMore } from '@mui/icons-material';
import { fetchPlainUsersData, fetchUserCount } from '../actions/users';
import moment from 'moment';
import { addItem, copyToClipboard, setDateTimeString } from '../utils';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
  },
  design: {
    margin: theme.spacing(3, 0),
    padding: theme.spacing(2),
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
  grid: {
    margin: theme.spacing(0, 1),
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
  about: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(0, 2),
  },
  input: {
    margin: theme.spacing(1),
  },
  flexBox: {
    display: 'flex',
  },
  imgPreview: {
    maxWidth: '100%',
  },
  imageGroup: {
    margin: theme.spacing(0, 0, 4, 0),
  },
  jsonPreview: {
    whiteSpace: 'pre',
  },
  pre: {
    display: 'inline',
    margin: theme.spacing(0, 0.5)
  },
  typography: {
    margin: theme.spacing(1, 0),
  },
});

class License extends PureComponent {

  state = {
    snackbar: '',
    domainsExpanded: false,
    expandedDomainIdxs: [],
    domainUsers: {},
    counts: {},
    customImages: [],
    configOpen: false,
    loading: true,
  }

  componentDidMount() {
    this.props.fetchDomains()
      .then(async () => {
        const { Domains, fetchCount, customImages } = this.props;
        const counts = {};
        // Get user count of domains
        Domains.forEach(async domain => counts[domain.domainname] = await fetchCount(domain.ID));
        this.setState({
          loading: false,
          counts,
          // Show custom images from config
          customImages: Object.entries(customImages).map(([hostname, images]) => ({ hostname, ...images})),
        });
      })
      .catch(snackbar => this.setState({ snackbar, loading: false }));
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

  handleNavigation = domainID => () => {
    this.props.history.push(`/${domainID}/users`);
  }

  toggleDomainExpansion = () => this.setState({ domainsExpanded: !this.state.domainsExpanded });

  handleAddImageGroup = () => this.setState({
    customImages: addItem(this.state.customImages, {}),
  });

  handleImgInput = (field, idx) => e => {
    const copy = [...this.state.customImages];
    copy[idx][field] = e.target.value;
    this.setState({ customImages: copy });
  }

  handleShowConfig = () => this.setState({ configOpen: true });

  handleConfigClose = () => this.setState({ configOpen: false });

  // Saves stringified config object to clipboard
  handleCopyToClipboard = () => {
    copyToClipboard('"customImages": ' + JSON.stringify(
      this.state.customImages.reduce((prevValue, currentValue) => ({
        ...prevValue,
        [currentValue.hostname]: {
          ...currentValue,
          hostname: undefined,
        },
      }), {}), null, 4)
    )
  }

  render() {
    const { classes, t, license, Domains } = this.props;
    const { snackbar, expandedDomainIdxs, domainUsers, domainsExpanded, counts, customImages, configOpen, loading } = this.state;

    return (
      <TableViewContainer
        headline={t("License")}
        subtitle={t('license_sub')}
        href="https://docs.grommunio.com/admin/administration.html#license"
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
        loading={loading}
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
        <div className={classes.about}>
          <Typography variant='h2' className={classes.licenseContainer}>
            {t("Design")}
          </Typography>
          <Typography variant="caption" className={classes.subtitle}>
            {t("design_sub")}
          </Typography>
          <Paper className={classes.design} elevation={1}>
            {customImages.map(({ hostname, logo, logoLight, icon, background, backgroundDark}, idx) =>
              <div className={classes.imageGroup} key={idx}>
                <TextField
                  label={t("Hostname")}
                  value={hostname || ''}
                  className={classes.input}
                  required
                  fullWidth
                  onChange={this.handleImgInput("hostname", idx)}
                />
                <div className={classes.flexBox}>
                  <Grid container direction="column" alignItems="center" className={classes.grid}>
                    <TextField
                      label={t("Logo")}
                      value={logo || ''}
                      className={classes.iconInput}
                      variant="standard"
                      onChange={this.handleImgInput("logo", idx)}
                      fullWidth
                    />
                    <img src={logo || ''} alt="" className={classes.imgPreview}/>
                  </Grid>
                  <Grid container direction="column"  alignItems="center" className={classes.grid}>
                    <TextField
                      label={t("Logo light")}
                      value={logoLight || ''}
                      className={classes.iconInput}
                      variant="standard"
                      onChange={this.handleImgInput("logoLight", idx)}
                      fullWidth
                    />
                    <img src={logoLight || ''} alt="" className={classes.imgPreview}/>
                  </Grid>
                  <Grid container direction="column"  alignItems="center" className={classes.grid}>
                    <TextField
                      label={t("Icon")}
                      value={icon || ''}
                      className={classes.iconInput}
                      variant="standard"
                      onChange={this.handleImgInput("icon", idx)}
                      fullWidth
                    />
                    <img src={icon || ''} alt="" className={classes.imgPreview}/>
                  </Grid>
                  <Grid container direction="column" alignItems="center" className={classes.grid}>
                    <TextField
                      label={t("Background")}
                      value={background || ''}
                      className={classes.iconInput}
                      variant="standard"
                      onChange={this.handleImgInput("background", idx)}
                      fullWidth
                    />
                    <img src={background || ''} alt="" className={classes.imgPreview}/>
                  </Grid>
                  <Grid container direction="column" alignItems="center" className={classes.grid}>
                    <TextField
                      label={t("Background dark")}
                      value={backgroundDark || ''}
                      className={classes.iconInput}
                      variant="standard"
                      onChange={this.handleImgInput("backgroundDark", idx)}
                      fullWidth
                    />
                    <img src={backgroundDark || ''} alt="" className={classes.imgPreview}/>
                  </Grid>
                </div>
              </div>
            )}
            <div className={classes.progressContainer}>
              <Tooltip title={t("Add new set of icons for explicit hostname")}>
                <IconButton onClick={this.handleAddImageGroup}>
                  <AddCircle color="primary"/>
                </IconButton>
              </Tooltip>
            </div>
            <Grid container>
              <Button variant='contained' onClick={this.handleShowConfig}>
                {t("Show config")}
              </Button>
            </Grid>
          </Paper>
          <Dialog
            maxWidth="lg"
            fullWidth
            onClose={this.handleConfigClose}
            open={configOpen}
          >
            <DialogTitle>
              {t("Serverconfig")}
              <Tooltip placement="top" title={t('Copy config')}>
                <IconButton onClick={this.handleCopyToClipboard} size="large">
                  <CopyAll />
                </IconButton>
              </Tooltip>
            </DialogTitle>
            <DialogContent>
              <pre>
                <code className={classes.jsonPreview}>
                  &quot;customImages&quot;: {JSON.stringify(customImages.reduce((prevValue, currentValue) => ({
                    ...prevValue,
                    [currentValue.hostname]: {
                      ...currentValue,
                      hostname: undefined,
                    },
                  }), {}), null, 4)}
                </code>
              </pre>
              <Typography className={classes.typography}>
                <Trans i18nKey="configInstructions1">
                  Copy these lines into
                  <pre className={classes.pre}>
                    /etc/grommunio-admin-common/config.json
                  </pre>
                </Trans>.
                <Trans i18nKey="configInstructions2">
                  Be careful not to duplicate the
                  <pre className={classes.pre}>&quot;customImages&quot;</pre> key
                </Trans>.
              </Typography>
            </DialogContent>
          </Dialog>
        </div>
        <div className={classes.about}>
          <Typography variant='h2' className={classes.licenseContainer}>About</Typography>
          <Typography variant="caption">
            grommunio is Copyright © 2020-{moment().year()}. All rights reserved.
          </Typography>
          <Typography variant="caption">
            grommunio is licensed under the GNU Affero General Public License v3.
          </Typography>
          <Typography variant="caption">
            This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
          </Typography>
          <Typography variant="caption">
            This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
          </Typography>
          <Typography variant="caption">
            You should have received a copy of the GNU Affero General Public License along with this program. If not, see <a href="https://www.gnu.org/licenses/">https://www.gnu.org/licenses/</a>.
          </Typography>
        </div>
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
  fetchCount: PropTypes.func.isRequired,
  Domains: PropTypes.array.isRequired,
  customImages: PropTypes.object,
};

const mapStateToProps = state => {
  const { license, domains, config } = state;
  return {
    license: license.License,
    Domains: domains.Domains,
    customImages: config.customImages,
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

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(License)));
