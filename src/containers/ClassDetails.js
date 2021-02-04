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
  Button,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { editClassData, fetchClassDetails } from '../actions/classes';
import TopBar from '../components/TopBar';
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

class ClassDetails extends PureComponent {

  state = {
    _class: {},
    unsaved: false,
  }

  async componentDidMount() {
    const { domain, fetch } = this.props;
    const _class = await fetch(domain.ID, getStringAfterLastSlash())
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    this.setState({
      _class: _class || {},
    });
  }

  handleInput = field => event => {
    this.setState({
      _class: {
        ...this.state._class,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleEdit = () => {
    const { _class } = this.state;
    this.props.edit({
      ..._class,
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  render() {
    const { classes, t, domain } = this.props;
    const { _class, snackbar } = this.state;
    const { name } = _class;

    return (
      <div className={classes.root}>
        <TopBar title={t("Classes")}/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={1}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {t('editHeadline', { item: 'Class' })}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <TextField
                label={t("Class")} 
                className={classes.input} 
                value={name || ''}
                onChange={this.handleInput('name')}
                autoFocus
              />
            </FormControl>
            <Button
              variant="text"
              color="secondary"
              onClick={this.handleNavigation(domain.ID + '/classes')}
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

ClassDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async (domainID, id) => {
      await dispatch(editClassData(domainID, id)).catch(message => Promise.reject(message));
    },
    fetch: async (domainID, id) => await dispatch(fetchClassDetails(domainID, id))
      .then(_class => _class)
      .catch(message => Promise.reject(message)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(ClassDetails)));
