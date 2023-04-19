// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography, Button, Grid,
  CircularProgress, Table, TableHead, TableRow, TableCell,
  TableSortLabel, TableBody, IconButton } from '@mui/material';
import { fetchMListsData, deleteMListData } from '../actions/mlists';
import { Delete } from '@mui/icons-material';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';
import AddMList from '../components/Dialogs/AddMList';
import { CapabilityContext } from '../CapabilityContext';
import { DOMAIN_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import withStyledReduxTable from '../components/withTable';
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
import SearchTextfield from '../components/SearchTextfield';
import TableActionGrid from '../components/TableActionGrid';

const styles = theme => ({
  tablePaper: {
    margin: theme.spacing(3, 2, 3, 2),
    borderRadius: 6,
  },
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  count: {
    marginLeft: 16,
  },
});

class MLists extends Component {

  state = {
    checking: false,
  }

  columns = [
    { label: 'Group name', value: 'listname' },
    { label: 'Type', value: 'listType' },
    { label: 'Privilege', value: 'listPrivilege' },
  ]

  listTypes = ['Normal', 'Domain', 'Group']

  listPrivileges = ['All', 'Internal', 'Domain', 'Specific', 'Outgoing']

  handleCheckClose = () => this.setState({ checking: false });

  handleScroll = () => {
    const { MLists, count, loading } = this.props.mLists;
    this.props.handleScroll(MLists, count, loading);
  };

  render() {
    const { classes, t, mLists, domain, tableState, handleMatch, handleRequestSort,
      handleAdd, handleAddingSuccess, handleAddingClose, handleAddingError,
      clearSnackbar, handleDelete, handleDeleteClose, handleDeleteError,
      handleDeleteSuccess, handleEdit } = this.props;
    const { loading, order, orderBy, match, snackbar, adding, deleting } = tableState;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);

    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={t("Groups")}
        subtitle={t('mlists_sub')}
        href="https://docs.grommunio.com/admin/administration.html#mail-lists"
        snackbar={snackbar}
        onSnackbarClose={clearSnackbar}
        loading={loading}
      >
        <TableActionGrid
          tf={<SearchTextfield
            value={match}
            onChange={handleMatch}
            placeholder={t("Search groups")}
          />}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            disabled={!writable}
          >
            {t('New group')}
          </Button>
        </TableActionGrid>
        <Typography className={classes.count} color="textPrimary">
          {t("showingMLists", { count: mLists.MLists.length })}
        </Typography>
        <Paper className={classes.tablePaper} elevation={1}>
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
              {mLists.MLists.map((obj, idx) =>
                <TableRow key={idx} hover onClick={handleEdit('/' + domain.ID + '/mailLists/' + obj.ID)}>
                  <TableCell>{obj.listname}</TableCell>
                  <TableCell>{t(this.listTypes[obj.listType])}</TableCell>
                  <TableCell>{t(this.listPrivileges[obj.listPrivilege])}</TableCell>
                  <TableCell align="right">
                    {writable && <IconButton onClick={handleDelete(obj)} size="large">
                      <Delete color="error"/>
                    </IconButton>}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {(mLists.MLists.length < mLists.count) && <Grid container justifyContent="center">
            <CircularProgress color="primary" className={classes.circularProgress}/>
          </Grid>}
        </Paper>
        <AddMList
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
          item={deleting.listname}
          id={deleting.ID}
          domainID={domain.ID}
        />
      </TableViewContainer>
    );
  }
}

MLists.contextType = CapabilityContext;
MLists.propTypes = {
  mLists: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  delete: PropTypes.func.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = state => {
  return { mLists: state.mLists };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTableData: async (domainID, params) => {
      await dispatch(fetchMListsData(domainID, params)).catch(error => Promise.reject(error));
    },
    delete: async (domainID, id) => {
      await dispatch(deleteMListData(domainID, id)).catch(error => Promise.reject(error));
    },
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(MLists, { orderBy: 'listname'});
