import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Close';
import TopBar from '../components/TopBar';
import { mailAddresses, deleteMailAddress } from '../api';

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

class MailAddresses extends Component {

  state = {
    mails: [],
  }

  componentDidMount() {
    mailAddresses(this.props.domain.ID).then(json => this.setState({ mails: json ? json.data : []}));
  }

  handleAdd = () => {
    this.props.history.push('/' + this.props.domain.domainname + '/mailAddresses/add', {});
  }

  handleEdit = mail => () => {
    this.props.history.push('/' + this.props.domain.domainname + '/mailAddresses/' + mail.ID, { ...mail });
  }

  handleDelete = id => () => {
    deleteMailAddress(this.props.domain.ID, id).then(() => mailAddresses(this.props.domain.ID))
      .then(json => this.setState({ mails: json ? json.data : []}));
  }

  render() {
    const { classes } = this.props;
    const { mails } = this.state;

    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title="Mail addresses"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper} elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>list name</TableCell>
                  <TableCell>list type</TableCell>
                  <TableCell>expanding priviledge</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mails && mails.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.listName}</TableCell>
                    <TableCell>{obj.listType}</TableCell>
                    <TableCell>{obj.expandingPriviledge}</TableCell>
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

MailAddresses.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
};

export default withTranslation()(withStyles(styles)(MailAddresses));