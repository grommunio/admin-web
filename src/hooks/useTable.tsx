import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { throttle } from 'lodash';
import { DEFAULT_FETCH_LIMIT } from '../constants';

type Order = 'asc' | 'desc';

interface UseTableOptions {
  fetchTableData: (...args: any[]) => Promise<any>;
  domain?: { ID?: string | number };
  defaultState?: Partial<TableState>;
}

interface TableState {
  orderBy: string;
  order: Order;
  snackbar: string;
  adding: boolean;
  deleting: any;
  match?: string;
  loading?: boolean;
  [key: string]: any;
}

export function useTable<T>({
  fetchTableData,
  domain,
  defaultState = {},
}: UseTableOptions) {
  const [state, setState] = useState<TableState>({
    orderBy: 'name',
    order: 'asc',
    snackbar: '',
    adding: false,
    deleting: false,
    ...defaultState,
  });

  const [offset, setOffset] = useState(0);
  const [match, setMatch] = useState('');
  const navigate = useNavigate();

  const fetchData = (params: Record<string, any> = {}) => {
    const { order, orderBy } = state;

    const request = domain?.ID
      ? fetchTableData(domain.ID, { sort: `${orderBy},${order}`, ...params })
      : fetchTableData({ sort: `${orderBy},${order}`, ...params });

    return request.catch((msg: string) => {
      setState((prev) => ({ ...prev, snackbar: msg }));
    });
  };

  useEffect(() => {
    if (!defaultState.suppressFetch) fetchData();
  }, []);

  const handleRequestSort =
    (orderBy: string, additionalProps: object = {}) =>
      () => {
        setState((prev) => {
          const order: Order =
          prev.orderBy === orderBy && prev.order === 'asc'
            ? 'desc'
            : 'asc';

          fetchData({
            sort: `${orderBy},${order}`,
            match: match || undefined,
            ...additionalProps,
          });

          return { ...prev, order, orderBy };
        });

        setOffset(0);
      };

  const handleScroll = (
    data: T[],
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
      const newOffset = offset + DEFAULT_FETCH_LIMIT;

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
    const value = e.target.value;
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

  const handleDelete = (item: T) => (event: React.MouseEvent) => {
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

  return {
    tableState: { ...state, match },
    handleRequestSort,
    handleMatch,
    handleScroll,
    clearSnackbar,
    handleAdd,
    handleAddingClose,
    handleAddingSuccess,
    handleAddingError,
    handleDelete,
    handleDeleteSuccess,
    handleDeleteClose,
    handleDeleteError,
    handleEdit,
  };
}