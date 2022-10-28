// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Typography, Button, Grid, CircularProgress,
  Breadcrumbs, Link, Tabs, Tab } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import { fetchFolderData, deleteFolderData, fetchFolderTree } from '../actions/folders';
import AddFolder from '../components/Dialogs/AddFolder';
import { defaultFetchLimit, DOMAIN_ADMIN_WRITE, IPM_SUBTREE_ID, IPM_SUBTREE_OBJECT } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import TableViewContainer from '../components/TableViewContainer';
import DeleteFolder from '../components/Dialogs/DeleteFolder';
import withStyledReduxTable from '../components/withTable';
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
import { Edit } from '@mui/icons-material';
import SearchTextfield from '../components/SearchTextfield';
import Tree from 'react-d3-tree';

const styles = theme => ({
  tablePaper: {
    margin: theme.spacing(1, 2, 3, 2),
    borderRadius: 6,
  },
  buttonGrid: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  textfield: {
    margin: theme.spacing(2, 0, 1, 0),
  },
  actions: {
    display: 'flex',
    flex: 1,
    margin: theme.spacing(0, 4, 0, 0),
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
});

class Folders extends PureComponent {

  state = {
    offset: 0,
    tab: 0,
    root: -1,
    hierarchy: [IPM_SUBTREE_OBJECT],
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
      const { offset, hierarchy } = this.state;
      if (!loading) { 
        this.setState({
          offset: offset + defaultFetchLimit,
        }, () => fetchTableData(domain.ID, {
          parentID: hierarchy[hierarchy.length - 1].folderid,
          offset: this.state.offset,
          match: tableState.match || undefined,
        }));
        
      }
    }
  };

  handleFetchChildren = parent => () => {
    const { domain, fetchTableData } = this.props;
    const copy = [...this.state.hierarchy];
    copy.push({...parent});
    this.setState({
      offset: 0,
      hierarchy: copy,
    });
    fetchTableData(domain.ID, { parentID: parent.folderid });
  }

  handleBreadcrumb = (folder, stackIdx) => event => {
    const { domain, fetchTableData } = this.props;
    
    event.preventDefault();

    fetchTableData(domain.ID, { parentID: folder.folderid });
    this.setState({
      offset: 0,
      hierarchy: [...this.state.hierarchy].slice(0, stackIdx + 1),
    });
  }

  handleTab = (_, tab) => this.setState({ tab });

  componentDidMount = () => {
    const { fetchTree, domain } = this.props;
    fetchTree(domain.ID)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

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

  render() {
    const { classes, t, folders, domain, tableState, handleMatch,
      handleAdd, handleAddingSuccess, handleAddingClose, handleAddingError,
      clearSnackbar, handleDelete, handleDeleteClose, handleDeleteError,
      handleDeleteSuccess, handleEdit } = this.props;
    const { Folders, moreDataAvailable } = folders;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { match, snackbar, adding, deleting } = tableState;
    const { tab, hierarchy } = this.state;

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
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            disabled={!writable}
          >
            {t('New folder')}
          </Button>
          <div className={classes.actions}>
            <SearchTextfield
              value={match}
              onChange={handleMatch}
              placeholder={t("Search folders")}
              className={classes.textfield}
            />
          </div>
        </Grid>
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
        {!tab && <>
          <Typography className={classes.count} color="textPrimary">
            {t("showingFolders", { count: Folders.length + (hierarchy.length === 1 ? 1 : 0) })}
          </Typography>
          <Breadcrumbs aria-label="breadcrumb" className={classes.breadcumbs}>
            {hierarchy.map((folder, idx) => 
              <Link
                key={folder.folderid}
                underline="hover"
                color="primary"
                onClick={this.handleBreadcrumb(folder, idx)}
                className={classes.link}
              >
                {folder.displayname}
              </Link>
            )}
          </Breadcrumbs>
          <Paper className={classes.tablePaper} elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Folder name', 'Comment', 'Creation time', ''].map(headerName =>
                    <TableCell key={headerName}>{t(headerName)}</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {hierarchy.length === 1 && <TableRow>
                  <TableCell>{IPM_SUBTREE_OBJECT.displayname}</TableCell>
                  <TableCell>{t(IPM_SUBTREE_OBJECT.comment)}</TableCell>
                  <TableCell></TableCell>
                  <TableCell align="right">
                    <IconButton onClick={handleEdit('/' + domain.ID + '/folders/' + IPM_SUBTREE_ID)} size="large">
                      <Edit color="primary"/>
                    </IconButton>
                  </TableCell>
                </TableRow>}
                {Folders.map((obj, idx) =>
                  <TableRow hover onClick={this.handleFetchChildren(obj)} key={idx}>
                    <TableCell>{obj.displayname}</TableCell>
                    <TableCell>{obj.comment}</TableCell>
                    <TableCell>{obj.creationtime}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={handleEdit('/' + domain.ID + '/folders/' + obj.folderid)} size="large">
                        <Edit color="primary"/>
                      </IconButton>
                      {writable && <IconButton onClick={handleDelete(obj)} size="large">
                        <Delete color="error"/>
                      </IconButton>}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {(moreDataAvailable) && <Grid container justifyContent="center">
              <CircularProgress color="primary" className={classes.circularProgress}/>
            </Grid>}
          </Paper>
        </>}
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
          open={adding}
          onClose={handleAddingClose}
          onSuccess={handleAddingSuccess}
          onError={handleAddingError}
          domain={domain}
          parentID={hierarchy[hierarchy.length - 1].folderid}
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
  fetchTree: PropTypes.func.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = state => {
  return { folders: state.folders };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTableData: async (domainID, params) => 
      await dispatch(fetchFolderData(domainID, params))
        .catch(msg => Promise.reject(msg)),
    fetchTree: async (domainID, params) => {
      await dispatch(fetchFolderTree(domainID, params)).catch(error => Promise.reject(error));
    },
    delete: async (domainID, id, params) =>
      await dispatch(deleteFolderData(domainID, id, params))
        .catch(msg => Promise.reject(msg)),
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(Folders, { orderBy: 'displayname' });
