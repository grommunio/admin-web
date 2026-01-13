// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent,Button,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Typography,
  ListItemIcon,
  IconButton,
  Tooltip,
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { deleteOrphanedUsers } from '../../actions/users';
import { red } from '@mui/material/colors';
import { AccountCircle, ContactMail, Delete, DeleteForever } from '@mui/icons-material';
import { USER_STATUS } from '../../constants';

const styles = {
  delete: {
    backgroundColor: red['500'],
    '&:hover': {
      backgroundColor: red['700'],
    },
  },
};

const CheckLdapDialog = props => {

  const handleDelete = deleteFiles => () => {
    const { deleteUsers, onSuccess, onError } = props;
    deleteUsers({ deleteFiles }).then(() => onSuccess && onSuccess()).catch(onError);
  }

  const handleSingleDelete = (userID, deleteFiles) => () => {
    const { deleteUsers, checkUsers, onError } = props;
    deleteUsers({ userID, deleteFiles })
      .then(checkUsers)
      .catch(onError);
  }

  const { classes, t, open, onClose, Orphaned } = props;

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
            <ListItem
              key={user.ID}
              secondaryAction={<div style={{ display: "flex" }}>
                <Tooltip title="Delete">
                  <IconButton onClick={handleSingleDelete(user.ID, false)}>
                    <Delete color='error' />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete with files">
                  <IconButton onClick={handleSingleDelete(user.ID, true)}>
                    <DeleteForever color='error' />
                  </IconButton>
                </Tooltip>
              </div>}
            >
              <ListItemIcon>
                {user.status === USER_STATUS.CONTACT ?
                  <ContactMail className={classes.icon} fontSize='small'/> :
                  <AccountCircle className={classes.icon} fontSize='small'/>
                }
              </ListItemIcon>
              <ListItemText
                primary={(`${user.displayname} <${user.status === USER_STATUS.CONTACT ? user.smtpaddress : user.username}>`)}
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
          onClick={handleDelete(true)}
          variant="contained"
          color="secondary"
          disabled={Orphaned.length === 0}
        >
          {t('Delete with files')}
        </Button>
        <Button
          className={classes.delete}
          onClick={handleDelete(false)}
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

CheckLdapDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool,
  Orphaned: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  deleteUsers: PropTypes.func.isRequired,
  checkUsers: PropTypes.func.isRequired,
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
  withTranslation()(withStyles(CheckLdapDialog, styles)));
