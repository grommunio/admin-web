// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

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
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { red } from '@mui/material/colors';
import { AccountCircle, ContactMail, Delete, DeleteForever, Error, Pending } from '@mui/icons-material';
import { useAppDispatch } from '../../store';
import { deleteOrphanedUsers } from '../../actions/users';
import { BaseUser, OrphanedUser, USER_STATUS } from '../../types/users';
import { useState } from 'react';
import { BaseDomain } from '@/types/domains';


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
  checkAction: () => Promise<{ orphaned: OrphanedUser[] }>;
  onClose: () => void;
  onError: (err: string) => void;
  domain: BaseDomain;
}

interface IDeleteState {
  pending: Record<number, number>;
  failed: Record<number, string>;
}

const CheckLdapDialog = (props: CheckLdapDialogProps) => {
  const { open, onClose, checkAction, onError, domain } = props;

  const dispatch = useAppDispatch();
  const { classes } = useStyles();
  const { t } = useTranslation();

  const [orphanedUser, setOrphanedUsers] = useState<OrphanedUser[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const [deleteStates, setDeleteStates] = useState<IDeleteState>({
    pending: {},
    failed: {},
  });

  const handleEnter = async () => {
    setFetchLoading(true);
    setDeleteStates({
      pending: {},
      failed: {},
    });
    const res = await checkAction()
      .catch(onError);
    if(res?.orphaned) {
      setOrphanedUsers(res.orphaned);
    }
    setFetchLoading(false);
  }

  const handleDelete = (deleteFiles: boolean) => () => {
    setDeleting(true);
    dispatch(deleteOrphanedUsers({ deleteFiles, domain: domain.ID }))
      .then(resp => {
        const { deleted, pending, failed } = resp;
        
        // Remove successfully deleted users from list
        const copy = [...orphanedUser]
          .filter(orphan => !(deleted || [])
            .find((deletedUser: BaseUser) => deletedUser.ID === orphan.ID));
        setOrphanedUsers(copy);

        // Set pending state
        const pendingStates: Record<number, number> = {};
        (pending || []).forEach((user: { ID: number, taskID: number }) => {
          pendingStates[user.ID] = user.taskID;
        });

        // Set error state
        const errorStates: Record<number, string> = {};
        (failed || []).forEach((user: { ID: number, message: string }) => {
          errorStates[user.ID] = user.message || "Unknown error";
        });

        setDeleteStates({
          pending: pendingStates,
          failed: errorStates,
        });
      }).catch((res) => {
        onError(res);
      })
      .finally(() => setDeleting(false));
  }

  const handleSingleDelete = (userID: number, deleteFiles: boolean) => () => {
    const { onError } = props;
    dispatch(deleteOrphanedUsers({ userID, deleteFiles, domain: domain.ID }))
      .then(resp => {
        // All arrays have length 0 or 1 and a combined length of 1
        const { deleted, pending, failed } = resp;
        
        if (deleted?.length === 1) {
          // Remove successfully deleted users from list
          const copy = [...orphanedUser]
            .filter(orphan => !(deleted || [])
              .find((deletedUser: BaseUser) => deletedUser.ID === orphan.ID));
          setOrphanedUsers(copy);
          return;
        }

        if (pending?.length === 1) {
          const copy = {...deleteStates.pending};
          copy[pending[0].ID] = pending[0].taskID;
          setDeleteStates({
            ...deleteStates,
            pending: copy,
          });
          return;
        }

        if (failed?.length === 1) {
          const copy = {...deleteStates.failed};
          copy[failed[0].ID] = failed[0].message || "Unknown error";
          setDeleteStates({
            ...deleteStates,
            failed: copy,
          });
          return;
        }

      })
      .catch(onError);
  }

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="md"
      fullWidth
      slotProps={{
        transition: {
          onEnter: handleEnter,
        }
      }}
    >
      <DialogTitle>{t('Orphaned users')}</DialogTitle>
      {!fetchLoading && <DialogContent style={{ minWidth: 400 }}>
        {orphanedUser.length > 0 ? <List>
          {orphanedUser.map((user: OrphanedUser) => 
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
                {deleteStates.failed[user.ID] ? <Tooltip title={deleteStates.failed[user.ID]}>
                  <Error color="error"/>
                </Tooltip> :
                  deleteStates.pending[user.ID] ? <Tooltip title={"Task ID " + deleteStates.pending[user.ID]}>
                    <Pending color='info'/>
                  </Tooltip> :
                    (user.status === USER_STATUS.CONTACT ?
                      <ContactMail /> :
                      <AccountCircle />)
                }
              </ListItemIcon>
              <ListItemText
                primary={<Tooltip title={deleteStates.failed[user.ID]}>
                  {(`${user.displayname} <${user.status === USER_STATUS.CONTACT ? user.smtpaddress : user.username}>`) as any}
                </Tooltip>
                }
              />
            </ListItem>  
          )}
        </List> : <Typography>{t("All LDAP users are valid")}</Typography>}
      </DialogContent>}
      {fetchLoading && <DialogContent>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      </DialogContent>}
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
          disabled={deleting}
        >
          {t('Close')}
        </Button>
        <Button
          className={classes.delete}
          onClick={handleDelete(true)}
          variant="contained"
          color="secondary"
          disabled={orphanedUser.length === 0 || deleting}
        >
          {deleting ? <CircularProgress size={24}/> : t('Delete with files')}
        </Button>
        <Button
          className={classes.delete}
          onClick={handleDelete(false)}
          variant="contained"
          color="secondary"
          disabled={orphanedUser.length === 0 || deleting}
        >
          {deleting ? <CircularProgress size={24}/> : t('Delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default CheckLdapDialog;
