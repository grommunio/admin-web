import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Grid, Typography, Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody} from '@material-ui/core';
import { connect } from 'react-redux';
import { fetchMlistsData, deleteMlistData } from '../actions/mlists';
import { fetchDomainData } from '../actions/domains';

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

class MLists extends Component {

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
    const { history, fetchDomains } = this.props;
    fetchDomains().then(() => history.push('/mlists/add', {}));
  }

  handleEdit = mlist => () => {
    const { history, fetchDomains } = this.props;
    fetchDomains().then(() => history.push('/mlists/' + mlist.ID, { ...mlist }));
  }

  handleDelete = id => () => {
    this.props.delete(id).then(this.props.fetch);
  }

  render() {
    const { classes, mlists } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Grid className={classes.grid} container>
            <Grid item xs={3}></Grid>
            <Grid item xs={6}>
              <Typography align="center" variant="h4" color="primary">MLists</Typography>
            </Grid>
            <Grid item xs={3} className={classes.flexRowEnd}>
              <Button variant="contained" color="primary" onClick={this.handleAdd}>Add</Button>
            </Grid>
          </Grid>
          <Paper className={classes.tablePaper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>listname</TableCell>
                  <TableCell>domain</TableCell>
                  <TableCell>list type</TableCell>
                  <TableCell>list privilege</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mlists.Mlists.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.listname}</TableCell>
                    <TableCell>{obj.domainID}</TableCell>
                    <TableCell>{obj.listType}</TableCell>
                    <TableCell>{obj.listPrivilege}</TableCell>
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

MLists.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  mlists: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { mlists: state.mlists };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => {
      await dispatch(fetchMlistsData());
    },
    delete: async id => {
      await dispatch(deleteMlistData(id));
    },
    fetchDomains: async () => {
      await dispatch(fetchDomainData());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(MLists)));