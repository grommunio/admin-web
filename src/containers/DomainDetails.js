// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { editDomainData, fetchDomainDetails } from '../actions/domains';
import TopBar from '../components/TopBar';
import { changeDomainPassword } from '../api';
import { getStringAfterLastSlash } from '../utils';
import Feedback from '../components/Feedback';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    padding: theme.spacing(2, 2),
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    overflowY: 'scroll',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  select: {
    minWidth: 60,
  },
});

class DomainListDetails extends PureComponent {

  state = {
    domain: {},
    changingPw: false,
    newPw: '',
    checkPw: '',
  }

  statuses = [
    { name: 'Normal', ID: 0 },
    { name: 'Suspended', ID: 1 },
  ]

  async componentDidMount() {
    const domain = await this.props.fetch(getStringAfterLastSlash());
    this.setState({
      domain,
    });
  }

  handleInput = field => event => {
    this.setState({
      domain: {
        ...this.state.domain,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleCheckbox = field => event => this.setState({
    domain: {
      ...this.state.domain,
      [field]: event.target.checked,
    },
    unsaved: true,
  });

  handleNumberInput = field => event => {
    let input = event.target.value;
    if(input && input.match("^\\d*?$")) input = parseInt(input);
    this.setState({
      domain: {
        ...this.state.domain,
        [field]: input,
      },
    });
  }

  handleEdit = () => {
    const { domain } = this.state;
    this.props.edit({
      ...domain,
      domainname: undefined,
      createDay: undefined,
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handlePasswordChange = async () => {
    const { domain, newPw } = this.state;
    await changeDomainPassword(domain.ID, newPw);
    this.setState({ changingPw: false });
  }

  handleKeyPress = event => {
    const { newPw, checkPw } = this.state;
    if(event.key === 'Enter' && newPw === checkPw) this.handlePasswordChange();
  }

  render() {
    const { classes, t } = this.props;
    const { checkPw, newPw, changingPw, snackbar } = this.state;
    const { domainname, domainStatus,
      maxUser, title, address, adminName, tel } = this.state.domain;

    return (
      <div className={classes.root}>
        <TopBar title={t("Domain list")}/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={1}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {t('editHeadline', { item: 'Domain' })}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <Grid container className={classes.input}>
                <TextField
                  label={t("Domain")} 
                  style={{ flex: 1, marginRight: 8 }} 
                  value={domainname || ''}
                  onChange={this.handleInput('domainname')}
                  autoFocus
                  disabled
                />
                <Button
                  variant="contained"
                  onClick={() => this.setState({ changingPw: true })}
                  size="small"
                >
                  {t('Change password')}
                </Button>
              </Grid>
              <TextField
                select
                className={classes.input}
                label={t("Status")}
                fullWidth
                value={domainStatus || 0}
                onChange={this.handleInput('domainStatus')}
              >
                {this.statuses.map((status, key) => (
                  <MenuItem key={key} value={status.ID}>
                    {status.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField 
                className={classes.input} 
                label={t("Maximum users")} 
                fullWidth 
                value={maxUser || ''}
                onChange={this.handleNumberInput('maxUser')}
              />
              <TextField 
                className={classes.input} 
                label={t("Title")} 
                fullWidth 
                value={title || ''}
                onChange={this.handleInput('title')}
              />
              <TextField 
                className={classes.input} 
                label={t("Address")} 
                fullWidth 
                value={address || ''}
                onChange={this.handleInput('address')}
              />
              <TextField 
                className={classes.input} 
                label={t("Administrator")} 
                fullWidth 
                value={adminName || ''}
                onChange={this.handleInput('adminName')}
              />
              <TextField 
                className={classes.input} 
                label={t("Telephone")} 
                fullWidth 
                value={tel || ''}
                onChange={this.handleInput('tel')}
              />
            </FormControl>
            <Button
              variant="text"
              color="secondary"
              onClick={() => this.props.history.push('/domainList')}
              style={{ marginRight: 8 }}
            >
              {t('Back')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleEdit}
            >
              {t('Save')}
            </Button>
          </Paper>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: '' })}
          />
        </div>
        <Dialog open={!!changingPw}>
          <DialogTitle>{t('Change password')}</DialogTitle>
          <DialogContent>
            <TextField 
              className={classes.input} 
              label={t("New password")} 
              fullWidth
              type="password"
              value={newPw}
              onChange={event => this.setState({ newPw: event.target.value })}
              autoFocus
              onKeyPress={this.handleKeyPress}
            />
            <TextField 
              className={classes.input} 
              label={t("Repeat new password")} 
              fullWidth
              type="password"
              value={checkPw}
              onChange={event => this.setState({ checkPw: event.target.value })}
              onKeyPress={this.handleKeyPress}
            />
          </DialogContent>
          <DialogActions>
            <Button color="secondary" onClick={() => this.setState({ changingPw: false })}>
              {t('Cancel')}
            </Button>
            <Button
              color="primary"
              onClick={this.handlePasswordChange}
              disabled={checkPw !== newPw}
            >
              {t('Save')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

DomainListDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async domain => {
      await dispatch(editDomainData(domain)).catch(message => Promise.reject(message));
    },
    fetch: async id => await dispatch(fetchDomainDetails(id))
      .then(domain => domain)
      .catch(message => Promise.reject(message)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DomainListDetails)));
