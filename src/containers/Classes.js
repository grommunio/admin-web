// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import debounce from 'debounce';
import { withTranslation } from 'react-i18next';
import { Paper, Typography, Button, Grid,
  CircularProgress, TextField, InputAdornment, Table, TableHead, TableRow, TableCell,
  TableSortLabel, TableBody, IconButton, Tabs, Tab, FormControl, InputLabel, Select,
  Input, MenuItem } from '@material-ui/core';
import Search from '@material-ui/icons/Search';
import { connect } from 'react-redux';
import { fetchClassesData, deleteClassData, fetchClassesTree } from '../actions/classes';
import { Delete } from '@material-ui/icons';
import AddClass from '../components/Dialogs/AddClass';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';
import Tree from 'react-d3-tree';
import { DOMAIN_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import TableViewContainer from '../components/TableViewContainer';

const styles = theme => ({
  tablePaper: {
    margin: theme.spacing(3, 2),
    borderRadius: 6,
  },
  buttonGrid: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  circularProgress: {
    margin: theme.spacing(1, 0),
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
    margin: theme.spacing(0, 2),
  },
  tabs: {
    marginLeft: 16,
  },
  count: {
    margin: theme.spacing(2, 0, 0, 2),
  },
});

class Classes extends Component {

  state = {
    tab: 0,
    root: -1,
    snackbar: null,
    adding: false,
    deleting: false,
    checking: false,
    order: 'asc',
    orderBy: 'classname',
    offset: 50,
    match: '',
  }

  columns = [
    { label: 'Groupname', value: 'classname' },
    { label: 'Listname', value: 'listname' },
  ]

  handleScroll = () => {
    const { _classes } = this.props;
    if((_classes.Classes.length >= _classes.count)) return;
    if (
      Math.floor(document.getElementById('scrollDiv').scrollHeight - document.getElementById('scrollDiv').scrollTop)
      <= document.getElementById('scrollDiv').offsetHeight + 20
    ) {
      const { orderBy, order, offset, match } = this.state;
      if(!_classes.loading) this.fetchClasses({
        sort: orderBy + ',' + order,
        offset,
        match: match || undefined,
      });
      this.setState({
        offset: offset + 50,
      });
    }
  }

  handleTab = (e, tab) => this.setState({ tab });

  handleRootSelect = event => {
    this.setState({
      root: event.target.value,
    });
  }

  componentDidMount() {
    this.fetchClasses({ sort: 'classname,asc' });
  }

  fetchClasses(params) {
    const { fetch, fetchTrees, domain } = this.props;
    fetch(domain.ID, params)
      .catch(msg => this.setState({ snackbar: msg }));
    fetchTrees(domain.ID, {})
      .catch(msg => this.setState({ snackbar: msg }));
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ snackbar: 'Success!', adding: false });

  handleAddingClose = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleDelete = _class => event => {
    event.stopPropagation();
    this.setState({ deleting: _class });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
  }

  handleDeleteError = error => this.setState({ snackbar: error });

  handleEdit = _class => () => {
    const { history, domain } = this.props;
    history.push('/' + domain.ID + '/classes/' + _class.ID, { ..._class });
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleRequestSort = orderBy => () => {
    const { fetch, domain } = this.props;
    const { order: stateOrder, orderBy: stateOrderBy, match } = this.state;
    const order = (stateOrderBy === orderBy && stateOrder === "asc") ? "desc" : "asc";
    
    fetch(domain.ID, {
      sort: orderBy + ',' + order,
      match: match || undefined,
    }).catch(msg => this.setState({ snackbar: msg }));

    this.setState({
      order: order,
      orderBy,
      offset: 0,
    });
  }

  debouceFetch = debounce(value => {
    const { order, orderBy } = this.state;
    this.fetchClasses({ match: value || undefined, sort: orderBy + ',' + order });
  }, 200)

  handleCheckClose = () => this.setState({ checking: false });

  handleMatch = (e) => {
    const { value } = e.target;
    this.debouceFetch(value);
    this.setState({ match: value });
  };

  debouceFetch = debounce((value) => {
    const { order, orderBy } = this.state;
    this.fetchClasses({
      match: value || undefined,
      sort: orderBy + "," + order,
    });
  }, 200);

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

  render() {
    const { classes, t, _classes, domain } = this.props;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { snackbar, match, orderBy, order, adding, deleting, tab, root } = this.state;

    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={t("Groups")}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
        baseRef={tc => (this.treeContainer = tc)}
      >
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleAdd}
            className={classes.newButton}
            disabled={!writable}
          >
            {t('New group')}
          </Button>
          <div className={classes.actions}>
            <TextField
              value={match}
              onChange={this.handleMatch}
              label={t("Search")}
              variant="outlined"
              className={classes.textfield}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
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
          <Tab value={0} label="List" />
          <Tab value={1} label="Tree" />
        </Tabs>
        {!tab && <Typography className={classes.count} color="textPrimary">
            Showing {_classes.Classes.length} group(s)
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
                      onClick={this.handleRequestSort(column.value)}
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
                <TableRow key={idx} hover onClick={this.handleEdit(obj)}>
                  <TableCell>{obj.classname}</TableCell>
                  <TableCell>{obj.listname}</TableCell>
                  <TableCell align="right">
                    {writable && <IconButton onClick={this.handleDelete(obj)}>
                      <Delete color="error"/>
                    </IconButton>}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {(_classes.Classes.length < _classes.count) && <Grid container justify="center">
            <CircularProgress color="primary" className={classes.circularProgress}/>
          </Grid>}
        </Paper> :
          <>
            <FormControl className={classes.select}>
              <InputLabel>{t("Root group")}</InputLabel>
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
            <div style={{ display: 'flex', flex: 1, alignItems: 'stretch' }}>
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
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          domain={domain}
          onClose={this.handleAddingClose}
        />
        <DomainDataDelete
          open={!!deleting}
          delete={this.props.delete}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
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
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  _classes: PropTypes.object.isRequired,
  fetchTrees: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { _classes: state._classes };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, params) => {
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

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Classes)));
