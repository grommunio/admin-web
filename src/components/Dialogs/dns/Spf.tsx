// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogContent, DialogTitle, Divider, Theme, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DNSDialogProps } from './types';


const useStyles = makeStyles()((theme: Theme) => ({
  divider: {
    margin: theme.spacing(2, 0, 1, 0),
  },
  result: {
    marginBottom: 16,
  },
}));

function Spf({ onClose, dnsCheck, domain }: DNSDialogProps) {
  const { classes } = useStyles();
  const { t } = useTranslation();
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


export default Spf;