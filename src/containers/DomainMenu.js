import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TopBar from '../components/TopBar';
import { Paper, Table, TableRow, TableCell, TableBody } from '@material-ui/core';
import True from '@material-ui/icons/Done';
import False from '@material-ui/icons/Clear';
import { green, red } from '@material-ui/core/colors';
import { withTranslation } from 'react-i18next';

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

function DomainMenu(props) {
  const { classes, domain, t } = props;

  return (
    <div className={classes.root}>
      <TopBar title={domain.domainname}/>
      <div className={classes.toolbar}></div>
      <div className={classes.base}>
        <Paper className={classes.tablePaper} elevation={2}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>{t('Domain name')}</TableCell>
                <TableCell>{domain.domainname}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('Title')}</TableCell>
                <TableCell>{domain.title}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('Address')}</TableCell>
                <TableCell>{domain.address}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('Admin')}</TableCell>
                <TableCell>{domain.adminName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('Create day')}</TableCell>
                <TableCell>{domain.createDay}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('End day')}</TableCell>
                <TableCell>{domain.endDay}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('Home dir')}</TableCell>
                <TableCell>{domain.homedir}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('Maximum size')}</TableCell>
                <TableCell>{domain.maxSize}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('Maximum users')}</TableCell>
                <TableCell>{domain.maxUser}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('Telephone')}</TableCell>
                <TableCell>{domain.tel}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('Ignore checking user')}</TableCell>
                <TableCell>
                  {domain.mailLists ? <True className={classes.true} /> : <False className={classes.false} />}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('Mail backup')}</TableCell>
                <TableCell>
                  {domain.mailLists ? <True className={classes.true} /> : <False className={classes.false} />}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('Mail monitor')}</TableCell>
                <TableCell>
                  {domain.mailMonitor ? <True className={classes.true} /> : <False className={classes.false} />}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('Mail subsystem')}</TableCell>
                <TableCell>
                  {domain.mailBackup ? <True className={classes.true} /> : <False className={classes.false} />}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('Net disk')}</TableCell>
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

DomainMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object,
};

export default withTranslation()(withStyles(styles)(DomainMenu));