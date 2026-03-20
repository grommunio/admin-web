// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { ReactNode } from 'react';
import { Table, TableBody, TableHead, TableRow } from '@mui/material';
import StyledTableCell from './StyledTableCell';
import AlternatingTableRow from '../AlternatingTableRow';
import { useTranslation } from 'react-i18next';
import { ServerZone as ServerZoneType } from '@/types/status';

type ServerZonesProps = {
  serverZones: {
    agent?: string;
    server: string | ReactNode;
    values: ServerZoneType;
  }[];
}

function ServerZones(props: ServerZonesProps) {
  const { t } = useTranslation();
  const { serverZones } = props;

  const formatBytes = (bytes: number) => {
    const exp = Math.log(bytes) / Math.log(1024) | 0;
    const res = (bytes / Math.pow(1024, exp)).toFixed(1);

    return res + '' + (exp === 0 ? ' bytes' : ' ' + 'KMGTPEZY'[exp - 1] + 'B');
  };

  return (
    <Table size="small" padding="none" style={{ marginBottom: 16 }}>
      <TableHead>
        <TableRow>
          <StyledTableCell rowSpan={2} align="center">{t("Zone")}</StyledTableCell>
          <StyledTableCell colSpan={3} align="center">{t("Requests")}</StyledTableCell>
          <StyledTableCell colSpan={6} align="center">{t("Responses")}</StyledTableCell>
          <StyledTableCell colSpan={2} align="center">{t("Traffic")}</StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell align="center">{t("Total")}</StyledTableCell>
          <StyledTableCell align="center">{t("Req/s")}</StyledTableCell>
          <StyledTableCell align="center">{t("Time")}</StyledTableCell>
          <StyledTableCell align="center">1xx</StyledTableCell>
          <StyledTableCell align="center">2xx</StyledTableCell>
          <StyledTableCell align="center">3xx</StyledTableCell>
          <StyledTableCell align="center">4xx</StyledTableCell>
          <StyledTableCell align="center">5xx</StyledTableCell>
          <StyledTableCell align="center">{t("Total")}</StyledTableCell>
          <StyledTableCell align="center">{t("Sent")}</StyledTableCell>
          <StyledTableCell align="center">{t("Rcvd")}</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {serverZones.map(({ server, values }, idx) => {
          const { responses } = values;
          return (
            <AlternatingTableRow key={idx}>
              <StyledTableCell>
                <strong>{server === '*' ? 'Any' : server === '_' ? 'Other' : server}</strong>
              </StyledTableCell>
              <StyledTableCell align="right">{values.requestCounter}</StyledTableCell>
              <StyledTableCell align="right">{values.requestMsec}</StyledTableCell>
              <StyledTableCell align="right">{values.time}</StyledTableCell>
              <StyledTableCell align="right">{responses['1xx']}</StyledTableCell>
              <StyledTableCell align="right">{responses['2xx']}</StyledTableCell>
              <StyledTableCell align="right">{responses['3xx']}</StyledTableCell>
              <StyledTableCell align="right">{responses['4xx']}</StyledTableCell>
              <StyledTableCell align="right">{responses['5xx']}</StyledTableCell>
              <StyledTableCell align="right">
                {responses['1xx'] + responses['2xx'] + responses['3xx'] +
                  responses['4xx'] + responses['5xx']}
              </StyledTableCell>
              <StyledTableCell align="right">{formatBytes(values.outBytes)}</StyledTableCell>
              <StyledTableCell align="right">{formatBytes(values.inBytes)}</StyledTableCell>
            </AlternatingTableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default ServerZones;
