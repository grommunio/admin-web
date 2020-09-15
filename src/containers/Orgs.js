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
import { fetchOrgsData, deleteOrgData } from '../actions/orgs';
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

class Orgs extends Component {

  state = {
    changes: {},
  }

  componentDidMount() {
    this.props.fetch();
  }

  handleAdd = () => {
    const { history } = this.props;
    history.push('/orgs/add', {});
  }

  handleEdit = org => () => {
    const { history } = this.props;
    history.push('/orgs/' + org.ID, { ...org });
  }

  handleDelete = id => () => {
    this.props.delete(id).then(this.props.fetch);
  }

  render() {
    const { classes, orgs } = this.props;

    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title="Organizations"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper} elevation={2}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>memo</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orgs.Orgs.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.memo}</TableCell>
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

Orgs.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  orgs: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { orgs: state.orgs };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => {
      await dispatch(fetchOrgsData());
    },
    delete: async id => {
      await dispatch(deleteOrgData(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Orgs)));