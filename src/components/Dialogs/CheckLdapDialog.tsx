// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { makeStyles } from 'tss-react/mui';
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
import { useTranslation } from 'react-i18next';
import { red } from '@mui/material/colors';
import { AccountCircle, ContactMail, Delete, DeleteForever } from '@mui/icons-material';
import { USER_STATUS } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store';
import { deleteOrphanedUsers } from '../../actions/users';
import { OrphanedUser } from '@/types/users';


const useStyles = makeStyles()(() => ({
  delete: {
    backgroundColor: red['500'],
    '&:hover': {
      backgroundColor: red['700'],
    },
  },
}));

type CheckLdapDialogProps = {
  open: boolean;
  checkUsers: () => void;
  onClose: () => void;
  onSuccess: () => void;
  onError: (err: string) => void;
}

const CheckLdapDialog = (props: CheckLdapDialogProps) => {
  const dispatch = useAppDispatch();
  const { Orphaned } = useAppSelector(state => state.users);
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { open, onClose } = props;

  const handleDelete = (deleteFiles: boolean) => () => {
    const { onSuccess, onError } = props;
    dispatch(deleteOrphanedUsers({ deleteFiles }))
      .then(() => onSuccess && onSuccess()).catch(onError);
  }

  const handleSingleDelete = (userID: number, deleteFiles: boolean) => () => {
    const { checkUsers, onError } = props;
    dispatch(deleteOrphanedUsers({ userID, deleteFiles }))
      .then(checkUsers)
      .catch(onError);
  }

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
          {Orphaned.map((user: OrphanedUser) => 
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
                  <ContactMail fontSize='small'/> :
                  <AccountCircle fontSize='small'/>
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


export default CheckLdapDialog;
