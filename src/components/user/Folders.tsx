// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH
import React, { useState } from 'react';
import { useEffect } from 'react';
import { FormControl,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Theme, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useAppDispatch } from '../../store';
import { fetchUserFolder, fetchUserFolders, removeUserFolderPermissions } from '../../actions/users';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { Domain } from '@/types/domains';
import Feedback from '../Feedback';
import { AddCircle, Delete, Edit } from '@mui/icons-material';
import AddUserFolderMember from '../Dialogs/AddUserFolderMember';
import { UserFolderPermission } from '@/types/users';
import DeleteUserFolderPermissionDialog from '../Dialogs/DeleteUserFolderPermission';
import { useTranslation } from 'react-i18next';
import EditUserFolderMember from '../Dialogs/EditUserFolderMember';


const useStyles = makeStyles()((theme: Theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  flexRow: {
    display: 'flex',
    margin: theme.spacing(0, 0, 2, 0),
  },
  richTree: {
    padding: theme.spacing(1, 3, 1, 1),
  },
  treeItemLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  folderTypeIcon: {
    marginRight: 8,
  },
}));


type FoldersProps = {
  username: string;
  domain: Domain;
}

type Folder = {
  ID: number;
  name: string;
  parentID: number;
  subfolders: Folder[];
  container: string;
}


const Folders = ({ username, domain }: FoldersProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [snackbar, setSnackbar] = useState("");
  const [folder, setFolder] = useState<Folder | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [selectedFolderPermissions, setSelectedFolderPermissions] = useState<UserFolderPermission[]>([]);
  const [adding, setAdding] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<string>("");
  const [editing, setEditing] = useState<UserFolderPermission | null>(null);
  const userEmail = username + '@' + domain.domainname;

  useEffect(() => {
    if(username && domain) {
      (async () => {
        const folder = await dispatch(fetchUserFolders(userEmail))
          .catch((snackbar) => setSnackbar(snackbar));
        if (folder) {
          setFolder(folder);
          setExpandedFolders([folder.ID.toString()]);
        }
      })();
    }
  }, [username]);

  const handleFolderClicked = (clickedFolder: Folder) => async (e: any) => {
    const folderStringID = clickedFolder.ID.toString();
    setSelectedFolder(clickedFolder);

    const folderIdx = expandedFolders.findIndex(id => id === folderStringID);
    if(folderIdx === -1) {
      setExpandedFolders([...expandedFolders, folderStringID]);
    } else if((e.target.tagName === "svg" || e.target.tagName === "path") && clickedFolder?.ID !== folder?.ID) {
      setExpandedFolders(curr => {
        const c = [...curr];
        c.splice(folderIdx, 1);
        return c;
      });
    }

    if (clickedFolder.ID !== selectedFolder?.ID) {
      const folderData = await dispatch(fetchUserFolder(userEmail, clickedFolder.ID))
        .catch((snackbar) => setSnackbar(snackbar));
      if(folderData) setSelectedFolderPermissions(folderData.members);
    }

  }

  const renderTree = ({ ID, name, subfolders, parentID, container }: Folder) => (
    <TreeItem
      key={ID || -1}
      itemId={ID.toString() || "-1"}
      onClick={handleFolderClicked({ ID, name, subfolders, parentID, container })}
      label={<div className={classes.treeItemLabel}>
        <Typography>{name}</Typography>
      </div>}
    >
      {Array.isArray(subfolders)
        ? subfolders.map((folder: Folder) => renderTree(folder))
        : null}
    </TreeItem>
  );

  const handleDeletePermission = (recursive: boolean) => {
    if(selectedFolder) dispatch(removeUserFolderPermissions(userEmail, selectedFolder.ID, {
      username: deleting,
      recursive,
    }))
      .then(() => {
        setSelectedFolderPermissions(selectedFolderPermissions.filter(p => p.name !== deleting));
        setSnackbar("Success!");
        setDeleting("");
      })
      .catch((snackbar) => setSnackbar(snackbar));
  }

  const handleAddSuccess = async () => {
    if(!selectedFolder) return;
    const folderData = await dispatch(fetchUserFolder(userEmail, selectedFolder.ID))
      .catch((snackbar) => setSnackbar(snackbar));

    if(folderData) setSelectedFolderPermissions(folderData.members);
    setSnackbar("Success!");
  }

  return (
    <FormControl className={classes.form}>
      <div style={{ display: "flex" }}>
        {folder && <SimpleTreeView
          className={classes.richTree}
          expandedItems={expandedFolders}
        >
          {Object.keys(folder.subfolders).length > 0 && renderTree(folder)}
        </SimpleTreeView>}
        {selectedFolder && <div style={{ flex: 1 }}>
          <Typography variant='h4'>{selectedFolder.name}</Typography>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 8,
              paddingTop: selectedFolder.ID !== folder?.ID ? 0 : 4, 
              paddingBottom: selectedFolder.ID !== folder?.ID ? 0 : 4,
            }}>
            <Typography variant='h6'>{t("Permissions")}</Typography>
            {selectedFolder.ID !== folder?.ID && <IconButton onClick={() => setAdding(true)}>
              <AddCircle color="primary" />
            </IconButton>}
          </div>
          <List dense>
            {selectedFolderPermissions.map((perm, idx) =>
              <ListItem
                divider
                key={idx}
                secondaryAction={selectedFolder.ID !== folder?.ID && <>
                  <IconButton edge="end" onClick={() => setEditing(perm)}>
                    <Edit color='info' />
                  </IconButton>
                  <IconButton edge="end" onClick={() => setDeleting(perm.name)}>
                    <Delete color='error' />
                  </IconButton>
                </>
                }
              >
                <ListItemText
                  primary={perm.name}
                  secondary={perm.rightsName}
                />
              </ListItem>
            )}
          </List>
        </div>}
      </div>
      <Feedback
        snackbar={snackbar}
        onClose={() => setSnackbar('')}
      />
      <AddUserFolderMember
        open={!!adding}
        onClose={() => setAdding(false)}
        onSuccess={handleAddSuccess}
        onError={snackbar => setSnackbar(snackbar)}
        domain={domain}
        username={username}
        folderID={selectedFolder?.ID || 0}
        folderContainer={selectedFolder?.container || ""}
      />
      <EditUserFolderMember
        open={!!editing}
        onClose={() => setEditing(null)}
        onSuccess={handleAddSuccess}
        onError={snackbar => setSnackbar(snackbar)}
        domain={domain}
        username={username}
        permittedUser={editing}
        folderID={selectedFolder?.ID || 0}
        folderContainer={selectedFolder?.container || ""}
      />
      <DeleteUserFolderPermissionDialog
        deleting={deleting}
        onClose={() => setDeleting("")}
        onConfirm={handleDeletePermission}
      />
    </FormControl>
  );
}


export default Folders;
