// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpamHistory } from '../actions/spam';
import PropTypes from 'prop-types';
import { Chip, Divider, FormControlLabel, Grid2, IconButton, Paper, Switch, Table, TableBody, TableCell, TableHead,
  TableRow, TableSortLabel, Tooltip, Typography } from '@mui/material';
import { withStyles } from 'tss-react/mui';
import { copyToClipboard, parseUnixtime } from '../utils';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DataGrid } from '@mui/x-data-grid';
import { Close, CopyAll, Refresh } from '@mui/icons-material';
import SearchTextfield from './SearchTextfield';
import { useTranslation } from 'react-i18next';


const styles = {
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
};

const getActionColor = action => {
  return {
    "no action": "success",
    "add header": "warning",
    "greylist": "info",
    "reject": "error",
  }[action];
}

const columns = t => [
  {
    field: 'action',
    headerName: t('Action'),
    width: 100,
    renderCell: (params) => (
      <Chip size='small' color={getActionColor(params.row.action)} label={params.row.action}/>
    ),
  },
  {
    field: 'unix_time',
    headerName: t('Time'),
    width: 200,
    valueFormatter: (value) => parseUnixtime(value),
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
    type: 'number',
    width: 110,
  },
  {
    field: 'size',
    headerName: t('Size'),
    type: 'number',
    valueFormatter: (value) => Math.ceil(value / 1000) + " KB",
  },
  {
    field: 'time_real',
    headerName: t('Time real'),
    type: 'number',
    width: 110,
    valueFormatter: (value) => value.toFixed(3) + "s",
  },
  {
    field: 'message-id',
    headerName: t('Message-ID'),
    width: 250,
  }
];

const SpamHistory = ({ classes, setSnackbar }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { history } = useSelector(state => state.spam);
  const [selectedMail, setSelectedMail] = useState(null);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('');
  const [sortedTable, setSortedTable] = useState([]);
  const [search, setSearch] = useState("");
  const [until, setUntil] = useState(null);
  const [since, setSince] = useState(null);
  const [autorefresh, setAutorefresh] = useState(false);


  const handleRequestSort = (property, explicitOrder) => () => {
    const isAsc = explicitOrder === "asc" || (orderBy === property && order === 'asc');
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    
    const sorted = [...Object.values(selectedMail.symbols)];
    if(property === 'score') {
      sorted.sort((a, b) => isAsc ? b.score - a.score : a.score - b.score);
    } else {
      sorted.sort((a, b) => isAsc ?
        (b[property] || "").localeCompare(a[property] || "") :
        (a[property] || "").localeCompare(b[property] || ""));
    }
    setSortedTable(sorted);
  };
  
  useEffect(() => {
    handleRefresh();
  }, []);

  const handleMail = e => {
    setSelectedMail(e.row);
  }

  // When selecting a mail, sort by score
  useEffect(() => {
    if(selectedMail) handleRequestSort("score", "asc")();
  }, [selectedMail])

  const getScoreColor = score => {
    if(score <= 0) return "#2471a8";
    if(score <= 0.1) return "#9e2e2e";
    if(score <= 3) return "#772222";
    return "#4f1717";
  }

  const headCells = [
    {
      id: 'score',
      label: 'Score',
    },
    {
      id: 'name',
      label: 'Name',
    },
    {
      id: 'description',
      label: 'Description',
    },
  ];

  const handleSearch = (e) => {
    setSearch(e.target.value);
  }

  const handleDate = stateHandler => newVal => {
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
    return history.rows.filter(r => {
      return (r.subject.toLowerCase().includes(s)
        || r.sender_smtp.toLowerCase().includes(s)
        || r.rcpt_smtp.toLowerCase().includes(s)
        || r["message-id"].toLowerCase().includes(s)) &&
        (since ? r.unix_time - midnightSince >= 0 : true) &&
        (until ? r.unix_time - midnightUntil < 0 : true);
    })
  }, [history.rows, search, since, until]);

  const handleAutoRefresh = ({ target: t }) => {
    setAutorefresh(t.checked);
  }

  const handleRefresh = async () => {
    dispatch(fetchSpamHistory())
      .catch(setSnackbar);
  }

  useEffect(() => {
    let fetchInterval;

    if(autorefresh) fetchInterval = setInterval(() => {
      handleRefresh();
    }, 5000);
    else clearInterval(fetchInterval);

    return () => {
      clearInterval(fetchInterval);
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
          columns={columns(t)}
          onRowClick={handleMail}
          classes={{
            virtualScrollerContent: classes.virtualList,
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
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={handleRequestSort(headCell.id)}
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

SpamHistory.propTypes = {
  classes: PropTypes.object.isRequired,
  setSnackbar: PropTypes.func.isRequired,
}

export default withStyles(SpamHistory, styles);
