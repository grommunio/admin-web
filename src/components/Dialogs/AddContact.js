// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, TextField,
  Button, DialogActions, CircularProgress, Grid,
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import moment from 'moment';
import { addUserData } from '../../actions/users';
import { withRouter } from 'react-router';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  grid: {
    display: 'flex',
    margin: theme.spacing(1, 1, 1, 1),
    flex: 1,
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  gridItem: {
    display: 'flex',
  },
  propertyInput: {
    margin: theme.spacing(1, 1, 1, 1),
    flex: 1,
  },
  flexTextfield: {
    flex: 1,
    marginRight: 8,
  },
});

class AddContact extends PureComponent {

  state = {
    properties: {
      displayname: '',
    },
    loading: false,
  }

  handleCheckbox = field => event => this.setState({ [field]: event.target.checked });

  handleAdd = () => {
    const { domain, add, onError, onSuccess } = this.props;
    const { properties } = this.state;
    this.setState({ loading: true });
    add(domain.ID, {
      status: 5,
      properties: {
        ...properties,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
    })
      .then(() => {
        this.setState({
          properties: {
            displayname: '',
          },
          loading: false,
        });
        onSuccess();
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  handleAddAndEdit = () => {
    const { domain, history, add, onError } = this.props;
    const { properties } = this.state;

    this.setState({ loading: true });
    add(domain.ID, {
      status: 5,
      properties: {
        ...properties,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
    })
      .then(user => {
        history.push('/' + domain.ID + '/contacts/' + user.ID);
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  handlePropertyChange = field => event => {
    this.setState({
      properties: {
        ...this.state.properties,
        [field]: event.target.value,
      },
    });
  }

  render() {
    const { classes, t, open, onClose } = this.props;
    const { loading, properties } = this.state;
    const { smtpaddress, displayname, givenname, initials, surname, nickname } = properties;
    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="lg"
        fullWidth
        TransitionProps={{
          onEnter: this.handleEnter,
        }}
      >
        <DialogTitle>{t('addHeadline', { item: 'Contact' })}</DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item xs={12} className={classes.gridItem}>
              <TextField
                className={classes.propertyInput}
                fullWidth
                label={t("E-Mail Address")}
                value={smtpaddress || ''}
                onChange={this.handlePropertyChange('smtpaddress')}
              />
            </Grid>
            <Grid item xs={12} className={classes.gridItem}>
              <div className={classes.grid}>
                <TextField 
                  className={classes.flexTextfield}
                  label={t("First name")}
                  value={givenname || ''}
                  onChange={this.handlePropertyChange('givenname')}
                />
                <TextField 
                  //className={classes.flexTextfield}
                  label={t("Initials")}
                  value={initials || ''}
                  onChange={this.handlePropertyChange('initials')}
                />
              </div>
              <TextField 
                className={classes.propertyInput} 
                label={t("Surname")} 
                fullWidth 
                value={surname || ''}
                onChange={this.handlePropertyChange('surname')}
              />
            </Grid>
            <Grid item xs={12} className={classes.gridItem}>
              <TextField 
                className={classes.propertyInput}
                label={t("Display name")}
                fullWidth
                value={displayname || ''}
                onChange={this.handlePropertyChange('displayname')}
              />
              <TextField 
                className={classes.propertyInput} 
                label={t("Nickname")} 
                fullWidth 
                value={nickname || ''}
                onChange={this.handlePropertyChange('nickname')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            color="secondary"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleAddAndEdit}
            variant="contained"
            color="primary"
          >
            {loading ? <CircularProgress size={24}/> : t('Add and edit')}
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
          >
            {loading ? <CircularProgress size={24}/> : t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddContact.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};


const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, user) => 
      await dispatch(addUserData(domainID, user))
        .then(user => Promise.resolve(user))
        .catch(msg => Promise.reject(msg)),
  };
};

export default withRouter(connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddContact))));
