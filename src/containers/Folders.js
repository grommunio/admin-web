import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Close';
import { connect } from 'react-redux';
import TopBar from '../components/TopBar';
import { fetchFolderData, deleteFolderData } from '../actions/folders';

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

class Folders extends Component {

  componentDidMount() {
    const { fetch, domain } = this.props;
    fetch(domain.ID);
  }

  handleAdd = () => {
    const { history, domain } = this.props;
    history.push('/' + domain.domainname + '/folders/add', {});
  }

  handleEdit = folder => () => {
    const { history, domain } = this.props;
    history.push('/' + domain.domainname + '/folders/' + folder.ID, { ...folder });
  }

  handleDelete = id => () => {
    const { domain, fetch } = this.props;
    this.props.delete(domain.ID, id)
      .then(() => fetch(domain.ID));
  }

  render() {
    const { classes, folders } = this.props;

    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title="Folders"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper} elevation={2}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>folder name</TableCell>
                  <TableCell>comment</TableCell>
                  <TableCell>creation time</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {folders && folders.Folders.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.displayname}</TableCell>
                    <TableCell>{obj.comment}</TableCell>
                    <TableCell>{obj.creationtime}</TableCell>
                    <TableCell className={classes.flexRowEnd}>
                      <IconButton onClick={this.handleEdit(obj)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={this.handleDelete(obj.folderid)}>
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

Folders.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  folders: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { folders: state.folders };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID) => {
      await dispatch(fetchFolderData(domainID));
    },
    delete: async (domainID, id) => {
      await dispatch(deleteFolderData(domainID, id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Folders)));