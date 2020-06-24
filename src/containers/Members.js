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
import { fetchMembersData, deleteMemberData } from '../actions/members';
import { fetchClassesData } from '../actions/classes';
import { fetchDomainData } from '../actions/domains';
import { fetchGroupsData } from '../actions/groups';

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

class Classes extends Component {

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
    const { history, fetchDomains, fetchGroups, fetchClasses } = this.props;
    Promise.all([
      fetchDomains(),
      fetchGroups(),
      fetchClasses(),
    ]).then(() => history.push('/members/add', {}));
  }

  handleEdit = member => () => {
    const { history, fetchDomains, fetchGroups, fetchClasses } = this.props;
    Promise.all([
      fetchDomains(),
      fetchGroups(),
      fetchClasses(),
    ]).then(() => history.push('/members/' + member.ID, { ...member }));
  }

  handleDelete = id => () => {
    this.props.delete(id).then(this.props.fetch);
  }

  render() {
    const { classes, members } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Grid className={classes.grid} container>
            <Grid item xs={3}></Grid>
            <Grid item xs={6}>
              <Typography align="center" variant="h4" color="primary">Members</Typography>
            </Grid>
            <Grid item xs={3} className={classes.flexRowEnd}>
              <Button variant="contained" color="primary" onClick={this.handleAdd}>Add</Button>
            </Grid>
          </Grid>
          <Paper className={classes.tablePaper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>username</TableCell>
                  <TableCell>domain</TableCell>
                  <TableCell>group</TableCell>
                  <TableCell>class</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.Members.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.username}</TableCell>
                    <TableCell>{obj.domainID}</TableCell>
                    <TableCell>{obj.groupID}</TableCell>
                    <TableCell>{obj.class}</TableCell>
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

Classes.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  members: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  fetchGroups: PropTypes.func.isRequired,
  fetchClasses: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    members: state.members,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => {
      await dispatch(fetchMembersData());
    },
    delete: async id => {
      await dispatch(deleteMemberData(id));
    },
    fetchDomains: async () => {
      await dispatch(fetchDomainData());
    },
    fetchGroups: async () => {
      await dispatch(fetchGroupsData());
    },
    fetchClasses: async () => {
      await dispatch(fetchClassesData());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Classes)));