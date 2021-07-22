// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

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
  Button,
} from '@material-ui/core';
import { connect } from 'react-redux';
import TopBar from '../components/TopBar';
import { getStringAfterLastSlash } from '../utils';
import Feedback from '../components/Feedback';
import { editOrgData, fetchOrgsDetails } from '../actions/orgs';

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

class OrgDetails extends PureComponent {

  state = {
    org: {},
    unsaved: false,
  }

  async componentDidMount() {
    const { fetch } = this.props;
    const org = await fetch(getStringAfterLastSlash())
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    this.setState({
      org: org ? {
        ...org,
      } : {},
    });
  }

  handleInput = field => event => {
    this.setState({
      org: {
        ...this.state.org,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleEdit = () => {
    const { edit } = this.props;
    edit(this.state.org)
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  render() {
    const { classes, t } = this.props;
    const { org, snackbar } = this.state;
    const { name, description } = org;

    return (
      <div className={classes.root}>
        <TopBar title={t("Groups")}/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={1}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {t('editHeadline', { item: 'Organization' })}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("Name")}
                onChange={this.handleInput('name')}
                fullWidth 
                value={name || ''}
                autoFocus
                required
              />
              <TextField 
                className={classes.input} 
                label={t("Description")} 
                fullWidth
                onChange={this.handleInput('description')}
                value={description || ''}
                multiline
                rows={4}
                variant="outlined"
              />
            </FormControl>
            <Button
              variant="text"
              color="secondary"
              onClick={this.handleNavigation('orgs')}
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
      </div>
    );
  }
}

OrgDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async org => {
      await dispatch(editOrgData(org)).catch(message => Promise.reject(message));
    },
    fetch: async id => await dispatch(fetchOrgsDetails(id))
      .then(org => org)
      .catch(message => Promise.reject(message)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(OrgDetails)));
