// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  FormControlLabel,
  Typography,
  Button,
  Grid2,
  TableSortLabel,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Delete from "@mui/icons-material/Delete";
import { fetchDomainData } from "../actions/domains";
import AddDomain from "../components/Dialogs/AddDomain";
import DeleteDomain from "../components/Dialogs/DeleteDomain";
import { SYSTEM_ADMIN_WRITE } from "../constants";
import { CapabilityContext } from "../CapabilityContext";
import TableViewContainer from "../components/TableViewContainer";
import withStyledReduxTable from "../components/withTable";
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
import SearchTextfield from "../components/SearchTextfield";
import TableActionGrid from "../components/TableActionGrid";

const styles = (theme) => ({
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  count: {
    marginLeft: 16,
  },
});

const Domains = props => {
  const [showDeleted, setShowDeleted] = useState(false);
  const context = useContext(CapabilityContext);

  const columns = [
    { label: "Domain", value: "domainname" },
    { label: "Address", value: "address" },
    { label: "Title", value: "title" },
    { label: "Active users", value: "activeUsers" },
    { label: "Inactive users", value: "inactiveUsers" },
    { label: "Virtual users", value: "virtualUsers" },
    { label: "Maximum users", value: "maxUser" },
  ];

  const handleScroll = () => {
    const { Domains, count } = props.domains;
    props.handleScroll(Domains, count);
  };

  const handleCheckbox = (event) => setShowDeleted(event.target.checked);

  const { classes, t, domains, tableState, handleMatch, handleRequestSort,
    handleAdd, handleAddingSuccess, handleAddingClose, handleAddingError,
    clearSnackbar, handleDelete, handleDeleteClose, handleDeleteError,
    handleDeleteSuccess, handleEdit } = props;
  const { loading, order, orderBy, match, snackbar, adding, deleting } = tableState;
  const writable = context.includes(SYSTEM_ADMIN_WRITE);
  const filteredDomains = domains.Domains.filter(d => d.domainStatus !== 3 || showDeleted);

  const lgUpHidden = useMediaQuery(theme => theme.breakpoints.up('lg'));
  const lgDownHidden = useMediaQuery(theme => theme.breakpoints.down('lg'));

  return (
    <TableViewContainer
      handleScroll={handleScroll}
      headline={t("Domains")}
      subtitle={t('domains_sub')}
      snackbar={snackbar}
      href="https://docs.grommunio.com/admin/administration.html#domains"
      onSnackbarClose={clearSnackbar}
      loading={loading}
    >
      <TableActionGrid
        tf={<><FormControlLabel
          label={t("Show deactivated")}
          control={
            <Checkbox
              checked={showDeleted || false}
              onChange={handleCheckbox}
            />
          }
        />
        <SearchTextfield
          value={match}
          onChange={handleMatch}
          placeholder={t("Search domains")}
        /></>}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          disabled={!writable}
        >
          {t("New domain")}
        </Button>
      </TableActionGrid>
      <Typography className={classes.count} color="textPrimary">
        {t("showingDomains", { count: filteredDomains.length })}
      </Typography>
      <Paper elevation={1}>
        {!lgDownHidden &&
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.value}>
                    <TableSortLabel
                      active={orderBy === column.value}
                      align="left"
                      direction={orderBy === column.value ? order : "asc"}
                      onClick={handleRequestSort(column.value)}
                      disabled={column.value === 'activeUsers'}
                    >
                      {t(column.label)}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell padding="checkbox" />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDomains.map((obj, idx) =>
                <TableRow key={idx} hover onClick={handleEdit("/domains/" + obj.ID)}>
                  <TableCell>
                    {obj.domainname}{obj.domainname !== obj.displayname ? ` (${obj.displayname}) ` : " "}
                    {obj.domainStatus === 3 ? `[${t("Deactivated")}]` : ""}
                  </TableCell>
                  <TableCell>{obj.address || ""}</TableCell>
                  <TableCell>{obj.title || ""}</TableCell>
                  <TableCell>{obj.activeUsers}</TableCell>
                  <TableCell>{obj.inactiveUsers}</TableCell>
                  <TableCell>{obj.virtualUsers}</TableCell>
                  <TableCell>{obj.maxUser}</TableCell>
                  <TableCell align="right">
                    {writable && <IconButton onClick={handleDelete(obj)} size="small">
                      <Delete color="error" fontSize="small"/>
                    </IconButton>}
                  </TableCell>
                </TableRow>)
              }
            </TableBody>
          </Table>}
        {!lgUpHidden &&
          <List>
            {filteredDomains.map((obj, idx) => 
              <ListItemButton
                key={idx}
                onClick={handleEdit("/domains/" + obj.ID)}
                divider
              >
                <ListItemText
                  primary={`${obj.domainname} ${obj.domainname !== obj.displayname ? `(${obj.displayname})` : ""}
                      ${obj.domainStatus === 3 ? `[${t("Deactivated")}]` : ""}`}
                  secondary={`${obj.activeUsers} / ${obj.maxUser} ${t("Maximum users")}`}
                />
              </ListItemButton>
            )}
          </List>}
        {domains.Domains.length < domains.count && (
          <Grid2 container justifyContent="center">
            <CircularProgress
              color="primary"
              className={classes.circularProgress}
            />
          </Grid2>
        )}
      </Paper>
      <AddDomain
        open={adding}
        onSuccess={handleAddingSuccess}
        onError={handleAddingError}
        onClose={handleAddingClose}
      />
      <DeleteDomain
        open={!!deleting}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
        onClose={handleDeleteClose}
        item={deleting.domainname}
        id={deleting.ID}
      />
    </TableViewContainer>
  );
}

Domains.propTypes = {
  domains: PropTypes.object.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = (state) => {
  return { domains: state.domains };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchTableData: async (params) => {
      await dispatch(fetchDomainData(params)).catch((error) =>
        Promise.reject(error)
      );
    },
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(Domains, { orderBy: 'domainname'});
