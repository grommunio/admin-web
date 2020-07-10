import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TopBar from '../components/TopBar';
import { Paper, Table, TableRow, TableCell, TableBody } from '@material-ui/core';

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
    overflow: 'auto',
  }, 
  toolbar: theme.mixins.toolbar,
  tablePaper: {
    margin: theme.spacing(3, 2),
  },
});

class DomainMenu extends Component {

  state = {
    info: {
      domainname: this.props.domain.domainname,
      maxSize: 69,
      allocated: 420,
    },
  }

  render() {
    const { classes, domain } = this.props;
    const { info } = this.state;

    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title={domain.domainname}/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper} elevation={2}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>domain name</TableCell>
                  <TableCell>{info.domainname}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>beginning day</TableCell>
                  <TableCell>{info.beginDay}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ending day</TableCell>
                  <TableCell>{info.endDay}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>maximum space</TableCell>
                  <TableCell>{info.maxSize}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>allocated space</TableCell>
                  <TableCell>{info.allocated}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>alias addresses</TableCell>
                  <TableCell>{info.aliasAddresses}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>departments</TableCell>
                  <TableCell>{info.departments}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>mail lists</TableCell>
                  <TableCell>{info.mailLists}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>mail backup</TableCell>
                  <TableCell>{info.mailBackup}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>mail monitor</TableCell>
                  <TableCell>{info.mailMonitor}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>unavailable user collecting</TableCell>
                  <TableCell>{info.unavailable}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>mail sub-system</TableCell>
                  <TableCell>{info.subSystem}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>extended user cryptosecurity</TableCell>
                  <TableCell>{info.extended}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </div>
      </div>
    );
  }
}

DomainMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  domain: PropTypes.object,
};

export default withStyles(styles)(DomainMenu);