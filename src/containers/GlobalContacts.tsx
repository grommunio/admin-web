// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

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
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Theme,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Delete from "@mui/icons-material/Delete";
import { ContactMail } from "@mui/icons-material";

import { useTranslation } from "react-i18next";
import { useTable } from "../hooks/useTable";
import { useAppDispatch, useAppSelector } from "../store";

import { deleteUserData, fetchAllContacts } from "../actions/users";
import { CapabilityContext } from "../CapabilityContext";
import { SYSTEM_ADMIN_WRITE } from "../constants";
import TableViewContainer from "../components/TableViewContainer";
import SearchTextfield from "../components/SearchTextfield";
import AddGlobalContact from "../components/Dialogs/AddGlobalContact";
import TableActionGrid from "../components/TableActionGrid";
import DomainDataDelete from "../components/Dialogs/DomainDataDelete";
import { makeStyles } from "tss-react/mui";
import { URLParams } from "@/actions/types";
import { ContactListItem } from "@/types/users";


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


const GlobalContacts = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const context = useContext(CapabilityContext);

  const { Users: userList, count } = useAppSelector(
    (state) => state.users
  );

  const [addingContact, setAddingContact] = useState(false);

  const fetchTableData = async (params: URLParams) =>
    dispatch(fetchAllContacts(params));

  const deleteItem = async (domainID: number, id: number) =>
    dispatch(deleteUserData(domainID, id));

  const table = useTable<ContactListItem>({
    fetchTableData,
    defaultState: { orderBy: "username" },
  });

  const {
    tableState,
    handleMatch,
    clearSnackbar,
    handleDelete,
    handleDeleteClose,
    handleDeleteError,
    handleDeleteSuccess,
    handleEdit,
    handleScroll,
  } = table;

  const { loading, match, snackbar, deleting } = tableState;

  const writable = context.includes(SYSTEM_ADMIN_WRITE);

  const handleScrollWrapper = () => {
    handleScroll(userList, count);
  };

  const handleAddContact = () => setAddingContact(true);
  const handleContactClose = () => setAddingContact(false);
  const handleContactSuccess = () => setAddingContact(false);

  const columns = [
    { label: "Display name", value: "displayname" },
    { label: "E-Mail address", value: "smtpaddress" },
  ];

  const lgUpHidden = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up("lg")
  );
  const lgDownHidden = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("lg")
  );

  return (
    <TableViewContainer
      handleScroll={handleScrollWrapper}
      headline={t("Contacts")}
      subtitle={t("globalcontacts_sub")}
      href="https://docs.grommunio.com/admin/administration.html#users"
      snackbar={snackbar}
      onSnackbarClose={clearSnackbar}
      loading={loading}
    >
      <TableActionGrid
        tf={
          <SearchTextfield
            value={match}
            onChange={handleMatch}
            placeholder={t("Search users")}
          />
        }
      >
        <Button
          variant="contained"
          onClick={handleAddContact}
          disabled={!writable}
        >
          {t("New contact")}
        </Button>
      </TableActionGrid>

      <Typography className={classes.count} color="textPrimary">
        {t("showingUser", { count: userList.length })}
      </Typography>

      <Paper className={classes.tablePaper} elevation={1}>
        {!lgDownHidden && (
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.value}>
                    {t(column.label)}
                  </TableCell>
                ))}
                <TableCell padding="checkbox" />
              </TableRow>
            </TableHead>

            <TableBody>
              {userList.map((obj) => {
                const properties = obj.properties || {};
                return (
                  <TableRow
                    key={obj.ID}
                    hover
                    onClick={handleEdit(
                      `/${obj.domainID}/contacts/${obj.ID}`
                    )}
                  >
                    <TableCell>
                      <div className={classes.flexRow}>
                        <ContactMail
                          className={classes.icon}
                          fontSize="small"
                        />
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
                          <Delete
                            color="error"
                            fontSize="small"
                          />
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
            {userList.map((obj) => (
              <ListItemButton
                key={obj.ID}
                onClick={handleEdit(
                  `/${obj.domainID}/users/${obj.ID}`
                )}
                divider
              >
                <ListItemIcon>
                  <ContactMail
                    className={classes.icon}
                    fontSize="small"
                  />
                </ListItemIcon>

                <ListItemText
                  primary={obj.properties?.displayname || ""}
                  secondary={obj.properties?.smtpaddress || ""}
                />
              </ListItemButton>
            ))}
          </List>
        )}

        {userList.length < count && (
          <Grid2 container justifyContent="center">
            <CircularProgress
              color="primary"
              className={classes.circularProgress}
            />
          </Grid2>
        )}
      </Paper>

      <AddGlobalContact
        open={addingContact}
        onSuccess={handleContactSuccess}
        onError={handleDeleteError}
        onClose={handleContactClose}
      />

      <DomainDataDelete
        open={!!deleting}
        onSuccess={handleDeleteSuccess}
        onClose={handleDeleteClose}
        onError={handleDeleteError}
        domainID={deleting?.domainID ?? -1}
        item={deleting}
        delete={deleteItem}
        id={deleting?.ID}
      />
    </TableViewContainer>
  );
};


export default GlobalContacts;
