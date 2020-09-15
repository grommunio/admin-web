import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Close';
import { connect } from 'react-redux';
import { fetchAliasesData, deleteAliasData } from '../actions/aliases';
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

class Aliases extends Component {

  state = {
    changes: {},
  }

  componentDidMount() {
    this.props.fetch();
  }

  handleAdd = () => {
    const { history } = this.props;
    history.push('/aliases/add', {});
  }

  handleEdit = alias => () => {
    const { history } = this.props;
    history.push('/aliases/' + alias.ID, { ...alias });
  }

  handleDelete = id => () => {
    this.props.delete(id).then(this.props.fetch);
  }

  render() {
    const { classes, aliases } = this.props;

    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title="Aliases"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>alias name</TableCell>
                  <TableCell>main name</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {aliases.Aliases.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.aliasname}</TableCell>
                    <TableCell>{obj.mainname}</TableCell>
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

Aliases.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  aliases: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { aliases: state.aliases };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => {
      await dispatch(fetchAliasesData());
    },
    delete: async id => {
      await dispatch(deleteAliasData(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Aliases)));