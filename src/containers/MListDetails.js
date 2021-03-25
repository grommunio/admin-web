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
  MenuItem,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { editMListData, fetchMListData } from '../actions/mlists';
import TopBar from '../components/TopBar';
import { getStringAfterLastSlash } from '../utils';
import Feedback from '../components/Feedback';
import { fetchClassesData } from '../actions/classes';

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

class MListDetails extends PureComponent {

  state = {
    mList: {},
    unsaved: false,
  }

  async componentDidMount() {
    const { domain, fetch, _classes, fetchClasses } = this.props;
    if(_classes.length === 0) fetchClasses(domain.ID)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    const mList = await fetch(domain.ID, getStringAfterLastSlash())
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    this.setState({
      mList: mList ? {
        ...mList,
        class: mList.class.ID,
      } : {},
    });
  }

  listTypes = [
    { ID: 0, name: "Normal" },
    { ID: 2, name: "Domain" },
    { ID: 3, name: "Group" },
  ]

  listPrivileges = [
    { ID: 0, name: "All" },
    { ID: 1, name: "Internal" },
    { ID: 2, name: "Domain" },
    { ID: 3, name: "Specific" },
    { ID: 4, name: "Outgoing" },
  ]

  handlePrivilegeChange = event => {
    const { mList } = this.state;
    const val = event.target.value;
    this.setState({
      mList: {
        ...mList,
        listPrivilege: val,
        specifieds: val === 3 ? mList.specifieds : '', /* Specifieds only available if privilege "specific" */
      },
    });
  }

  handleInput = field => event => {
    this.setState({
      mList: {
        ...this.state.mList,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleEdit = () => {
    const { edit, domain } = this.props;
    const { mList } = this.state;
    edit(domain.ID, {
      ...mList,
      /* Strip whitespaces and split on ',' */
      associations: Array.isArray(mList.associations) ? mList.associations :
        mList.associations ? mList.associations.replace(/\s/g, "").split(',') : undefined, 
      specifieds: Array.isArray(mList.specifieds) ? mList.specifieds :
        mList.specifieds ? mList.specifieds.replace(/\s/g, "").split(',') : undefined,
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
    const { classes, t, domain, _classes } = this.props;
    const { mList, snackbar } = this.state;
    const { listname, listType, listPrivilege, associations, specifieds, class: _class } = mList;

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
                {t('editHeadline', { item: 'Mail list' })}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("Mail list name")} 
                fullWidth 
                value={listname || ''}
                autoFocus
                required
                inputProps={{
                  disabled: true,
                }}
              />
              <TextField
                select
                className={classes.input}
                label={t("Type")}
                fullWidth
                value={listType || 0}
                inputProps={{
                  disabled: true,
                }}
              >
                {this.listTypes.map((status, key) => (
                  <MenuItem key={key} value={status.ID}>
                    {status.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                className={classes.input}
                label={t("Privilege")}
                fullWidth
                value={listPrivilege || 0}
                onChange={this.handlePrivilegeChange}
              >
                {this.listPrivileges.map((status, key) => (
                  <MenuItem key={key} value={status.ID}>
                    {status.name}
                  </MenuItem>
                ))}
              </TextField>
              {listType === 0 && <TextField 
                className={classes.input} 
                label={t("Recipients (separated by ',')")} 
                fullWidth 
                value={associations || ''}
                onChange={this.handleInput('associations')}
              />}
              {listPrivilege === 3 && <TextField 
                className={classes.input} 
                label={t("Senders (separated by ','")} 
                fullWidth 
                value={specifieds || ''}
                onChange={this.handleInput('specifieds')}
              />}
              {listType === 3 && <TextField 
                className={classes.input} 
                label={t("Group")} 
                fullWidth 
                value={_class || ''}
                onChange={this.handleInput('class')}
                select
              >
                {_classes.map(c =>
                  <MenuItem key={c.ID} value={c.ID}>
                    {c.classname}
                  </MenuItem>  
                )}
              </TextField>}
            </FormControl>
            <Button
              variant="text"
              color="secondary"
              onClick={this.handleNavigation(domain.ID + '/mailLists')}
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

MListDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  _classes: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchClasses: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  return {
    _classes: state._classes.Classes,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async (domainID, mlist) => {
      await dispatch(editMListData(domainID, mlist)).catch(message => Promise.reject(message));
    },
    fetch: async (domainID, id) => await dispatch(fetchMListData(domainID, id))
      .then(mlist => mlist)
      .catch(message => Promise.reject(message)),
    fetchClasses: async (domainID) => await dispatch(fetchClassesData(domainID, { sort: 'classname,asc' }, true))
      .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(MListDetails)));
