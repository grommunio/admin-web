// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

/* eslint-disable react/display-name */
import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withStyles } from 'tss-react/mui';
import { defaultFetchLimit } from '../constants';
import { useNavigate } from 'react-router';
import { throttle } from 'lodash';


type Order = 'asc' | 'desc';

interface TableState {
  orderBy: string;
  order: Order;
  snackbar: string;
  adding: boolean;
  deleting: any;
  suppressFetch?: boolean;
  [key: string]: any;
}

interface InjectedTableProps {
  handleRequestSort: (orderBy: string, additionalProps?: object) => () => void;
  handleMatch: (e: React.ChangeEvent<HTMLInputElement>, additionalProps?: object) => void;
  handleScroll: (data: any[], count: number, additionalProps?: object) => void;
  tableState: TableState;
  clearSnackbar: () => void;
  handleAdd: () => void;
  handleAddingClose: () => void;
  handleAddingSuccess: () => void;
  handleAddingError: (error: string) => void;
  handleDelete: (item: any) => (event: React.MouseEvent) => void;
  handleDeleteSuccess: () => void;
  handleDeleteClose: () => void;
  handleDeleteError: (error: string) => void;
  handleEdit: (path: string) => (event: React.MouseEvent) => void;
}


export default function withStyledReduxTable(
  mapState: any,
  mapDispatch: any,
  styles: any
) {
  return function (WrappedComponent: any, defaultState: Partial<TableState> = {}) {
    const component = withTable(WrappedComponent, defaultState);

    const styled = withStyles(component, styles);
    const translated = withTranslation()(styled) as React.ComponentType<any>;

    return connect(mapState, mapDispatch)(translated);
  };
}


function withTable<P extends InjectedTableProps>(
  WrappedComponent: React.ComponentType<P>,
  defaultState: Partial<TableState> = {}
) {
  return function Inner(props: Omit<P, keyof InjectedTableProps> & any) {
    const [state, setState] = useState<TableState>({
      orderBy: 'name',
      order: 'asc',
      snackbar: '',
      adding: false,
      deleting: false,
      ...defaultState,
    });

    const [offset, setOffset] = useState<number>(0);
    const [match, setMatch] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
      if (!defaultState.suppressFetch) fetchData();
    }, []);

    const fetchData = (params: Record<string, any> = {}) => {
      const { domain, fetchTableData } = props as any;
      const { order, orderBy } = state;

      const request = domain?.ID
        ? fetchTableData(domain.ID, { sort: `${orderBy},${order}`, ...params })
        : fetchTableData({ sort: `${orderBy},${order}`, ...params });

      request.catch((msg: string) => {
        setState((prev) => ({ ...prev, snackbar: msg }));
      });
    };

    const handleRequestSort =
      (orderBy: string, additionalProps: object = {}) =>
        () => {
          const { order: stateOrder, orderBy: stateOrderBy } = state;

          const order: Order =
          stateOrderBy === orderBy && stateOrder === 'asc'
            ? 'desc'
            : 'asc';

          fetchData({
            sort: `${orderBy},${order}`,
            match: match || undefined,
            ...additionalProps,
          });

          setState((prev) => ({
            ...prev,
            order,
            orderBy,
          }));

          setOffset(0);
        };

    const handleScroll = (
      data: any[],
      count: number,
      additionalProps: object = {}
    ) => {
      if (data.length >= count) return;

      const el = document.getElementById('scrollDiv');
      if (!el) return;

      if (
        Math.floor(el.scrollHeight - el.scrollTop) <=
        el.offsetHeight + 100
      ) {
        const { orderBy, order } = state;
        const newOffset = offset + defaultFetchLimit;

        setOffset(newOffset);

        fetchData({
          sort: `${orderBy},${order}`,
          offset: newOffset,
          match: match || undefined,
          ...additionalProps,
        });
      }
    };

    const clearSnackbar = () =>
      setState((prev) => ({ ...prev, snackbar: '' }));

    const debouncedFetch = useCallback(
      throttle((value: string, additionalProps: object = {}) => {
        fetchData({
          match: value || undefined,
          ...additionalProps,
        });
      }, 200),
      []
    );

    const handleMatch = (
      e: React.ChangeEvent<HTMLInputElement>,
      additionalProps: object = {}
    ) => {
      const { value } = e.target;

      setOffset(0);
      setMatch(value);
      debouncedFetch(value, additionalProps);
    };

    const handleAdd = () =>
      setState((prev) => ({ ...prev, adding: true }));

    const handleAddingClose = () =>
      setState((prev) => ({ ...prev, adding: false }));

    const handleAddingSuccess = () =>
      setState((prev) => ({
        ...prev,
        adding: false,
        snackbar: 'Success!',
      }));

    const handleAddingError = (error: string) =>
      setState((prev) => ({ ...prev, snackbar: error }));

    const handleDelete =
      (item: any) => (event: React.MouseEvent) => {
        event.stopPropagation();
        setState((prev) => ({ ...prev, deleting: item }));
      };

    const handleDeleteSuccess = () =>
      setState((prev) => ({
        ...prev,
        deleting: false,
        snackbar: 'Success!',
      }));

    const handleDeleteClose = () =>
      setState((prev) => ({ ...prev, deleting: false }));

    const handleDeleteError = (error: string) =>
      setState((prev) => ({ ...prev, snackbar: error }));

    const handleEdit =
      (path: string) => (event: React.MouseEvent) => {
        if (window.getSelection()?.toString()) return;
        navigate(path);
        event.stopPropagation();
      };

    return (
      <WrappedComponent
        {...(props as P)}
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
      />
    );
  };
}