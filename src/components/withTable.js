// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

/* eslint-disable react/display-name */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'debounce';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@mui/styles';
import { defaultFetchLimit } from '../constants';

export default function withStyledReduxTable(mapState, mapDispatch, styles) {
  return (wrappedComponent, defaultState) => connect(mapState, mapDispatch)(
    withTranslation()(withStyles(styles)(
      withTable(wrappedComponent, defaultState))));
}

function withTable(WrappedComponent, defaultState={}) {

  return class extends Component {
    static propTypes = {
      fetchTableData: PropTypes.func.isRequired,
      domain: PropTypes.object,
      history: PropTypes.object.isRequired,
    }

    constructor(props) {
      super(props);
      this.state = {
        offset: 0,
        orderBy: 'name',
        order: 'asc',
        match: '',
        snackbar: '',
        adding: false,
        deleting: false,
        loading: true,
        ...defaultState,
      };
    }

    componentDidMount() {
      this.fetchData();
    }
  
    fetchData(params) {
      const { domain, fetchTableData } = this.props;
      const { order, orderBy } = this.state;
      if(domain?.ID) {
        fetchTableData(domain.ID, { sort: orderBy + "," + order, ...(params || {})})
          .then(() => this.setState({ loading: false }))
          .catch((msg) => this.setState({ snackbar: msg, loading: false }));
      } else {
        fetchTableData({ sort: orderBy + "," + order, ...(params || {})})
          .then(() => this.setState({ loading: false }))
          .catch((msg) => this.setState({ snackbar: msg, loading: false }));
      }
    }

    handleRequestSort = (orderBy) => () => {
      const { order: stateOrder, orderBy: stateOrderBy, match } = this.state;
      const order =
        stateOrderBy === orderBy && stateOrder === "asc" ? "desc" : "asc";
  
      this.fetchData({
        sort: orderBy + "," + order,
        match: match || undefined,
      });
  
      this.setState({
        order: order,
        orderBy: orderBy,
        offset: 0,
      });
    };

    handleScroll = (data, count, loading) => {
      if (data.length >= count) return;
      if (
        Math.floor(
          document.getElementById("scrollDiv").scrollHeight -
            document.getElementById("scrollDiv").scrollTop
        ) <=
        document.getElementById("scrollDiv").offsetHeight + 20
      ) {
        const { orderBy, order, offset, match } = this.state;
        if (!loading) { 
          this.setState({
            offset: offset + defaultFetchLimit,
          }, () => this.fetchData({
            sort: orderBy + "," + order,
            offset: this.state.offset, // state has updated, so get fresh value here
            match: match || undefined,
          }));
          
        }
      }
    };

    clearSnackbar = () => this.setState({
      snackbar: '',
    });

    handleMatch = (e) => {
      const { value } = e.target;
      this.debouceFetch(value);
      this.setState({ match: value });
    };
  
    debouceFetch = debounce((value) => {
      this.fetchData({
        match: value || undefined,
      });
    }, 200);

    handleAdd = () => this.setState({ adding: true });

    handleAddingClose = () => this.setState({ adding: false });

    handleAddingSuccess = () => this.setState({ adding: false, snackbar: 'Success!' });

    handleAddingError = (error) => this.setState({ snackbar: error });

    handleDelete = (item) => (event) => {
      event.stopPropagation();
      this.setState({ deleting: item });
    };
  
    handleDeleteSuccess = () =>
      this.setState({ deleting: false, snackbar: "Success!" });
  
    handleDeleteClose = () => this.setState({ deleting: false });
  
    handleDeleteError = (error) => this.setState({ snackbar: error });

    handleEdit = path => (event) => {
      if(window.getSelection().toString()) return;
      this.props.history.push(path);
      event.stopPropagation();
    };

    render() {
      return <WrappedComponent
        handleRequestSort={this.handleRequestSort}
        handleMatch={this.handleMatch}
        handleScroll={this.handleScroll}
        tableState={this.state}
        clearSnackbar={this.clearSnackbar}
        handleAdd={this.handleAdd}
        handleAddingClose={this.handleAddingClose}
        handleAddingSuccess={this.handleAddingSuccess}
        handleAddingError={this.handleAddingError}
        handleDelete={this.handleDelete}
        handleDeleteSuccess={this.handleDeleteSuccess}
        handleDeleteClose={this.handleDeleteClose}
        handleDeleteError={this.handleDeleteError}
        handleEdit={this.handleEdit}
        {...this.props}
      />;
    }
  };

}
