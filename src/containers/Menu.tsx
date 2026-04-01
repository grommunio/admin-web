// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, TableSortLabelTypeMap } from '@mui/material';
import { selectDrawerDomain } from '../actions/drawer';
import ViewWrapper from '../components/ViewWrapper';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../store';
import { DomainListItem } from '@/types/domains';
import { useTranslation } from 'react-i18next';

interface MenuState {
  orderBy: string;
  order: string;
  sortedDomains: DomainListItem[];
}

const Menu = () => {
  const { t } = useTranslation();
  const { Domains } = useAppSelector(state => state.drawer);
  const dispatch = useAppDispatch();
  const [state, setState] = useState<MenuState>({
    orderBy: 'domainname',
    order: 'asc',
    sortedDomains: [],
  });
  const navigate = useNavigate();
  const selectDomain = (id: number) => dispatch(selectDrawerDomain(id));

  const columns = [
    { label: "Domain", value: "domainname" },
    { label: "Address", value: "address" },
    { label: "Title", value: "title" },
    { label: "Maximum users", value: "maxUser" },
  ];

  const handleNavigation = (path: number) => (event: React.MouseEvent) => {
    event.preventDefault();
    selectDomain(path);
    navigate(`/${path}`);
  };

  // Sorts table rows
  const handleSort = (orderBy: string) => () => {
    const sortedDomains = [...Domains];
    const { order: stateOrder, orderBy: stateOrderBy } = state;
    const order = stateOrderBy === orderBy && stateOrder === "asc" ? "desc" : "asc";
    if(orderBy === 'maxUser') {
      if(order === 'asc') {
        sortedDomains.sort((a, b) => a[orderBy] - b[orderBy]);
      } else {
        sortedDomains.sort((a, b) => b[orderBy] - a[orderBy]);
      }
    } else {
      if(order === 'asc') {
        sortedDomains.sort((a, b) => a[orderBy].localeCompare(b[orderBy]));
      } else {
        sortedDomains.sort((a, b) => b[orderBy].localeCompare(a[orderBy]));
      }
    }
    setState({ ...state, sortedDomains, order, orderBy });
  }

  const { orderBy, order, sortedDomains } = state;
  return (
    <ViewWrapper>
      <Paper elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.value}>
                  <TableSortLabel
                    active={orderBy === column.value}
                    direction={orderBy === column.value ? order as TableSortLabelTypeMap["props"]["direction"] : "asc"}
                    onClick={handleSort(column.value)}
                  >
                    {t(column.label)}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(sortedDomains.length > 0 ? sortedDomains : Domains).map((obj: DomainListItem, idx: number) => 
              <TableRow key={idx} hover onClick={handleNavigation(obj.ID)}>
                <TableCell>
                  {obj.domainname}{" "}
                  {obj.domainStatus === 3 ? `[${t("Deactivated")}]` : ""}
                </TableCell>
                <TableCell>{obj.address}</TableCell>
                <TableCell>{obj.title}</TableCell>
                <TableCell>{obj.maxUser}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </ViewWrapper>
  );
}


export default Menu;
