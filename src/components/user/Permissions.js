// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React, { PureComponent, Fragment } from 'react';
import { Divider, FormControl, Grid, IconButton, List, ListItem, ListItemText,
  Typography } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { deletePermittedUserData, fetchPermittedUsers } from '../../actions/users';
import { withRouter } from 'react-router';
import Feedback from '../Feedback';
import Delete from '@mui/icons-material/Delete';
import { AddCircleOutline } from '@mui/icons-material';
import AddPermittedUser from '../Dialogs/AddPermittedUser';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1, 1, 1, 1),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  buttonGrid: {
    margin: theme.spacing(1, 0, 0, 1),
  },
});

class Permissions extends PureComponent {

  state = {
    permittedUsers: [],
    snackbar: '',
    adding: false,
  };

  async componentDidMount() {
    const { fetch, userID, domainID } = this.props;
    const permittedUsers = await fetch(domainID, userID)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    if(permittedUsers) this.setState({ permittedUsers: permittedUsers.data });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleRemoveUser = (id, idx) => () => {
    const { deletePermittedUser, domainID, userID } = this.props;
    const copy = [...this.state.permittedUsers];
    copy.splice(idx, 1);
    deletePermittedUser(domainID, userID, id)
      .then(() => this.setState({
        permittedUsers: copy,
        snackbar: 'Success!',
      }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleAddDialog = adding => () => this.setState({ adding });

  handleAddSuccess = newUser => {
    const copy = [...this.state.permittedUsers];
    copy.push(newUser);
    this.setState({
      adding: false,
      snackbar: 'Success!',
      permittedUsers: copy,
    });
  }

  handleAddError = message => this.setState({ snackbar: message || 'Unknown error' });

  render() {
    const { classes, t, domainID, userID } = this.props;
    const { snackbar, adding, permittedUsers } = this.state;
    return (
      <FormControl className={classes.form}>
        <Grid container alignItems="center"  className={classes.headline}>
          <Typography variant="h6">{t('Permitted Users')}</Typography>
          <IconButton onClick={this.handleAddDialog(true)} size="large">
            <AddCircleOutline color="primary" fontSize="small"/>
          </IconButton>
        </Grid>
        <List>
          {(permittedUsers || []).map((user, key) => <Fragment key={key}>
            <ListItem className={classes.listItem}>
              <ListItemText primary={user.displayName} />
              <IconButton onClick={this.handleRemoveUser(user.ID, key)} size="large">
                <Delete color="error" />
              </IconButton>
            </ListItem>
            <Divider />
          </Fragment>)}
        </List>
        <Feedback
          snackbar={snackbar}
          onClose={() => this.setState({ snackbar: '' })}
        />
        <AddPermittedUser
          open={adding}
          domainID={domainID}
          userID={userID}
          onSuccess={this.handleAddSuccess}
          onError={this.handleAddError}
          onClose={this.handleAddDialog(false)}
        />
      </FormControl>
    );
  }
}

Permissions.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  Users: PropTypes.array.isRequired,
  domainID: PropTypes.number.isRequired,
  userID: PropTypes.number.isRequired,
  deletePermittedUser: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
};

const mapStateToProps = state => {
  return { Users: state.users.Users };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, userID) => await dispatch(fetchPermittedUsers(domainID, userID, {}))
      .catch(err => console.error(err)),
    deletePermittedUser: async (domainID, userID, id) => await dispatch(deletePermittedUserData(domainID, userID, id))
      .catch(err => console.error(err)),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Permissions))));
