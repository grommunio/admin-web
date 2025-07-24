// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

/* eslint-disable react/display-name */
import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withStyles } from 'tss-react/mui';
import { defaultFetchLimit } from '../constants';
import { useNavigate } from 'react-router';
import { throttle } from 'lodash';

export default function withStyledReduxTable(mapState, mapDispatch, styles) {
  return (wrappedComponent, defaultState) => connect(mapState, mapDispatch)(
    withTranslation()(withStyles(withTable(wrappedComponent, defaultState), styles)));
}

function withTable(WrappedComponent, defaultState={}) {

  return function inner(props) {
    const [state, setState] = useState({
      orderBy: 'name',
      order: 'asc',
      snackbar: '',
      adding: false,
      deleting: false,
      ...defaultState,
    });
    const [offset, setOffset] = useState(0);
    const [match, setMatch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
      if(!defaultState.suppressFetch) fetchData();
    }, []);
  
    const fetchData = (params={}) => {
      const { domain, fetchTableData } = props;
      const { order, orderBy } = state;
      if(domain?.ID) {
        fetchTableData(domain.ID, { sort: orderBy + "," + order, ...params})
          .catch((msg) => {
            setState({ ...state, snackbar: msg });
          });
      } else {
        fetchTableData({ sort: orderBy + "," + order, ...params})
          .catch((msg) => {
            setState({ ...state, snackbar: msg });
          });
      }
    }

    const handleRequestSort = (orderBy, additionalProps={}) => () => {
      const { order: stateOrder, orderBy: stateOrderBy } = state;
      const order =
        stateOrderBy === orderBy && stateOrder === "asc" ? "desc" : "asc";
  
      fetchData({
        sort: orderBy + "," + order,
        match: match || undefined,
        ...additionalProps,
      });
  
      setState({
        ...state, 
        order: order,
        orderBy: orderBy,
      });
      setOffset(0);
    };

    const handleScroll = (data, count, additionalProps={}) => {
      if (data.length >= count) return;
      if (
        Math.floor(
          document.getElementById("scrollDiv").scrollHeight -
            document.getElementById("scrollDiv").scrollTop
        ) <=
        document.getElementById("scrollDiv").offsetHeight + 100
      ) {
        const { orderBy, order } = state;
        const newOffset = offset + defaultFetchLimit;
        setOffset(newOffset);
        fetchData({
          sort: orderBy + "," + order,
          offset: newOffset,
          match: match || undefined,
          ...additionalProps,
        });
      }
    };

    const clearSnackbar = () => setState({
      ...state,
      snackbar: '',
    });

    const handleMatch = (e, additionalProps={}) => {
      setOffset(0);
      const { value } = e.target;
      setMatch(value);
      debouceFetch(value, additionalProps);
    };
  
    const debouceFetch = useCallback(throttle((value, additionalProps={}) => {
      fetchData({
        match: value || undefined,
        ...additionalProps,
      });
    }, 200), []);

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
      navigate(path);
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
