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
import { fetchMlistsData, deleteMlistData } from '../actions/mlists';
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
    fetchDomains().then(() => history.push('/mailLists/add', {}));
  }

  handleEdit = mlist => () => {
    const { history, fetchDomains } = this.props;
    fetchDomains().then(() => history.push('/mailLists/' + mlist.ID, { ...mlist }));
  }

  handleDelete = id => () => {
    this.props.delete(id).then(this.props.fetch);
  }

  render() {
    const { classes, mlists } = this.props;

    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title="Mail lists"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper} elevation={2}>
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
      await dispatch(fetchDomainData()).catch(() => { });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(MLists)));