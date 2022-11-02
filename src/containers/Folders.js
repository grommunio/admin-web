// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Paper, Grid, Tabs, Tab } from '@mui/material';
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

const styles = theme => ({
  tablePaper: {
    margin: theme.spacing(1, 2, 3, 2),
    borderRadius: 6,
  },
  buttonGrid: {
    margin: theme.spacing(0, 2, 2, 0),
  },
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  textfield: {
    margin: theme.spacing(1, 0),
  },
  actions: {
    display: 'flex',
    flex: 1,
    margin: theme.spacing(0, 2, 0, 0),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
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
  },
  treeNodeLabel: {
    stroke: theme.palette.mode === 'dark' ? 'white' : 'black',
  },
  richTree: {
    padding: theme.spacing(1, 3, 1, 1),
  },
});

class Folders extends PureComponent {

  state = {
    offset: 0,
    tab: 0,
    root: -1,
    adding: null,
    filteredTree: null,
  }

  handleScroll = () => {
    const { domain, folders, fetchTableData, tableState } = this.props;
    const { moreDataAvailable, loading } = folders;
    if (moreDataAvailable &&
      Math.floor(
        document.getElementById("scrollDiv").scrollHeight -
          document.getElementById("scrollDiv").scrollTop
      ) <=
      document.getElementById("scrollDiv").offsetHeight + 20
    ) {
      const { offset } = this.state;
      if (!loading) { 
        this.setState({
          offset: offset + defaultFetchLimit,
        }, () => fetchTableData(domain.ID, {
          offset: this.state.offset,
          match: tableState.match || undefined,
        }));
      }
    }
  };

  handleTab = (_, tab) => this.setState({ tab });

  renderNode = ({ nodeDatum, toggleNode }) => {
    const { classes } = this.props;
    return <g onClick={this.handleNodeClicked(nodeDatum?.folderid)}>
      <rect className={classes.treeNodeLabel} width="20" height="20" x="-10" onClick={toggleNode} />
      <text className={classes.treeNodeLabel} strokeWidth="1" x="20" y="15">
        {nodeDatum?.name}
      </text>
    </g>;
  }

  getOffset() {
    const container = this.treeContainer;
    return {
      x: container ? (container.clientWidth - 32 /* padding */) / 2 : 0,
      y: 20,
    };
  }

  handleNodeClicked = id => () => {
    const { domain, history } = this.props;
    history.push('/' + domain.ID + '/folders/' + id);
  }

  handleAdd = parentID => e => {
    e.stopPropagation();
    this.setState({ adding: parentID });
  }

  handleAddingClose = () => {
    this.setState({ adding: null });
  }

  handleAddingSuccess = () => {
    this.props.handleAddingSuccess();
    this.setState({ adding: null });
  }

  handleMatch = e => {
    const { value } = e.target;
    const Tree = structuredClone(this.props.folders.Tree);
    const filteredTree = this.prune(Tree, value);
    this.setState({ filteredTree });
  }

  prune(node, text) {
    const children = [];
    node.children?.forEach(child => {
      if(this.prune(child, text)) {
        children.push(child);
      }
    });
    node.children = children;
    return node.children.length > 0 || node["name"].includes(text) ? node : null;
  }


  render() {
    const { classes, t, folders, domain, tableState, handleAddingError,
      clearSnackbar, handleDelete, handleDeleteClose, handleDeleteError,
      handleDeleteSuccess, handleEdit } = this.props;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { snackbar, deleting } = tableState;
    const { adding, tab, filteredTree } = this.state;

    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={t("Folders")}
        subtitle={t('folders_sub')}
        href="https://docs.grommunio.com/admin/administration.html#folders"
        snackbar={snackbar}
        onSnackbarClose={clearSnackbar}
        baseRef={tc => (this.treeContainer = tc)}
      >
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
          <Tabs
            indicatorColor="primary"
            textColor="primary"
            className={classes.tabs}
            onChange={this.handleTab}
            value={tab}
          >
            <Tab value={0} label={t("List")} />
            <Tab value={1} label={t("Tree")} />
          </Tabs>
          <div className={classes.actions}>
            <SearchTextfield
              onChange={this.handleMatch}
              placeholder={t("Search folders")}
              className={classes.textfield}
            />
          </div>
        </Grid>
        {!tab && 
          <Paper className={classes.tablePaper} elevation={1}>
            <FolderHierarchy
              domainID={domain.ID}
              className={classes.richTree}
              data={filteredTree || folders.Tree}
              handleAdd={this.handleAdd}
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
                renderCustomNodeElement={this.renderNode}
                depthFactor={50}
                pathFunc="step"
                translate={this.getOffset()}
                scaleExtent={{
                  min: 0.1,
                  max: 2,
                }}
                separation={{
                  siblings: 1,
                  nonSiblings: 2,
                }}
                onNodeClick={this.handleNodeClicked}
                collapsible={false}
              />
            </Paper>
          </div>}
        <AddFolder
          open={!!adding}
          onClose={this.handleAddingClose}
          onSuccess={this.handleAddingSuccess}
          onError={handleAddingError}
          domain={domain}
          parentID={adding}
        />
        <DeleteFolder
          open={!!deleting}
          delete={this.props.delete}
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
}

Folders.contextType = CapabilityContext;
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
