import * as React from 'react';
import PropTypes from 'prop-types';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import { AddCircleOutline, AssignmentTurnedInOutlined,
  ContactsOutlined as Contacts, Delete, StickyNote2Outlined as StickyNote, Edit,
  EmailOutlined as Email, EventOutlined as Event } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';
import { IPM_SUBTREE_ID, IPM_SUBTREE_OBJECT } from '../constants';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';

const styles = {
  treeItemLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  treeItemActionsContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'end',
  },
  folderTypeIcon: {
    marginRight: 8,
  },
};

const FolderHierarchy = ({classes, t, writable, data, domainID, handleAdd, handleEdit, handleDelete, ...childProps}) => {

  const containerIcons = {
    'IPF.Note': <Email fontSize='small' className={classes.folderTypeIcon}/>,
    'IPF.Contact': <Contacts fontSize='small' className={classes.folderTypeIcon}/>,
    'IPF.Appointment': <Event fontSize='small' className={classes.folderTypeIcon}/>,
    'IPF.Stickynote': <StickyNote fontSize='small' className={classes.folderTypeIcon}/>,
    'IPF.Task': <AssignmentTurnedInOutlined fontSize='small' className={classes.folderTypeIcon}/>
  }

  const renderTree = ({ folderid, container, name, children }) => (
    <TreeItem
      key={folderid || -1}
      nodeId={folderid || "-1"}
      label={<div className={classes.treeItemLabel}>
        {containerIcons[container || 'IPF.Note']}
        <Typography variant=''>{folderid === IPM_SUBTREE_ID ? t(IPM_SUBTREE_OBJECT.displayname) : name}</Typography>
        <IconButton
          size='small'
          onClick={handleAdd(folderid)}
        >
          <AddCircleOutline color="primary" fontSize='inherit' style={{ fontSize: 16 }}/>
        </IconButton>
        <div className={classes.treeItemActionsContainer}>
          <IconButton
            style={{ marginLeft: 8 }}
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
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpanded={[IPM_SUBTREE_ID]}
      defaultExpandIcon={<ChevronRightIcon />}
      {...childProps}
    >
      {Object.keys(data).length !== 0 && renderTree(data)}
    </TreeView>
  );
}

FolderHierarchy.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domainID: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleAdd: PropTypes.func.isRequired,
  writable: PropTypes.bool,
}

export default withTranslation()(withStyles(styles)(FolderHierarchy));