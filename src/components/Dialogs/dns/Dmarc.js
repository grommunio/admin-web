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

function Dmarc({ classes, t, onClose, dnsCheck={}, domain={domain} }) {
  return (
    <Dialog open maxWidth="md" fullWidth onClose={onClose}>
      <DialogTitle>{t("DMARC")}</DialogTitle>
      <DialogContent>
        <Typography>{t("dmarc_expl")}</Typography>
        <Divider className={classes.divider}/>
        <Typography variant="h6" className={classes.result}>{t("DNS check result")}</Typography>
        <Typography>{t("External DNS")}: {dnsCheck.dmarc?.externalDNS || t("Unresolvable")}</Typography>
        <Divider className={classes.divider}/>
        <pre>
          {`_dmarc.${domain.domainname}.    1    IN    TXT    "v=DMARC1; p=quarantine; rua=mailto:admin@${domain.domainname || "example.at"}"`}
        </pre>
      </DialogContent>
    </Dialog>
  );
}

Dmarc.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
  domain: PropTypes.object,
};

export default withTranslation()(withStyles(styles)(Dmarc));