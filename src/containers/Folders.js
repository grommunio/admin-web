// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Paper, Tabs, Tab } from '@mui/material';
import { deleteFolderData, fetchFolderTree } from '../actions/folders';
import AddFolder from '../components/Dialogs/AddFolder';
import { defaultFetchLimit, DOMAIN_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import TableViewContainer from '../components/TableViewContainer';
import DeleteFolder from '../components/Dialogs/DeleteFolder';
import withStyledReduxTable from '../components/withTable';
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
import SearchTextfield from '../components/SearchTextfield';
import Tree from 'react-d3-tree';
import FolderHierarchy from '../components/FolderHierarchy';
import TableActionGrid from '../components/TableActionGrid';
import { AccountTree, List } from '@mui/icons-material';

const styles = theme => ({
  tablePaper: {
    margin: theme.spacing(1, 2, 3, 2),
    borderRadius: 6,
  },
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  count: {
    margin: theme.spacing(2, 0, 0, 2),
  },
  breadcumbs: {
    margin: theme.spacing(3, 0, 0, 2),
  },
  link: {
    cursor: 'pointer',
  },
  tabs: {
    marginLeft: 16,
  },
  treeContainer: {
    height: '100%',
    display: 'flex',
    stroke: theme.palette.primary.main,
  },
  treeNodeLabel: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontWeight: 'lighter',
    stroke: theme.palette.mode === 'dark' ? 'white' : 'black',
  },
  treeNode: {
    stroke: theme.palette.primary.main,
  },
});

const Folders = props => {
  const [state, setState] = useState({
    offset: 0,
    tab: 0,
    root: -1,
    adding: null,
    filteredTree: null,
  });
  const context = useContext(CapabilityContext);
  const treeContainer = useRef();

  const handleScroll = () => {
    const { domain, folders, fetchTableData, tableState } = props;
    const { moreDataAvailable, loading } = folders;
    if (moreDataAvailable &&
      Math.floor(
        document.getElementById("scrollDiv").scrollHeight -
          document.getElementById("scrollDiv").scrollTop
      ) <=
      document.getElementById("scrollDiv").offsetHeight + 20
    ) {
      const { offset } = state;
      if (!loading) { 
        setState({
          ...state,
          offset: offset + defaultFetchLimit,
        });
        fetchTableData(domain.ID, {
          offset: defaultFetchLimit + offset,
          match: tableState.match || undefined,
        })
      }
    }
  };

  const handleTab = (_, tab) => setState({ ...state, tab });

  const renderNode = ({ nodeDatum, toggleNode }) => {
    const { classes } = props;
    return <g onClick={handleNodeClicked(nodeDatum?.folderid)}>
      <rect className={classes.treeNode} width="20" height="20" x="-10" onClick={toggleNode} />
      <text className={classes.treeNodeLabel} strokeWidth="1" x="20" y="15">
        {nodeDatum?.name}
      </text>
    </g>;
  }

  const getOffset = () => {
    const container = treeContainer.current;
    return {
      x: container ? (container.clientWidth - 32 /* padding */) / 2 : 0,
      y: 50,
    };
  }

  const handleNodeClicked = id => () => {
    const { domain, navigate } = props;
    navigate('/' + domain.ID + '/folders/' + id);
  }

  const handleAdd = parentID => e => {
    e.stopPropagation();
    setState({ ...state, adding: parentID });
  }

  const handleAddingClose = () => {
    setState({ ...state, adding: null });
  }

  const handleAddingSuccess = () => {
    props.handleAddingSuccess();
    setState({ ...state, adding: null });
  }

  const handleMatch = e => {
    const { value } = e.target;
    const Tree = structuredClone(props.folders.Tree);
    const filteredTree = prune(Tree, value);
    setState({ ...state, filteredTree });
  }

  // Recursive tree filter
  const prune = (node, text) => {
    const children = [];
    node.children?.forEach(child => {
      if(prune(child, text)) {
        children.push(child);
      }
    });
    node.children = children;
    return node.children.length > 0 || node["name"].includes(text) ? node : null;
  }


  const { classes, t, folders, domain, tableState, handleAddingError,
    clearSnackbar, handleDelete, handleDeleteClose, handleDeleteError,
    handleDeleteSuccess, handleEdit } = props;
  const writable = context.includes(DOMAIN_ADMIN_WRITE);
  const { loading, snackbar, deleting } = tableState;
  const { adding, tab, filteredTree } = state;

  return (
    <TableViewContainer
      handleScroll={handleScroll}
      headline={t("Folders")}
      subtitle={t('folders_sub')}
      href="https://docs.grommunio.com/admin/administration.html#folders"
      snackbar={snackbar}
      onSnackbarClose={clearSnackbar}
      baseRef={treeContainer}
      loading={loading}
    >
      <TableActionGrid
        tf={<SearchTextfield
          onChange={handleMatch}
          placeholder={t("Search folders")}
        />}
      >
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          className={classes.tabs}
          onChange={handleTab}
          value={tab}
        >
          <Tab sx={{ minHeight: 48 }} label={t("List")} iconPosition='start' icon={<List />}/>
          <Tab sx={{ minHeight: 48 }} label={t("Tree")} iconPosition='start' icon={<AccountTree />}/>
        </Tabs>
      </TableActionGrid>
      {!tab && 
        <Paper className={classes.tablePaper} elevation={1}>
          <FolderHierarchy
            domainID={domain.ID}
            data={filteredTree || folders.Tree}
            handleAdd={handleAdd}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            writable={writable}
          />
        </Paper>}
      {tab === 1 && 
        <div className={classes.treeContainer}>
          <Paper style={{ flex: 1 }}>
            <Tree
              data={folders.Tree}
              orientation="vertical"
              renderCustomNodeElement={renderNode}
              depthFactor={50}
              pathFunc="step"
              translate={getOffset()}
              scaleExtent={{
                min: 0.1,
                max: 2,
              }}
              separation={{
                siblings: 2,
                nonSiblings: 2,
              }}
              onNodeClick={handleNodeClicked}
              collapsible={false}
            />
          </Paper>
        </div>}
      <AddFolder
        open={!!adding}
        onClose={handleAddingClose}
        onSuccess={handleAddingSuccess}
        onError={handleAddingError}
        domain={domain}
        parentID={adding}
      />
      <DeleteFolder
        open={!!deleting}
        delete={props.delete}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
        onClose={handleDeleteClose}
        item={deleting.displayname}
        id={deleting.folderid}
        domainID={domain.ID}
      />
    </TableViewContainer>
  );
}

Folders.propTypes = {
  domain: PropTypes.object.isRequired,
  folders: PropTypes.object.isRequired,
  delete: PropTypes.func.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = state => {
  return { folders: state.folders };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTableData: async (domainID, params) => 
      await dispatch(fetchFolderTree(domainID, params))
        .catch(msg => Promise.reject(msg)),
    delete: async (domainID, id, params) =>
      await dispatch(deleteFolderData(domainID, id, params))
        .catch(msg => Promise.reject(msg)),
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(Folders, { orderBy: 'displayname' });
