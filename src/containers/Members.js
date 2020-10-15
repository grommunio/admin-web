import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Close';
import { Paper,
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
import TopBar from '../components/TopBar';

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
        <TopBar onAdd={this.handleAdd} title="Members"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper} elevation={1}>
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
                      <IconButton onClick={this.handleEdit(obj)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={this.handleDelete(obj.ID)}>
                        <Delete color="error"/>
                      </IconButton>
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
      await dispatch(fetchDomainData()).catch(() => { });
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