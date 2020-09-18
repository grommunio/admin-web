import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TopBar from '../components/TopBar';
import { Paper, Table, TableRow, TableCell, TableBody } from '@material-ui/core';
import True from '@material-ui/icons/Done';
import False from '@material-ui/icons/Clear';
import { green, red } from '@material-ui/core/colors';

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
  true: {
    color: green['500'],
  },
  false: {
    color: red['500'],
  },
});

class DomainMenu extends Component {

  render() {
    const { classes, domain } = this.props;

    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title={domain.domainname}/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper} elevation={2}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Domain name</TableCell>
                  <TableCell>{domain.domainname}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>{domain.title}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Address</TableCell>
                  <TableCell>{domain.address}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Admin</TableCell>
                  <TableCell>{domain.adminName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Create day</TableCell>
                  <TableCell>{domain.createDay}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>End day</TableCell>
                  <TableCell>{domain.endDay}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Home dir</TableCell>
                  <TableCell>{domain.homedir}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Maximum Size</TableCell>
                  <TableCell>{domain.maxSize}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Maximum users</TableCell>
                  <TableCell>{domain.maxUser}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Telephone</TableCell>
                  <TableCell>{domain.tel}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Ignore checking user</TableCell>
                  <TableCell>
                    {domain.mailLists ? <True className={classes.true} /> : <False className={classes.false} />}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mail Backup</TableCell>
                  <TableCell>
                    {domain.mailLists ? <True className={classes.true} /> : <False className={classes.false} />}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mail monitor</TableCell>
                  <TableCell>
                    {domain.mailMonitor ? <True className={classes.true} /> : <False className={classes.false} />}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mail subsystem</TableCell>
                  <TableCell>
                    {domain.mailBackup ? <True className={classes.true} /> : <False className={classes.false} />}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Net disk</TableCell>
                  <TableCell>
                    {domain.netDisk ? <True className={classes.true} /> : <False className={classes.false} />}
                  </TableCell>
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