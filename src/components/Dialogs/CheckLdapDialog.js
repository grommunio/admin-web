// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent,Button,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { deleteOrphanedUsers } from '../../actions/users';
import { red } from '@mui/material/colors';

const styles = {
  delete: {
    backgroundColor: red['500'],
    '&:hover': {
      backgroundColor: red['700'],
    },
  },
};

class CheckLdapDialog extends PureComponent {

  handleDelete = deleteFiles => () => {
    const { deleteUsers, onClose, onError } = this.props;
    deleteUsers({ deleteFiles }).then(onClose).catch(onError);
  }

  render() {
    const { classes, t, open, onClose, Orphaned } = this.props;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('Orphaned users')}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          {Orphaned.length > 0 ? <List>
            {Orphaned.map(user => 
              <ListItem key={user.ID}>
                <ListItemText
                  primary={user.username}
                />
              </ListItem>  
            )}
          </List> : <Typography>{t("All LDAP users are valid")}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            color="secondary"
          >
            {t('Close')}
          </Button>
          <Button
            className={classes.delete}
            onClick={this.handleDelete(true)}
            variant="contained"
            color="secondary"
            disabled={Orphaned.length === 0}
          >
            {t('Delete with files')}
          </Button>
          <Button
            className={classes.delete}
            onClick={this.handleDelete(false)}
            variant="contained"
            color="secondary"
            disabled={Orphaned.length === 0}
          >
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

CheckLdapDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool,
  Orphaned: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  deleteUsers: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Orphaned: state.users.Orphaned,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    deleteUsers: async params => await dispatch(deleteOrphanedUsers(params))
      .catch(err => Promise.reject(err)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(CheckLdapDialog)));
