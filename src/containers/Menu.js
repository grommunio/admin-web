// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TopBar from '../components/TopBar';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Typography } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { selectDrawerDomain } from '../actions/drawer';

const styles = theme => ({
  root: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    overflowX: "hidden",
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2, 0),
    flex: 1,
    display: 'flex',
    overflow: 'auto',
  },
  pageTitle: {
    margin: theme.spacing(2),
  },
  toolbar: theme.mixins.toolbar,
});

class Menu extends PureComponent {

  state = {
    orderBy: 'domainname',
    order: 'asc',
    sortedDomains: [],
  }

  columns = [
    { label: "Domain", value: "domainname" },
    { label: "Address", value: "address" },
    { label: "Title", value: "title" },
    { label: "Maximum users", value: "maxUser" },
  ];

  handleNavigation = (path) => (event) => {
    const { history, selectDomain } = this.props;
    event.preventDefault();
    selectDomain(path);
    history.push(`/${path}`);
  };

  handleSort = orderBy => () => {
    const sortedDomains = [...this.props.domains];
    const { order: stateOrder, orderBy: stateOrderBy } = this.state;
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
    this.setState({ sortedDomains, order, orderBy });
  }

  render() {
    const { classes, t, domains } = this.props;
    const { orderBy, order, sortedDomains } = this.state;
    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title="Dashboard"/>
        <div className={classes.toolbar}></div>
        <Typography variant="h2" className={classes.pageTitle}>
          {t("Dashboard")}
        </Typography>
        <div className={classes.base}>
          <Paper elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {this.columns.map((column) => (
                    <TableCell key={column.value}>
                      <TableSortLabel
                        active={orderBy === column.value}
                        align="left"
                        direction={orderBy === column.value ? order : "asc"}
                        onClick={this.handleSort(column.value)}
                      >
                        {t(column.label)}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(sortedDomains.length > 0 ? sortedDomains : domains).map((obj, idx) => 
                  <TableRow key={idx} hover onClick={this.handleNavigation(obj.ID)}>
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
        </div>
      </div>
    );
  }
}

Menu.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domains: PropTypes.array.isRequired,
  selectDomain: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    domains: state.drawer.Domains,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    selectDomain: id => dispatch(selectDrawerDomain(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Menu)));
