// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useContext, useState } from "react";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Button,
  Grid2,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Tooltip,
  useMediaQuery,
  Theme,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Delete from "@mui/icons-material/Delete";
import { ContactMail } from "@mui/icons-material";

import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { useTable } from "../hooks/useTable";
import { useAppDispatch, useAppSelector } from "../store";

import {
  checkLdapUsers,
  deleteUserData,
  fetchContactsData,
} from "../actions/users";
import { syncLdapUsers } from "../actions/ldap";

import DomainDataDelete from "../components/Dialogs/DomainDataDelete";
import TaskCreated from "../components/Dialogs/TaskCreated";
import AddContact from "../components/Dialogs/AddContact";
import CheckLdapDialog from "../components/Dialogs/CheckLdapDialog";

import { CapabilityContext } from "../CapabilityContext";
import { DOMAIN_ADMIN_WRITE } from "../constants";
import TableViewContainer from "../components/TableViewContainer";
import SearchTextfield from "../components/SearchTextfield";
import TableActionGrid from "../components/TableActionGrid";
import { makeStyles } from "tss-react/mui";
import { URLParams } from "@/actions/types";
import { ContactListItem } from "@/types/users";
import { DomainViewProps } from "@/types/common";


const useStyles = makeStyles()((theme: Theme) => ({
  tablePaper: {
    margin: theme.spacing(3, 2, 3, 2),
    borderRadius: 6,
  },
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  newButton: {
    marginRight: 8,
  },
  count: {
    marginLeft: 16,
  },
  flexRow: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
}));


const Contacts = ({ domain }: DomainViewProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const context = useContext(CapabilityContext);

  const { Users, count } = useAppSelector((state) => state.users);

  const [state, setState] = useState({
    snackbar: "",
    checking: false,
    taskMessage: "",
    taskID: -1,
    addingContact: false,
  });

  const fetchTableData = async (params: URLParams) =>
    dispatch(fetchContactsData(domain.ID, params));

  const deleteItem = async (domainID: number, id: number) => {
    dispatch(deleteUserData(domainID, id));
  }

  const sync = async (params: any) =>
    dispatch(syncLdapUsers(params, domain.ID));

  const check = async () =>
    dispatch(checkLdapUsers({ domain: domain.ID }));

  const table = useTable<ContactListItem>({
    fetchTableData,
    defaultState: { orderBy: "username" },
  });

  const {
    tableState,
    handleMatch,
    handleDelete,
    handleDeleteClose,
    handleDeleteError,
    handleDeleteSuccess,
    handleEdit,
    clearSnackbar,
    handleScroll,
  } = table;

  const { loading, match, snackbar, deleting } = tableState;

  const writable = context.includes(DOMAIN_ADMIN_WRITE);

  const handleNavigation = (path: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    navigate(`/${path}`);
  };

  const handleTaskClose = () =>
    setState((prev) => ({ ...prev, taskMessage: "", taskID: -1 }));

  const handleSnackbarClose = () => {
    clearSnackbar();
    setState((prev) => ({ ...prev, snackbar: "" }));
  };

  const handleContactsSync = (importUsers: boolean) => async () => {
    try {
      const response: any = await sync({ import: importUsers });

      if (response?.taskID) {
        setState((prev) => ({
          ...prev,
          taskMessage: response.message || "Task created",
          taskID: response.taskID,
        }));
      } else {
        const { order, orderBy, match } = tableState;

        setState((prev) => ({ ...prev, snackbar: "Success!" }));

        await fetchTableData({
          match: match || undefined,
          sort: `${orderBy},${order}`,
        });
      }
    } catch (msg: any) {
      setState((prev) => ({ ...prev, snackbar: msg }));
    }
  };

  const checkUsers = async () => {
    try {
      await check();
      setState((prev) => ({ ...prev, checking: true }));
    } catch (msg: any) {
      setState((prev) => ({ ...prev, snackbar: msg }));
    }
  };

  const handleCheckClose = () =>
    setState((prev) => ({ ...prev, checking: false }));

  const handleCheckSuccess = async () => {
    try {
      const { order, orderBy, match } = tableState;

      await fetchTableData({
        match: match || undefined,
        sort: `${orderBy},${order}`,
      });

      setState((prev) => ({ ...prev, checking: false }));
    } catch (msg: any) {
      setState((prev) => ({
        ...prev,
        snackbar: msg,
        checking: false,
      }));
    }
  };

  const handleAddContact = () =>
    setState((prev) => ({ ...prev, addingContact: true }));

  const handleContactClose = () =>
    setState((prev) => ({ ...prev, addingContact: false }));

  const handleContactSuccess = () =>
    setState((prev) => ({
      ...prev,
      addingContact: false,
      snackbar: "Success!",
    }));

  const handleContactError = (error: string) =>
    setState((prev) => ({ ...prev, snackbar: error }));

  const onScroll = () => handleScroll(Users, count);

  const lgUpHidden = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up("lg")
  );
  const lgDownHidden = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("lg")
  );

  const columns = [
    { label: 'Display name', value: 'displayname' },
    { label: 'E-Mail address', value: 'smtpaddress' }
  ];

  return (
    <TableViewContainer
      handleScroll={onScroll}
      headline={t("Contacts")}
      subtitle={t("contacts_sub")}
      href="https://docs.grommunio.com/admin/administration.html#users"
      snackbar={snackbar || state.snackbar}
      onSnackbarClose={handleSnackbarClose}
      loading={loading}
    >
      <TableActionGrid
        tf={
          <SearchTextfield
            value={match}
            onChange={handleMatch}
            placeholder={t("Search contacts")}
          />
        }
      >
        <Button
          variant="contained"
          onClick={handleAddContact}
          className={classes.newButton}
          disabled={!writable}
        >
          {t("New contact")}
        </Button>

        <Button
          variant="contained"
          onClick={handleNavigation(domain.ID + "/ldap")}
          className={classes.newButton}
          disabled={!writable}
        >
          {t("Search in LDAP")}
        </Button>

        <Tooltip title={t("Synchronize LDAP for this domain")}>
          <Button
            variant="contained"
            onClick={handleContactsSync(false)}
            disabled={!writable}
            className={classes.newButton}
          >
            {t("Sync LDAP")}
          </Button>
        </Tooltip>

        <Tooltip title={t("Import new contacts from LDAP for this domain")}>
          <Button
            variant="contained"
            onClick={handleContactsSync(true)}
            disabled={!writable}
            className={classes.newButton}
          >
            {t("Import LDAP")}
          </Button>
        </Tooltip>

        <Tooltip title={t("Check status of imported contacts of this domain")}>
          <Button
            variant="contained"
            onClick={checkUsers}
            disabled={!writable}
          >
            {t("Check LDAP")}
          </Button>
        </Tooltip>
      </TableActionGrid>

      <Typography className={classes.count} color="textPrimary">
        {t("showingUser", { count: Users.length })}
      </Typography>

      <Paper className={classes.tablePaper} elevation={1}>
        {!lgDownHidden && (
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map(column =>
                  <TableCell key={column.value}>
                    {t(column.label)}
                  </TableCell>
                )}
                <TableCell padding="checkbox" />
              </TableRow>
            </TableHead>
            <TableBody>
              {Users.map((obj: ContactListItem) => {
                const properties = obj.properties || {};

                return (
                  <TableRow
                    key={obj.ID}
                    hover
                    onClick={handleEdit(
                      `/${domain.ID}/contacts/${obj.ID}`
                    )}
                  >
                    <TableCell>
                      <div className={classes.flexRow}>
                        <ContactMail className={classes.icon} />
                        {properties.displayname || ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      {properties.smtpaddress || ""}
                    </TableCell>
                    <TableCell align="right">
                      {writable && (
                        <IconButton
                          onClick={handleDelete(obj)}
                          size="small"
                        >
                          <Delete color="error" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {!lgUpHidden && (
          <List>
            {Users.map((obj: ContactListItem) => (
              <ListItemButton
                key={obj.ID}
                onClick={handleEdit(
                  `/${domain.ID}/contacts/${obj.ID}`
                )}
                divider
              >
                <ListItemIcon>
                  <ContactMail className={classes.icon} />
                </ListItemIcon>
                <ListItemText
                  primary={obj.properties?.displayname || ""}
                  secondary={obj.properties?.smtpaddress || ""}
                />
              </ListItemButton>
            ))}
          </List>
        )}

        {Users.length < count && (
          <Grid2 container justifyContent="center">
            <CircularProgress className={classes.circularProgress} />
          </Grid2>
        )}
      </Paper>

      <AddContact
        domain={domain}
        open={state.addingContact}
        onSuccess={handleContactSuccess}
        onError={handleContactError}
        onClose={handleContactClose}
      />

      <DomainDataDelete
        open={!!deleting}
        onSuccess={handleDeleteSuccess}
        onClose={handleDeleteClose}
        onError={handleDeleteError}
        item={deleting.username}
        delete={deleteItem}
        id={deleting?.ID}
        domainID={domain.ID}
      />

      <TaskCreated
        message={state.taskMessage}
        taskID={state.taskID}
        onClose={handleTaskClose}
      />

      <CheckLdapDialog
        open={state.checking}
        onClose={handleCheckClose}
        onSuccess={handleCheckSuccess}
        onError={handleDeleteError}
        checkUsers={checkUsers}
      />
    </TableViewContainer>
  );
};

export default Contacts;