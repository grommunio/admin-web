import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { Dialog, DialogContent, DialogTitle, Divider, Typography } from '@mui/material';
import { withTranslation } from 'react-i18next';


const styles = theme => ({
  divider: {
    margin: theme.spacing(2, 0),
  },
});

function Reachability({ classes, t, onClose, dnsCheck={} }) {
  return (
    <Dialog open maxWidth="md" fullWidth onClose={onClose}>
      <DialogTitle>{t("Reachability")}</DialogTitle>
      <DialogContent>
        <Typography variant='h6'>{t("Local IP")}: {dnsCheck.localIp || t("Unresolvable")}</Typography>
        <Typography>{t("local_ip_expl")}</Typography>
        <Divider className={classes.divider}/>
        <Typography variant='h6'>{t("External IP")}: {dnsCheck.externalIp || t("Unresolvable")}</Typography>
        <Typography>{t("external_ip_expl")}</Typography>
      </DialogContent>
    </Dialog>
  );
}

Reachability.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
};

export default withTranslation()(withStyles(styles)(Reachability));