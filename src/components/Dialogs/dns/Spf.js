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

function Spf({ classes, t, onClose, dnsCheck={}, domain }) {
  return (
    <Dialog open maxWidth="md" fullWidth onClose={onClose}>
      <DialogTitle>{t("SPF Records")}</DialogTitle>
      <DialogContent>
        <Typography>{t("spf_expl")}</Typography>
        <Divider className={classes.divider}/>
        <Typography variant="h6" className={classes.result}>{t("DNS check result")}</Typography>
        <Typography>{t("External DNS")}: {dnsCheck.txt?.externalDNS || t("Unresolvable")}</Typography>
        <Divider className={classes.divider}/>
        <pre>
          {`${domain.domainname || "example.at"}.    1    IN    TXT    "v=spf1 a mx -all"`}
        </pre>
      </DialogContent>
    </Dialog>
  );
}

Spf.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
  domain: PropTypes.object,
};

export default withTranslation()(withStyles(Spf, styles));