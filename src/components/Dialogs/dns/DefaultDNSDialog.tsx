// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { ReactNode } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogContent, DialogTitle, Divider, Theme, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DNSDialogProps } from './types';
import { DnsHealthDnsValueOnly } from '@/types/dns';


const useStyles = makeStyles()((theme: Theme) => ({
  divider: {
    margin: theme.spacing(2, 0, 1, 0),
  },
  result: {
    marginBottom: 16,
  },
}));


type DefaultDNSDialogProps = Omit<DNSDialogProps, 'domain'> & {
  label: string;
  subtitle: string;
  field: keyof DnsHealthDnsValueOnly;
  example?: string | ReactNode;
}


function DefaultDNSDialog({ onClose, label, field, subtitle, dnsCheck, example }: DefaultDNSDialogProps) {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dnsRes = dnsCheck[field];
  return (
    <Dialog open maxWidth="md" fullWidth onClose={onClose}>
      <DialogTitle>{t(label)}</DialogTitle>
      <DialogContent>
        <Typography>{t(subtitle)}</Typography>
        <Divider className={classes.divider}/>
        <Typography variant="h6" className={classes.result}>{t("DNS check result")}</Typography>
        <Typography>{t("Internal DNS")}: {dnsRes.internalDNS ?? t("Unresolvable")}</Typography>
        <Typography>{t("External DNS")}: {dnsRes.externalDNS ?? t("Unresolvable")}</Typography>
        {example && <>
          <Divider className={classes.divider}/>
          <Typography variant="h6" className={classes.result}>{t("Example")}</Typography>
          {example}
        </>}
      </DialogContent>
    </Dialog>
  );
}


export default DefaultDNSDialog;