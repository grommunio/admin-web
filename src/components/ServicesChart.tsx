// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from "react";
import { makeStyles } from 'tss-react/mui';
import { Typography, IconButton, CircularProgress, Paper, Table, TableHead, 
  TableRow, TableCell, TableBody, Tooltip, Grid2, 
  Theme} from "@mui/material";
import Stop from "@mui/icons-material/HighlightOff";
import Restart from "@mui/icons-material/Replay";
import Start from "@mui/icons-material/PlayCircleFilledOutlined";
import Enable from "@mui/icons-material/PowerSettingsNew";
import { useTranslation } from "react-i18next";
import Feedback from "./Feedback";
import ConfirmRestartStop from "./Dialogs/ConfirmRestartStop";
import { fetchServicesData, serviceAction } from '../actions/services';
import { setDateTimeString } from "../utils";
import { useAppDispatch, useAppSelector } from "../store";
import { Service } from "@/types/dashboard";


const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  paper: {
    flex: 1,
  },
  servicePaper: {
    display: "flex",
    flexWrap: "wrap",
    borderRadius: 8,
    padding: theme.spacing(0, 0, 2, 0),
    [theme.breakpoints.down('md')]: {
      justifyContent: "center",
    },
  },
  serviceContainer: {
    margin: theme.spacing(1, 2, 1, 2),
  },
  serviceBox: {
    width: 232,
    borderRadius: 25,
    padding: "2px 10px 2px 15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "default",
    transition: "transform 0.2s ease",

    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  chipIcon: {
    padding: 6,
  },
  label: {
    padding: '2px 4px',
    borderRadius: 25,
    maxWidth: 80,
    margin: 0,
    textAlign: 'center',
    fontSize: 12,
  },
  active: {
    color: "#fff",
    background: "linear-gradient(150deg, #56ab2f, #a8e063)",
  },
  error: {
    color: "#fff",
    fontWeight: "bold",
    background: "linear-gradient(150deg, #FF512F, #DD2476)",
  },
  inactive: {
    color: "white",
    background: "linear-gradient(150deg, #000000, #434343)",
  },
  failed: {
    background: "linear-gradient(150deg, #FF512F, #DD2476)",
  },
  activating: {
    background: "linear-gradient(150deg, #FFB75E, #ED8F03)",
  },
  deactivating: {
    background: "linear-gradient(150deg, #F2F2F2, #EAEAEA)",
  },
  legendContainer: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 10px",
  },
  rectangle: {
    display: "inline-block",
    width: 15,
    height: 10,
    marginRight: 5,
    backgroundColor: "#abc",
  },
  serviceName: {
    fontWeight: 400,
  },
}));

const ServicesChart = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Services } = useAppSelector(state => state.services);
  const [state, setState] = useState({
    snackbar: "",
    starting: "",
    restarting: "",
    stopping: "",
    action: '',
  });
  const [service, setService] = useState<Service | null>(null);

  const handleServiceAction = (service: Service, action: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setState({ ...state, [action + "ing"]: service.name });
    dispatch(serviceAction(service.unit, action))
      .then(() => {
        setState({ ...state, [action + "ing"]: false });
        handleCloseDialog();
        setTimeout(() => {
          dispatch(fetchServicesData()).catch(e => e);
        }, 3000);
      })
      .catch((msg) =>
        setState({ ...state, snackbar: msg, [action + "ing"]: false })
      );
  };

  const getChipColor = (state: keyof typeof classes) => {
    return classes[(state || "inactive")];
  }

  const handleDialog = (service: Service, action: string) => () => {
    setState({ ...state, action });
    setService(service);
  }

  const handleCloseDialog = () => setService(null);

  const { starting, restarting, stopping, snackbar, action } = state;
  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                {t("Service")}
              </TableCell>
              <TableCell align="center" style={{ width: 124 }}>
                {t("State | Autostart")}
              </TableCell>
              <TableCell align="center" style={{ width: 132 }}>
                {t("Actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Services.map((service: Service, idx: number) => (
              <TableRow key={idx} hover style={{cursor: "default"}}>
                <TableCell>
                  <Tooltip
                    title={service.description ? <>
                      <Typography>{service.description}</Typography>
                      <Typography variant="caption">
                        {service.since ? `${t('since')} ${setDateTimeString(service.since)}` : ''}
                      </Typography>
                    </> : ''}
                    placement="top"
                  >
                    <Typography className={classes.serviceName}>
                      {service.name}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Grid2 container justifyContent="center">
                    <div
                      style={{ marginRight: 4 }}
                      className={classes.label + " " + getChipColor(service.state as keyof typeof classes)}
                    >
                      {service.state}
                    </div>
                    <div className={classes.label + " " +
                        getChipColor(service.autostart === "enabled" ? "active" : "error")}>
                      {service.autostart || 'error'}
                    </div>
                  </Grid2>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={t("Enable/Disable")} placement="top">
                    <IconButton
                      onClick={handleServiceAction(service, service.autostart === "enabled" ? 
                        "disable" : "enable")}
                      className={classes.chipIcon}
                      size="large">
                      <Enable fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {stopping !== service.name ? (
                    <Tooltip title={t("Stop")} placement="top">
                      <IconButton
                        onClick={handleDialog(service, "stop")}
                        className={classes.chipIcon}
                        size="large">
                        <Stop  fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <IconButton className={classes.chipIcon} size="large">
                      <CircularProgress size={18} />
                    </IconButton>
                  )}
                  {restarting !== service.name ? (
                    <Tooltip title={t("Restart")}placement="top">
                      <IconButton
                        onClick={handleDialog(service, "restart")}
                        className={classes.chipIcon}
                        size="large">
                        <Restart
                          fontSize="small"
                        />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <IconButton className={classes.chipIcon} size="large">
                      <CircularProgress size={18} />
                    </IconButton>
                  )}
                  {starting !== service.name ? (
                    <Tooltip title={t("Start")} placement="top">
                      <IconButton
                        onClick={handleServiceAction(service, "start")}
                        className={classes.chipIcon}
                        size="large">
                        <Start fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <IconButton className={classes.chipIcon} size="large">
                      <CircularProgress size={18} />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      {service && 
        <ConfirmRestartStop
          open={!!service}
          handleConfirm={handleServiceAction(service, action)}
          onClose={handleCloseDialog}
          service={service}
          action={action}
        />}
      <Feedback
        snackbar={snackbar}
        onClose={() => setState({ ...state, snackbar: "" })}
      />
    </div>
  );
}


export default ServicesChart;
