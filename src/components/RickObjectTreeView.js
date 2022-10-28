import * as React from 'react';
import PropTypes from 'prop-types';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import { Delete, Edit } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { IPM_SUBTREE_ID } from '../constants';
import { withStyles } from '@mui/styles';

const styles = {
  treeItemLabel: {
    display: 'flex',
  },
  treeItemActionsContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'end',
  },
};

const RichObjectTreeView = ({classes, data, domainID, handleEdit, handleDelete, ...childProps}) => {

  const renderTree = ({ folderid, name, children }) => (
    <TreeItem
      key={folderid || -1}
      nodeId={folderid || "-1"}
      label={<div className={classes.treeItemLabel}>
        {name}
        <div className={classes.treeItemActionsContainer}>
          <IconButton
            style={{ marginLeft: 8 }}
            size='small'
            onClick={handleEdit('/' + domainID + '/folders/' + folderid)}
          >
            <Edit color="primary" fontSize='inherit' style={{ fontSize: 16 }}/>
          </IconButton>
          {folderid !== IPM_SUBTREE_ID && <IconButton
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

RichObjectTreeView.propTypes = {
  classes: PropTypes.object.isRequired,
  domainID: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
}

export default withStyles(styles)(RichObjectTreeView);