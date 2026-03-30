// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchSpamHistory } from '../actions/spam';
import { Chip, ChipTypeMap, Divider, FormControlLabel, Grid2, IconButton, Paper, SortDirection, Switch, Table, TableBody, TableCell, TableHead,
  TableRow, TableSortLabel, TableSortLabelTypeMap, Tooltip, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { copyToClipboard, parseUnixtime } from '../utils';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DataGrid } from '@mui/x-data-grid';
import { Close, CopyAll, Refresh } from '@mui/icons-material';
import SearchTextfield from './SearchTextfield';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store';
import { ChangeEvent } from '@/types/common';
import { Moment } from 'moment';
import { AntiSpamRow, SpamAction } from '@/types/antispam';


const useStyles = makeStyles()(() => ({
  paper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  flexContainer: {
    display: 'flex',
    flex: 1,
  },
  details: {
    padding: 8,
    flex: 1,
  },
  selectedMailTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomNavigation: {
    backgroundImage: 'none !important',
  }
}));

const getActionColor = (action: SpamAction) => {
  return {
    "no action": "success",
    "add header": "warning",
    "greylist": "info",
    "reject": "error",
  }[action] as ChipTypeMap["props"]["color"];
}

type SpamHistoryType = {
  setSnackbar: (msg: string) => void;
}

const SpamHistory = ({ setSnackbar }: SpamHistoryType) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { history } = useAppSelector(state => state.spam);
  const [selectedMail, setSelectedMail] = useState(null);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('');
  const [sortedTable, setSortedTable] = useState([]);
  const [search, setSearch] = useState("");
  const [until, setUntil] = useState(null);
  const [since, setSince] = useState(null);
  const [autorefresh, setAutorefresh] = useState(false);

  const fetchInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const columns = useMemo(() => [
    {
      field: 'action',
      headerName: t('Action'),
      width: 100,
      renderCell: (params: { row: AntiSpamRow }) => (
        <Chip size='small' color={getActionColor(params.row.action)} label={params.row.action}/>
      ),
    },
    {
      field: 'unix_time',
      headerName: t('Time'),
      width: 200,
      valueFormatter: (value: number) => parseUnixtime(value),
    },
    { field: 'sender_smtp', headerName: 'From', width: 200 },
    {
      field: 'rcpt_smtp',
      headerName: t('To'),
      width: 200,
    },
    {
      field: 'subject',
      headerName: t('Subject'),
      width: 200,
    },
    {
      field: 'ip',
      headerName: t('IP'),
      width: 100,
    },
    {
      field: 'score',
      headerName: t('Score'),
      width: 110,
    },
    {
      field: 'size',
      headerName: t('Size'),
      valueFormatter: (value: number) => Math.ceil(value / 1000) + " KB",
    },
    {
      field: 'time_real',
      headerName: t('Time real'),
      width: 110,
      valueFormatter: (value: number) => value.toFixed(3) + "s",
    },
    {
      field: 'message-id',
      headerName: t('Message-ID'),
      width: 250,
    }
  ], []);

  const handleRequestSort = (property: keyof AntiSpamRow, explicitOrder?: string) => () => {
    const isAsc = explicitOrder === "asc" || (orderBy === property && order === 'asc');
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    
    const sorted = [...Object.values(selectedMail.symbols)] as AntiSpamRow[];
    if(property === 'score') {
      sorted.sort((a, b) => isAsc ? b.score - a.score : a.score - b.score);
    } else {
      sorted.sort((a, b) => isAsc ?
        (b[property] || "").toString().localeCompare(a[property].toString() || "") :
        (a[property] || "").toString().localeCompare(b[property].toString() || ""));
    }
    setSortedTable(sorted);
  };
  
  useEffect(() => {
    handleRefresh();
  }, []);

  const handleMail = (e: { row: AntiSpamRow }) => {
    setSelectedMail(e.row);
  }

  // When selecting a mail, sort by score
  useEffect(() => {
    if(selectedMail) handleRequestSort("score", "asc")();
  }, [selectedMail])

  const getScoreColor = (score: number) => {
    if(score <= 0) return "#2471a8";
    if(score <= 0.1) return "#9e2e2e";
    if(score <= 3) return "#772222";
    return "#4f1717";
  }

  const headCells = [
    {
      id: 'score',
      label: 'Score',
      numeric: true,
    },
    {
      id: 'name',
      label: 'Name',
      numeric: false,
    },
    {
      id: 'description',
      label: 'Description',
      numeric: false,
    },
  ];

  const handleSearch = (e: ChangeEvent) => {
    setSearch(e.target.value);
  }

  const handleDate = (stateHandler: React.Dispatch<React.SetStateAction<Moment>>) => (newVal: Moment) => {
    stateHandler(newVal);
  }

  const handleCopy = () => {
    const success = copyToClipboard(selectedMail["message-id"]);
    if(success) {
      setSnackbar("Success! Message-ID copied to clipboard");
    }
  }

  const filteredMails = useMemo(() => {
    const s = search.toLowerCase();
    const midnightSince = since?.clone().set({ "hour": 0, "minute": 0 }).unix();
    const midnightUntil = until?.clone().set({ "hour": 23, "minute": 59 }).unix();
    return history.rows.filter((r: AntiSpamRow) => {
      return (r.subject.toLowerCase().includes(s)
        || r.sender_smtp.toLowerCase().includes(s)
        || r.rcpt_smtp.toLowerCase().includes(s)
        || r["message-id"].toLowerCase().includes(s)) &&
        (since ? r.unix_time - midnightSince >= 0 : true) &&
        (until ? r.unix_time - midnightUntil < 0 : true);
    })
  }, [history.rows, search, since, until]);

  const handleAutoRefresh = ({ target: t }: ChangeEvent) => {
    setAutorefresh(t.checked);
  }

  const handleRefresh = async () => {
    dispatch(fetchSpamHistory())
      .catch(setSnackbar);
  }

  useEffect(() => {
    if(autorefresh) fetchInterval.current = setInterval(() => {
      handleRefresh();
    }, 5000);
    else clearInterval(fetchInterval.current);

    return () => {
      clearInterval(fetchInterval.current);
    }
  }, [autorefresh]);

  return (
    <Paper className={classes.paper}>
      <div style={{ display: 'flex' }}>
        <SearchTextfield
          value={search}
          placeholder={t("Search")}
          onChange={handleSearch}
          sx={{ m: 1, width: 400 }}
        />
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DatePicker
            label={t("Since")}
            sx={{ m: 1, minWidth: 200 }}
            value={since}
            onChange={handleDate(setSince)}
            disableFuture
            slotProps={{
              field: { clearable: true, onClear: () => setSince(null) },
            }}
          />
          <DatePicker
            label={t("Until")}
            sx={{ m: 1, minWidth: 200 }}
            value={until}
            onChange={handleDate(setUntil)}
            slotProps={{
              field: { clearable: true, onClear: () => setUntil(null) },
            }}
          />
        </LocalizationProvider>
        {<Grid2 container justifyContent="flex-end">
          <IconButton onClick={handleRefresh} style={{ marginRight: 8 }} size="large">
            <Refresh />
          </IconButton>
          <FormControlLabel
            control={
              <Switch
                checked={autorefresh}
                onChange={handleAutoRefresh}
                name="autorefresh"
                color="primary"
              />
            }
            label={t("Autorefresh")}
          />
        </Grid2>}
      </div>
      <div className={classes.flexContainer}>
        <DataGrid
          rows={filteredMails}
          columns={columns}
          onRowClick={handleMail}
          classes={{
            panelFooter: classes.bottomNavigation,
            toolbarContainer: classes.bottomNavigation,
          }}
          sx={filteredMails.length > 0 ? {
            "& .MuiDataGrid-virtualScrollerContent": {
              height: "52px !important",
            },
            "& .MuiDataGrid-scrollbar--horizontal": {
              height: 2,
            }
          } : null}
        />
        <Divider orientation='vertical'/>
        {selectedMail && <div className={classes.details}>
          <div className={classes.selectedMailTitle}>
            <Typography color="primary" variant='h6'>
              {t("Selected Mail")}
            </Typography>
            <IconButton onClick={() => setSelectedMail(null)}>
              <Close />
            </IconButton>
          </div>
          <Typography variant='caption'>
            Message ID: {selectedMail["message-id"]}
            <Tooltip placement="top" title={t('Copy')}>
              <IconButton onClick={handleCopy} size="large">
                <CopyAll />
              </IconButton>
            </Tooltip>
          </Typography>
          <Table size='small'>
            <TableHead>
              <TableRow>
                {headCells.map(headCell =>
                  <TableCell
                    key={headCell.id}
                    align={headCell.numeric ? 'right' : 'left'}
                    sortDirection={orderBy === headCell.id ? order as SortDirection : false}
                  >
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order as TableSortLabelTypeMap["props"]["direction"] : 'asc'}
                      onClick={handleRequestSort(headCell.id as keyof AntiSpamRow)}
                    >
                      {t(headCell.label)}
                    </TableSortLabel>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {(sortedTable.length > 0 ? sortedTable : Object.values(selectedMail.symbols)).map((row, key) =>
                <TableRow key={key}>
                  <TableCell sx={{ backgroundColor: getScoreColor(row.score), color: "white" }}>
                    {row.score}
                  </TableCell>
                  <TableCell>
                    {row.name}
                    {row.options && <span style={{ marginLeft: 4, fontStyle: "italic" }}>
                      ({row.options.join(", ")})
                    </span>}
                  </TableCell>
                  <TableCell>{row.description}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>{selectedMail.score}</TableCell>
                <TableCell>Spamscore</TableCell>
                <TableCell>Total spamscore</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>}
      </div>
    </Paper>
  )
};


export default SpamHistory;
