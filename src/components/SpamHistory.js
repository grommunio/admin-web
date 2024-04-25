// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpamHistory } from '../actions/spam';
import PropTypes from 'prop-types';
import { Divider, List, ListItem, ListItemButton, ListItemText, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, TextField, Typography } from '@mui/material';
import { withStyles } from '@mui/styles';
import { dateTimeFromUnix, dayTimeFromUnix } from '../utils';


const styles = {
  paper: {
    flex: 1,
    height: '100%',
    display: 'flex',
  },
  list: {
    maxWidth: 472,
    flex: 1,
    height: 0,
    minHeight: '100%',
    overflowY: 'auto',
  },
  tc: {
    height: 24,
  },
  details: {
    padding: 8,
    flex: 1,
  },
  dots: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  }
}

const SpamHistory = ({ classes, setSnackbar }) => {
  const dispatch = useDispatch();
  const { history } = useSelector(state => state.spam);
  const [selectedMail, setSelectedMail] = useState(null);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('');
  const [sortedTable, setSortedTable] = useState([]);
  const [search, setSearch] = useState("");

  const handleRequestSort = (property) => () => {
    const isAsc = orderBy === property && order === 'asc';
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
    dispatch(fetchSpamHistory())
      .catch(setSnackbar);
  }, []);

  const handleMail = mail => () => {
    setSortedTable([]);
    setSelectedMail(mail);
  }

  const getScoreColor = score => {
    if(score <= 0) return "#2471a8";
    if(score <= 0.1) return "#9e2e2e";
    if(score <= 3) return "#772222";
    return "#4f1717";
  }

  const headCells = [
    {
      id: 'name',
      label: 'Name',
    },
    {
      id: 'score',
      label: 'Score',
    },
    {
      id: 'description',
      label: 'Description',
    },
  ];

  const handleSearch = (e) => {
    setSearch(e.target.value);
  }

  const filteredMails = useMemo(() => history.rows.filter(r => {
    const s = search.toLowerCase();
    return r.subject.toLowerCase().includes(s) || r.sender_smtp.toLowerCase().includes(s);
  }), [history.rows, search]);

  const generateSublists = useMemo(() => {
    const sublists = {};
    for(let i = 0; i < filteredMails.length; i++) {
      const date = dateTimeFromUnix(filteredMails[i].unix_time);
      if(sublists[date]) {
        sublists[date].push(filteredMails[i]);
      } else {
        sublists[date] = [filteredMails[i]];
      }
    }
    return sublists;
  }, [filteredMails]);

  return (
    <Paper className={classes.paper}>
      <List className={classes.list}>
        <TextField
          label="Search"
          value={search}
          onChange={handleSearch}
          sx={{ mx: 1, width: 456 }}
        />
        <ListItem>
          <ListItemText
            primary={<div style={{ display: 'flex' }}>
              <Typography sx={{ width: 200 }}>Sender</Typography>
              <Divider sx={{ mx: 1 }} orientation="vertical" flexItem />
              <Typography align='center' sx={{ width: 42 }}>Score</Typography>
              <Divider sx={{ mx: 1 }} orientation="vertical" flexItem />
              <Typography align='center' sx={{ width: 72 }}>Size (KB)</Typography>
              <Divider sx={{ mx: 1 }} orientation="vertical" flexItem />
              <Typography>Time</Typography>
            </div>}
          />
        </ListItem>
        {Object.entries(generateSublists).map(([date, mails]) => <Fragment key={date}>
          <Typography variant='h6' sx={{ mt: 1, ml: 1 }}>{date}</Typography>
          {mails.map((row, key) => <ListItemButton
            divider
            key={key}
            onClick={handleMail(row)}
            selected={selectedMail?.["message-id"] === row["message-id"]}
          >
            <ListItemText
              primary={<div style={{ display: 'flex' }}>
                <Typography className={classes.dots} sx={{ width: 200 }}>
                  {row.sender_smtp}
                </Typography>
                <Divider sx={{ mx: 1 }} orientation="vertical" flexItem />
                <Typography align='right' sx={{ width: 42 }}>{row.score}</Typography>
                <Divider sx={{ mx: 1 }} orientation="vertical" flexItem />
                <Typography align="right" sx={{ width: 72 }}>{Math.ceil(row.size / 1000)}</Typography>
                <Divider sx={{ mx: 1 }} orientation="vertical" flexItem />
                <Typography>{dayTimeFromUnix(row.unix_time)}</Typography>
              </div>}
              secondary={row.subject}
            />
          </ListItemButton>)}
        </Fragment>
        )}  
      </List>
      <Divider orientation='vertical' />
      {selectedMail && <div className={classes.details}>
        <Typography color="primary">Selected Mail</Typography>
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
                    {headCell.label}
                  </TableSortLabel>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {(sortedTable.length > 0 ? sortedTable : Object.values(selectedMail.symbols)).map((row, key) =>
              <TableRow key={key}>
                <TableCell>{row.name}</TableCell>
                <TableCell sx={{ backgroundColor: getScoreColor(row.score) }}>{row.score}</TableCell>
                <TableCell>{row.description}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>}
    </Paper>
  )
};

SpamHistory.propTypes = {
  classes: PropTypes.object.isRequired,
  setSnackbar: PropTypes.func.isRequired,
}

export default withStyles(styles)(SpamHistory);
