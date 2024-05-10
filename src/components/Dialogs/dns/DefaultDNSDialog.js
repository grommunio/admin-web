import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
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

function DefaultDNSDialog({ classes, t, onClose, label, field, subtitle, dnsCheck={}, example }) {
  const dnsRes = dnsCheck[field] || {};
  return (
    <Dialog open maxWidth="md" fullWidth onClose={onClose}>
      <DialogTitle>{t(label)}</DialogTitle>
      <DialogContent>
        <Typography>{t(subtitle)}</Typography>
        <Divider className={classes.divider}/>
        <Typography variant="h6" className={classes.result}>{t("DNS check result")}</Typography>
        <Typography>{t("Internal DNS")}: {dnsRes.internalDNS || t("Unresolvable")}</Typography>
        <Typography>{t("External DNS")}: {dnsRes.externalDNS || t("Unresolvable")}</Typography>
        {example && <>
          <Divider className={classes.divider}/>
          <Typography variant="h6" className={classes.result}>{t("Example")}</Typography>
          {example}
        </>}
      </DialogContent>
    </Dialog>
  );
}

DefaultDNSDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
  subtitle: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  example: PropTypes.any,
  domain: PropTypes.object.isRequired,
};

export default withTranslation()(withStyles(DefaultDNSDialog, styles));