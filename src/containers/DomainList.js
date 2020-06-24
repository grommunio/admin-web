import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Grid, Typography, Button } from '@material-ui/core';
import { connect } from 'react-redux';
import { fetchDomainData, deleteDomainData } from '../actions/domains';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
    overflowY: 'auto',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  tablePaper: {
    margin: theme.spacing(3, 2),
    borderRadius: 6,
  },
  grid: {
    padding: theme.spacing(0, 2),
  },
  toolbar: theme.mixins.toolbar,
  flexRowEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
});

class DomainList extends Component {

  state = {
    changes: {},
  }

  componentDidMount() {
    this.props.fetch();
  }

  handleInput = field => event => {
    this.setState({
      changes: {
        ...this.state.changes,
        [field]: event.target.value,
      },
    });
  }

  handleAdd = () => {
    this.props.history.push('/DomainList/add', {});
  }

  handleEdit = domain => () => {
    this.props.history.push('/DomainList/' + domain.ID, { ...domain });
  }

  handleDelete = id => () => {
    this.props.delete(id).then(this.props.fetch);
  }

  render() {
    const { classes, domains } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Grid className={classes.grid} container>
            <Grid item xs={3}></Grid>
            <Grid item xs={6}>
              <Typography align="center" variant="h4" color="primary">domain list</Typography>
            </Grid>
            <Grid item xs={3} className={classes.flexRowEnd}>
              <Button variant="contained" color="primary" onClick={this.handleAdd}>Add</Button>
            </Grid>
          </Grid>
          <Paper className={classes.tablePaper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>domain</TableCell>
                  <TableCell>title</TableCell>
                  <TableCell>maximum space</TableCell>
                  <TableCell>maximum users</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {domains.Domains.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.domainname}</TableCell>
                    <TableCell>{obj.title}</TableCell>
                    <TableCell>{obj.maxSize}</TableCell>
                    <TableCell>{obj.maxUser}</TableCell>
                    <TableCell className={classes.flexRowEnd}>
                      <Button onClick={this.handleEdit(obj)}>Edit</Button>
                      <Button onClick={this.handleDelete(obj.ID)}>Delete</Button>
                    </TableCell>
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

DomainList.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domains: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { domains: state.domains };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => {
      await dispatch(fetchDomainData());
    },
    delete: async id => {
      await dispatch(deleteDomainData(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DomainList)));