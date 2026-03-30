// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useState } from "react";
import { Checkbox, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, Theme, Tooltip, Typography } from "@mui/material";
import { deleteMailQData, fetchMailQData, flushMailQData, requeueMailQData } from "../actions/mailq";
import TableViewContainer from "../components/TableViewContainer";
import { parseUnixtime } from "../utils";
import { Delete, Replay, PlayForWork } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { makeStyles } from 'tss-react/mui';
import { useAppDispatch } from "../store";
import { ChangeEvent } from "@/types/common";


const useStyles = makeStyles()((theme: Theme) => ({
  logViewer: {
    flex: 1,
  },
  log: {
    fontSize: 16,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#bbb',
    },
  },
  paper: {
    flex: 1,
    padding: theme.spacing(2, 2, 2, 2),
  },
  divider: {
    margin: theme.spacing(2, 0, 2, 0),
  },
  header: {
    marginBottom: 8,
  },
  flexRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
}));

const MailQ = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    selected: [],
    snackbar: '',
    loading: true,
  });
  const [data, setData] = useState({
    postfixMailq: '',
    gromoxMailq: '',
    postqueue: [],
  });
  const { gromoxMailq, postqueue } = data;

  const fetch = async () => await dispatch(fetchMailQData());
  const flush = async (qIDs: string[]) => await dispatch(flushMailQData(qIDs));
  const deleteQ = async (qID: string) => await dispatch(deleteMailQData(qID));
  const requeue = async (qID: string) => await dispatch(requeueMailQData(qID));

  useEffect(() => {
    fetchData();
    const fetchInterval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => {
      clearInterval(fetchInterval);
    }
  }, []);

  const fetchData = async () => {
    const data = await fetch()
      .catch(snackbar => setState({ ...state, snackbar }));
    if(data) {
      setState({ ...state, loading: false });
      setData(data);
    }
  }

  const handleFlush = () => {
    flush(state.selected)
      .then(() => setState({ ...state, snackbar: 'Success!', selected: [] }))
      .catch(snackbar => setState({ ...state, snackbar }));
  }

  const handleDelete = () => {
    const { selected } = state;
    deleteQ(selected.length === postqueue.length  ? 'ALL' : selected.join(','))
      .then(() => setState({ ...state, snackbar: 'Success!', selected: [] }))
      .catch(snackbar => setState({ ...state, snackbar }));
  }

  const handleRequeue = () => {
    const { selected } = state;
    requeue(selected.length === postqueue.length  ? 'ALL' : selected.join(','))
      .then(() => setState({ ...state, snackbar: 'Success!', selected: [] }))
      .catch(snackbar => setState({ ...state, snackbar }));
  }

  const handleCheckAll = ({ target: t }: ChangeEvent) => setState({
    ...state,
    selected: t.checked ? postqueue.map(entry => entry.queue_id) : [],
  });

  const handleCheckbox = (qID: string) => (e: ChangeEvent) => {
    const copy = [...state.selected];
    if(e.target.checked) {
      copy.push(qID);
    } else {
      copy.splice(copy.findIndex(el => el === qID), 1);
    }
    setState({ ...state, selected: copy });
  };

  const { selected, snackbar, loading } = state;
  const actionsDisabled = selected.length === 0;
  return (
    <TableViewContainer
      headline={t("Mail queue")}
      subtitle={t("mailq_sub")}
      href="https://docs.grommunio.com/admin/administration.html#mail-queue"
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
      loading={loading}
    >  
      <div className={classes.logViewer}>
        <Paper elevation={1} className={classes.paper}>
          <Typography variant="h6" className={classes.header}>Postfix {t("mail queue")}</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={postqueue.length > 0 && postqueue.length === selected.length}
                    onChange={handleCheckAll}
                  />
                </TableCell>
                <TableCell>{t("Queue ID")}</TableCell>
                <TableCell>{t("Queue name")}</TableCell>
                <TableCell>{t("Arrival time")}</TableCell>
                <TableCell>{t("Sender")}</TableCell>
                <TableCell>{t("Recipients")}</TableCell>
                <TableCell className={classes.flexRow}>
                  <Tooltip title={t("Flush mail queue")}>
                    <span>
                      <IconButton disabled={actionsDisabled} onClick={handleFlush}>
                        <PlayForWork color={actionsDisabled ? "secondary" : "primary"} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t("Requeue")}>
                    <span>
                      <IconButton disabled={actionsDisabled} onClick={handleRequeue}>
                        <Replay color={actionsDisabled ? "secondary" : "warning"} style={{ transform: 'rotate(180deg)' }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t("Delete")}>
                    <span>
                      <IconButton disabled={actionsDisabled} onClick={handleDelete}>
                        <Delete color={actionsDisabled ? "secondary" : "error"} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {postqueue.map(entry => {
                const id = entry.queue_id;
                const rowSelected = selected.includes(id)
                return (
                  <TableRow key={entry.queue_id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        onChange={handleCheckbox(id)}
                        checked={rowSelected}
                        value={rowSelected}
                      />
                    </TableCell>
                    <TableCell>{id}</TableCell>
                    <TableCell>{entry.queue_name}</TableCell>
                    <TableCell>{parseUnixtime(entry.arrival_time)}</TableCell>
                    <TableCell>{entry.sender}</TableCell>
                    <TableCell>
                      {(entry.recipients || []).map((r: any) => <p key={r.address}>{r.address + ' (' + r.delay_reason + ')'}</p>)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
        <Paper elevation={1} className={classes.paper}>
          <Typography variant="h6" className={classes.header}>Gromox {t("mail queue")}</Typography>
          <pre
            className={classes.log}
          >
            {gromoxMailq}
          </pre>
        </Paper>
      </div>
    </TableViewContainer>
  );
}


export default MailQ;
