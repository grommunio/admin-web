// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import * as React from 'react';
import { AddCircleOutline, AssignmentTurnedInOutlined,
  ContactsOutlined as Contacts, Delete, StickyNote2Outlined as StickyNote, Edit,
  EmailOutlined as Email, EventOutlined as Event } from '@mui/icons-material';
import { IconButton, Theme, Tooltip, Typography } from '@mui/material';
import { IPM_SUBTREE_ID, IPM_SUBTREE_OBJECT } from '../constants';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import { TreeItem, SimpleTreeView } from '@mui/x-tree-view';


const useStyles = makeStyles()((theme: Theme) => ({
  richTree: {
    padding: theme.spacing(1, 3, 1, 1),
  },
  treeItemLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  treeItemActionsContainer: {
  },
  folderTypeIcon: {
    marginRight: 8,
  },
}));

type RenderTreeParams = {
  folderid: string;
  container: 'IPF.Note' | 'IPF.Contact' | 'IPF.Appointment' | 'IPF.Stickynote' | 'IPF.Task';
  name: string;
  children: React.ReactNode;
}

type FolderHierarchyProps = {
  writable: boolean;
  data: RenderTreeParams;
  domainID: number;
  handleAdd: (folderid: string) => (e: React.MouseEvent) => void;
  handleEdit: (redirect: string) => (e: React.MouseEvent) => void;
  handleDelete: (folderDeleteProps: { folderid: string, name: string }) => (e: React.MouseEvent) => void;
}

const FolderHierarchy = ({ writable, data, domainID, handleAdd, handleEdit, handleDelete }: FolderHierarchyProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();

  const containerIcons = {
    'IPF.Note': <Email fontSize='small' className={classes.folderTypeIcon}/>,
    'IPF.Contact': <Contacts fontSize='small' className={classes.folderTypeIcon}/>,
    'IPF.Appointment': <Event fontSize='small' className={classes.folderTypeIcon}/>,
    'IPF.Stickynote': <StickyNote fontSize='small' className={classes.folderTypeIcon}/>,
    'IPF.Task': <AssignmentTurnedInOutlined fontSize='small' className={classes.folderTypeIcon}/>
  }

  const renderTree = ({ folderid, container, name, children }: RenderTreeParams) => (
    <TreeItem
      key={folderid || -1}
      itemId={folderid || "-1"}
      label={<div className={classes.treeItemLabel}>
        {containerIcons[container || 'IPF.Note']}
        <Typography>{folderid === IPM_SUBTREE_ID ? t(IPM_SUBTREE_OBJECT.displayname) : name}</Typography>
        <IconButton
          size='small'
          onClick={handleAdd(folderid)}
        >
          <Tooltip title={t("Add new folder within this folder")} placement="right" arrow>
            <AddCircleOutline color="primary" fontSize='inherit' style={{ fontSize: 16 }}/>
          </Tooltip>
        </IconButton>
        <div className={classes.treeItemActionsContainer}>
          <IconButton
            size='small'
            onClick={handleEdit('/' + domainID + '/folders/' + folderid)}
          >
            <Edit color="primary" fontSize='inherit' style={{ fontSize: 16 }}/>
          </IconButton>
          {folderid !== IPM_SUBTREE_ID && writable && <IconButton
            size='small'
            onClick={handleDelete({ folderid, name })}
          >
            <Delete color='error' fontSize='inherit' style={{ fontSize: 16 }}/>
          </IconButton>}
        </div>
      </div>}
    >
      {Array.isArray(children)
        ? children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  );

  return (
    <SimpleTreeView
      className={classes.richTree}
      defaultExpandedItems={[IPM_SUBTREE_ID]}
    >
      {Object.keys(data).length !== 0 && renderTree(data)}
    </SimpleTreeView>
  );
}

export default FolderHierarchy;