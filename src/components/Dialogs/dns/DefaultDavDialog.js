// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

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

function DefaultDavDialog({ classes, t, onClose, dnsCheck={}, title, subtitle, label1, label2, field1, field2, example }) {
  const dnsRes1 = dnsCheck[field1] || {};
  const dnsRes2 = dnsCheck[field2] || {};
  return (
    <Dialog open maxWidth="md" fullWidth onClose={onClose}>
      <DialogTitle>{t(title)}</DialogTitle>
      <DialogContent>
        <Typography>{t(subtitle)}</Typography>
        <Divider className={classes.divider}/>
        <Typography variant="h6" className={classes.result}>{t(label1)}</Typography>
        <Typography>{t("Internal DNS")}: {dnsRes1.internalDNS || t("Unresolvable")}</Typography>
        <Typography>{t("External DNS")}: {dnsRes1.externalDNS || t("Unresolvable")}</Typography>
        <Divider className={classes.divider}/>
        <Typography variant="h6" className={classes.result}>{t(label2)}</Typography>
        <Typography>{t("Internal DNS")}: {dnsRes2.internalDNS || t("Unresolvable")}</Typography>
        <Typography>{t("External DNS")}: {dnsRes2.externalDNS || t("Unresolvable")}</Typography>
        <Divider className={classes.divider} />
        <Typography variant="h6" className={classes.result}>{t("Example")}</Typography>
        {example || ""}
      </DialogContent>
    </Dialog>
  );
}

DefaultDavDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  label1: PropTypes.string.isRequired,
  label2: PropTypes.string.isRequired,
  field1: PropTypes.string.isRequired,
  field2: PropTypes.string.isRequired,
  example: PropTypes.any,
};

export default withTranslation()(withStyles(DefaultDavDialog, styles));