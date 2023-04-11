import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { Dialog, DialogContent, DialogTitle, Divider, Typography } from '@mui/material';
import { withTranslation } from 'react-i18next';


const styles = theme => ({
  divider: {
    margin: theme.spacing(2, 0, 1, 0),
  },
  result: {
    marginBottom: 16,
  },
});

function AutodiscoverSrv({ classes, t, onClose, dnsCheck={} }) {
  return (
    <Dialog open maxWidth="md" fullWidth onClose={onClose}>
      <DialogTitle>{t("Autodiscover SRV")}</DialogTitle>
      <DialogContent>
        <Typography>{t("autodiscoverSrv_expl")}</Typography>
        <Divider className={classes.divider}/>
        <Typography variant="h6" className={classes.result}>{t("DNS check result")}</Typography>
        <Typography>{t("Internal DNS")}: {dnsCheck.autodiscoverSRV?.internalDNS || t("Unresolvable")}</Typography>
        <Typography>{t("External DNS")}: {dnsCheck.autodiscoverSRV?.externalDNS || t("Unresolvable")}</Typography>
      </DialogContent>
    </Dialog>
  );
}

AutodiscoverSrv.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
};

export default withTranslation()(withStyles(styles)(AutodiscoverSrv));