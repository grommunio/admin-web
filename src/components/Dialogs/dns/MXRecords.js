// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { Dialog, DialogContent, DialogTitle, Divider, Typography } from '@mui/material';
import { withTranslation } from 'react-i18next';
import { ArrowForward } from '@mui/icons-material';


const styles = theme => ({
  divider: {
    margin: theme.spacing(2, 0, 1, 0),
  },
  result: {
    marginBottom: 16,
  },
  arrowChart: {
    paddingTop: 8,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
});

function MXRecords({ classes, t, onClose, dnsCheck={}, domain }) {
  const { internalDNS = "", externalDNS = "", mxDomain = "", reverseLookup = "" } = dnsCheck.mxRecords || {};
  return (
    <Dialog open maxWidth="md" fullWidth onClose={onClose}>
      <DialogTitle>{t("MX Records")}</DialogTitle>
      <DialogContent>
        <Typography>{t("mx_expl")}</Typography>
        <Divider className={classes.divider}/>
        <Typography variant="h6" className={classes.result}>{t("DNS check result")}</Typography>
        <Typography>{t("Internal DNS")}: {internalDNS || t("Unresolvable")}</Typography>
        <Typography>{t("External DNS")}: {externalDNS || t("Unresolvable")}</Typography>
        <Divider className={classes.divider} />
        <Typography variant="h6" className={classes.result}>{t("Example")}</Typography>
        {<pre>
          {`${domain.domainname || "example.at"}.    1    IN    MX    10 mail.${domain.domainname || "example.at"}.`}
        </pre>}
        <Divider className={classes.divider}/>
        <div className={classes.arrowChart}>
          <div>
            <Typography>{t("MX Domain")}</Typography>
            {mxDomain || t("Unresolvable")}
          </div>
          <ArrowForward />
          <div>
            <Typography>{t("Resolved IP")}</Typography>
            {externalDNS || t("Unresolvable")}
          </div>
          <ArrowForward />
          <div>
            <Typography>{t("Reverse lookup")}</Typography>
            {reverseLookup || t("Unresolvable")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

MXRecords.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
  domain: PropTypes.object,
};

export default withTranslation()(withStyles(MXRecords, styles));