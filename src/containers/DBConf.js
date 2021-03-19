// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Typography, Button, Grid, TableSortLabel,
  TextField, InputAdornment, Tabs, Tab } from '@material-ui/core';
import Search from '@material-ui/icons/Search';
import TopBar from '../components/TopBar';
import { connect } from 'react-redux';
import HomeIcon from '@material-ui/icons/Home';
import blue from '../colors/blue';
import Feedback from '../components/Feedback';
import { debounce } from 'debounce';
import { fetchDBConfData } from '../actions/dbconf';
import UploadServiceFile from '../components/Dialogs/UploadServiceFile';

const styles = theme => ({
  root: {
    flex: 1,
    overflowY: 'auto',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
  },
  paper: {
    padding: theme.spacing(2),
  },
  grid: {
    padding: theme.spacing(0, 2),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  flexRowEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  pageTitle: {
    margin: theme.spacing(2),
  },
  buttonGrid: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  pageTitleSecondary: {
    color: '#aaa',
  },
  homeIcon: {
    color: blue[500],
    position: 'relative',
    top: 4,
    left: 4,
    cursor: 'pointer',
  },
  circularProgress: {
    margin: theme.spacing(1, 0),
  },
  actions: {
    display: 'flex',
    flex: 1,
    margin: theme.spacing(0, 4, 0, 0),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  pre: {
    margin: theme.spacing(1, 0),
  },
  title: {
    marginTop: 16,
  },
});

class DBConf extends Component {

  componentDidMount() {
    this.props.fetch({ sort: 'name,asc' })
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }

  state = {
    snackbar: '',
    adding: false,
    deleting: false,
    order: 'asc',
    match: '',
    offset: 50,
    tab: 0,
  }

  handleInput = field => event => {
    this.setState({
      newData: {
        ...this.state.newData,
        [field]: event.target.value,
      },
    });
  }

  handleRequestSort = () => {
    const { fetch } = this.props;
    const { order: stateOrder, match } = this.state;
    const order = stateOrder === "asc" ? "desc" : "asc";
    
    fetch({
      sort: 'name,' + order,
      match: match || undefined,
    }).catch(msg => this.setState({ snackbar: msg }));

    this.setState({
      order: order,
      offset: 0,
    });
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ adding: false, snackbar: 'Success!' });

  handleAddingClose = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleEdit = role => event => {
    this.props.history.push('/roles/' + role.ID, { ...role });
    event.stopPropagation();
  }

  handleDelete = role => event => {
    event.stopPropagation();
    this.setState({ deleting: role });
  }


  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteError = error => this.setState({ snackbar: error });

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleMatch = e => {
    const { value } = e.target;
    this.debouceFetch(value);
    this.setState({ match: value });
  }

  debouceFetch = debounce(value => {
    const { fetch }= this.props;
    const { order, orderBy } = this.state;
    fetch({ match: value || undefined, sort: orderBy + ',' + order })
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }, 200)

  handleTab = (e, tab) => this.setState({ tab });

  render() {
    const { classes, t, services, commands } = this.props;
    const { adding, snackbar, order, match, tab } = this.state;

    return (
      <div className={classes.root}>
        <TopBar/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("DB Configuration")}
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon onClick={this.handleNavigation('')} className={classes.homeIcon}></HomeIcon>
          </Typography>
          <Grid container alignItems="flex-end" className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.setState({ adding: true })}
            >
              {t("Create file")}
            </Button>
            <div className={classes.actions}>
              <TextField
                value={match}
                onChange={this.handleMatch}
                placeholder={t("search services")}
                variant="outlined"
                className={classes.textfield}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                color="primary"
              />
            </div>
          </Grid>
          <Grid container alignItems="flex-end" className={classes.buttonGrid}>
            <Tabs
              textColor="primary" 
              indicatorColor="primary"
              value={tab}
              onChange={this.handleTab}
            >
              <Tab value={0} label="Services" />
              <Tab value={1} label="Commands" />
            </Tabs>
          </Grid>
          {tab === 0 ? <Paper elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active
                      align="left" 
                      direction={order}
                      onClick={this.handleRequestSort}
                    >
                      {t('Name')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell padding="checkbox"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service, idx) =>
                  <TableRow key={idx} hover>
                    <TableCell>{service}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper> : <Paper className={classes.paper}>
            <Typography variant="h6">Key</Typography>
            {commands.key.length > 0 ? commands.key.map((key, idx) =>
              <pre className={classes.pre} key={idx}>
                <code key={idx}>{key}</code>
              </pre>
            ) : <Typography><i>none</i></Typography>}
            <Typography className={classes.title} variant="h6">File</Typography>
            {commands.file.length > 0 ? commands.file.map((key, idx) =>
              <pre className={classes.pre} key={idx}>
                <code>{key}</code>
              </pre>
            ) : <Typography><i>none</i></Typography>}
            <Typography className={classes.title} variant="h6">Service</Typography>
            {commands.key.service > 0 ? commands.service.map((key, idx) =>
              <pre className={classes.pre} key={idx}>
                <code>{key}</code>
              </pre>
            ) : <Typography><i>none</i></Typography>}
          </Paper>}
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: '' })}
          />
          <UploadServiceFile
            open={adding}
            onClose={this.handleAddingClose}
            onError={this.handleAddingError}
            onSuccess={this.handleAddingSuccess}
          />
        </div>
      </div>
    );
  }
}

DBConf.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  services: PropTypes.array.isRequired,
  commands: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { dbconf } = state;
  return {
    services: dbconf.services,
    commands: dbconf.commands,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async params => {
      await dispatch(fetchDBConfData(params)).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DBConf)));
