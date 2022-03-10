// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography, Button, Grid,
  CircularProgress, TextField, InputAdornment, Table, TableHead, TableRow, TableCell,
  TableSortLabel, TableBody, IconButton, Tabs, Tab, FormControl, InputLabel, Select,
  Input, MenuItem } from '@mui/material';
import Search from '@mui/icons-material/Search';
import { fetchClassesData, deleteClassData, fetchClassesTree } from '../actions/classes';
import { Delete } from '@mui/icons-material';
import AddClass from '../components/Dialogs/AddClass';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';
import Tree from 'react-d3-tree';
import { DOMAIN_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import TableViewContainer from '../components/TableViewContainer';
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
import withStyledReduxTable from '../components/withTable';

const styles = theme => ({
  tablePaper: {
    margin: theme.spacing(3, 2, 3, 2),
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
  newButton: {
    marginRight: 8,
  },
  select: {
    margin: theme.spacing(0, 2, 0, 2),
  },
  tabs: {
    marginLeft: 16,
  },
  count: {
    margin: theme.spacing(2, 0, 0, 2),
  },
  treeContainer: {
    display: 'flex',
    flex: 1,
    alignItems: 'stretch',
  },
});

class Classes extends Component {

  state = {
    tab: 0,
    root: -1,
    snackbar: '',
    checking: false,
  }

  columns = [
    { label: 'Groupname', value: 'classname' },
    { label: 'Listname', value: 'listname' },
  ]

  handleScroll = () => {
    const { Classes, count, loading } = this.props._classes;
    this.props.handleScroll(Classes, count, loading);
  };

  handleTab = (e, tab) => this.setState({ tab });

  handleRootSelect = event => {
    this.setState({
      root: event.target.value,
    });
  }

  componentDidMount() {
    const { domain, fetchTrees } = this.props;
    // Table view is fetched in tableHOC
    fetchTrees(domain.ID, {})
      .catch(msg => this.setState({ snackbar: msg }));
  }

  handleCheckClose = () => this.setState({ checking: false });

  renderNode = ({ nodeDatum, toggleNode }) => (
    <g onClick={this.handleNodeClicked(nodeDatum.ID)}>
      <rect width="20" height="20" x="-10" onClick={toggleNode} />
      <text fill="black" strokeWidth="1" x="20" y="15">
        {nodeDatum.name}
      </text>
    </g>
  );

  getOffset() {
    const container = this.treeContainer;
    return {
      x: container ? (container.clientWidth - 32 /* padding */) / 2 : 0,
      y: 20,
    };
  }

  handleNodeClicked = id => () => {
    const { domain, history } = this.props;
    history.push('/' + domain.ID + '/classes/' + id);
  }

  handleSnackbarClose = () => {
    this.setState({ snackbar: '' });
    this.props.clearSnackbar();
  }

  render() {
    const { classes, t, _classes, domain, tableState, handleMatch, handleRequestSort,
      handleAdd, handleAddingSuccess, handleAddingClose, handleAddingError,
      handleDelete, handleDeleteClose, handleDeleteError,
      handleDeleteSuccess, handleEdit } = this.props;
    const { order, orderBy, match, snackbar, adding, deleting } = tableState;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { tab, root } = this.state;

    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={t("Groups")}
        subtitle={t("groups_sub")}
        href="https://docs.grommunio.com/admin/administration.html#groups"
        snackbar={snackbar || this.state.snackbar}
        onSnackbarClose={this.handleSnackbarClose}
        baseRef={tc => (this.treeContainer = tc)}
      >
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            className={classes.newButton}
            disabled={!writable}
          >
            {t('New group')}
          </Button>
          <div className={classes.actions}>
            <TextField
              value={match}
              onChange={handleMatch}
              placeholder={t("Search")}
              variant="outlined"
              className={classes.textfield}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="secondary" />
                  </InputAdornment>
                ),
              }}
              color="primary"
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
        {!tab && <Typography className={classes.count} color="textPrimary">
          {t("showingGroups", { count: _classes.Classes.length })}
        </Typography>}
        {!tab ? <Paper className={classes.tablePaper} elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {this.columns.map(column =>
                  <TableCell key={column.value}>
                    <TableSortLabel
                      active={orderBy === column.value}
                      align="left" 
                      direction={orderBy === column.value ? order : 'asc'}
                      onClick={handleRequestSort(column.value)}
                    >
                      {t(column.label)}
                    </TableSortLabel>
                  </TableCell>
                )}
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {_classes.Classes.map((obj, idx) =>
                <TableRow key={idx} hover onClick={handleEdit('/' + domain.ID + '/classes/' + obj.ID)}>
                  <TableCell>{obj.classname}</TableCell>
                  <TableCell>{obj.listname}</TableCell>
                  <TableCell align="right">
                    {writable && <IconButton onClick={handleDelete(obj)} size="large">
                      <Delete color="error"/>
                    </IconButton>}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {(_classes.Classes.length < _classes.count) && <Grid container justifyContent="center">
            <CircularProgress color="primary" className={classes.circularProgress}/>
          </Grid>}
        </Paper> :
          <>
            <FormControl className={classes.select}>
              <InputLabel variant="standard">{t("Root group")}</InputLabel>
              <Select
                fullWidth
                value={root > -1 ? root : ''}
                onChange={this.handleRootSelect}
                input={<Input />}
                placeholder={t('Select root group')}
              >
                {_classes.Trees.map((tree, idx) => (
                  <MenuItem key={idx} value={idx}>
                    {tree.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <div className={classes.treeContainer}>
              {root !== -1 &&
                  <Paper style={{ flex: 1 }}>
                    <Tree
                      data={_classes.Trees[root]}
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
                  </Paper>}
            </div>
          </>
        }
        <AddClass
          open={adding}
          onSuccess={handleAddingSuccess}
          onError={handleAddingError}
          domain={domain}
          onClose={handleAddingClose}
        />
        <DomainDataDelete
          open={!!deleting}
          delete={this.props.delete}
          onSuccess={handleDeleteSuccess}
          onError={handleDeleteError}
          onClose={handleDeleteClose}
          item={deleting.name}
          id={deleting.ID}
          domainID={domain.ID}
        />
      </TableViewContainer>
    );
  }
}

Classes.contextType = CapabilityContext;
Classes.propTypes = {
  _classes: PropTypes.object.isRequired,
  fetchTrees: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  delete: PropTypes.func.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = state => {
  return { _classes: state._classes };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTableData: async (domainID, params) => {
      await dispatch(fetchClassesData(domainID, params)).catch(error => Promise.reject(error));
    },
    fetchTrees: async (domainID, params) => {
      await dispatch(fetchClassesTree(domainID, params)).catch(error => Promise.reject(error));
    },
    delete: async (domainID, id) => {
      await dispatch(deleteClassData(domainID, id)).catch(error => Promise.reject(error));
    },
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(Classes, { orderBy: 'classname' });
