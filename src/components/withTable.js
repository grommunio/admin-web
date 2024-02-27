// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

/* eslint-disable react/display-name */
import React, { useEffect, useState } from 'react';
import { debounce } from 'debounce';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@mui/styles';
import { defaultFetchLimit } from '../constants';
import { withRouter } from '../hocs/withRouter';

export default function withStyledReduxTable(mapState, mapDispatch, styles) {
  return (wrappedComponent, defaultState) => withRouter(connect(mapState, mapDispatch)(
    withTranslation()(withStyles(styles)(
      withTable(wrappedComponent, defaultState)))));
}

function withTable(WrappedComponent, defaultState={}) {

  return function inner(props) {
    const [state, setState] = useState({
      offset: 0,
      orderBy: 'name',
      order: 'asc',
      match: '',
      snackbar: '',
      adding: false,
      deleting: false,
      loading: true,
      ...defaultState,
    });

    useEffect(() => {
      fetchData();
    }, []);
  
    const fetchData = (params) => {
      const { domain, fetchTableData } = props;
      const { order, orderBy } = state;
      if(domain?.ID) {
        fetchTableData(domain.ID, { sort: orderBy + "," + order, ...(params || {})})
          .then(() => setState({ ...state, loading: false }))
          .catch((msg) => setState({ ...state, snackbar: msg, loading: false }));
      } else {
        fetchTableData({ sort: orderBy + "," + order, ...(params || {})})
          .then(() => setState({ ...state, loading: false }))
          .catch((msg) => setState({ ...state, snackbar: msg, loading: false }));
      }
    }

    const handleRequestSort = (orderBy) => () => {
      const { order: stateOrder, orderBy: stateOrderBy, match } = state;
      const order =
        stateOrderBy === orderBy && stateOrder === "asc" ? "desc" : "asc";
  
      fetchData({
        sort: orderBy + "," + order,
        match: match || undefined,
      });
  
      setState({
        ...state, 
        order: order,
        orderBy: orderBy,
        offset: 0,
      });
    };

    const handleScroll = (data, count, loading) => {
      if (data.length >= count) return;
      if (
        Math.floor(
          document.getElementById("scrollDiv").scrollHeight -
            document.getElementById("scrollDiv").scrollTop
        ) <=
        document.getElementById("scrollDiv").offsetHeight + 20
      ) {
        const { orderBy, order, offset, match } = state;
        if (!loading) {
          const newOffset = offset + defaultFetchLimit;
          setState({
            ...state, 
            offset: newOffset,
          });
          fetchData({
            sort: orderBy + "," + order,
            offset: newOffset,
            match: match || undefined,
          })
        }
      }
    };

    const clearSnackbar = () => setState({
      ...state,
      snackbar: '',
    });

    const handleMatch = (e) => {
      const { value } = e.target;
      debouceFetch(value);
      setState({ ...state, match: value });
    };
  
    const debouceFetch = debounce((value) => {
      fetchData({
        match: value || undefined,
      });
    }, 200);

    const handleAdd = () => setState({ ...state, adding: true });

    const handleAddingClose = () => setState({ ...state, adding: false });

    const handleAddingSuccess = () => setState({ ...state, adding: false, snackbar: 'Success!' });

    const handleAddingError = (error) => setState({ ...state, snackbar: error });

    const handleDelete = (item) => (event) => {
      event.stopPropagation();
      setState({ ...state, deleting: item });
    };
  
    const handleDeleteSuccess = () => setState({ ...state, deleting: false, snackbar: "Success!" });
  
    const handleDeleteClose = () => setState({ ...state, deleting: false });
  
    const handleDeleteError = (error) => setState({ ...state, snackbar: error });

    const handleEdit = path => (event) => {
      if(window.getSelection().toString()) return;
      props.navigate(path);
      event.stopPropagation();
    };

    return <WrappedComponent
      handleRequestSort={handleRequestSort}
      handleMatch={handleMatch}
      handleScroll={handleScroll}
      tableState={state}
      clearSnackbar={clearSnackbar}
      handleAdd={handleAdd}
      handleAddingClose={handleAddingClose}
      handleAddingSuccess={handleAddingSuccess}
      handleAddingError={handleAddingError}
      handleDelete={handleDelete}
      handleDeleteSuccess={handleDeleteSuccess}
      handleDeleteClose={handleDeleteClose}
      handleDeleteError={handleDeleteError}
      handleEdit={handleEdit}
      {...props}
    />;
  };

}
