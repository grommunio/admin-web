import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Close';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import { connect } from 'react-redux';
import { fetchGroupsData, deleteGroupData } from '../actions/groups';
import { fetchDomainData } from '../actions/domains';
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

class Groups extends Component {

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
    fetchDomains().then(() => history.push('/groups/add', {}));
  }

  handleEdit = group => () => {
    const { history, fetchDomains } = this.props;
    fetchDomains().then(() => history.push('/groups/' + group.ID, { ...group }));
  }

  handleDelete = id => () => {
    this.props.delete(id).then(this.props.fetch);
  }

  render() {
    const { classes, groups } = this.props;

    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title="Groups"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper} elevation={2}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>groupname</TableCell>
                  <TableCell>title</TableCell>
                  <TableCell>maximum space</TableCell>
                  <TableCell>maximum users</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.Groups.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.groupname}</TableCell>
                    <TableCell>{obj.title}</TableCell>
                    <TableCell>{obj.maxSize}</TableCell>
                    <TableCell>{obj.maxUser}</TableCell>
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

Groups.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  groups: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { groups: state.groups };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => {
      await dispatch(fetchGroupsData());
    },
    fetchDomains: async () => {
      await dispatch(fetchDomainData());
    },
    delete: async id => {
      await dispatch(deleteGroupData(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Groups)));