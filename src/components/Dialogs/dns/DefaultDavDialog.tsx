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


type DefaultDavDialogProps = Omit<DNSDialogProps, 'domain'> & {
  title: string;
  subtitle: string;
  label1: string;
  label2: string;
  field1: keyof DnsHealthDnsValueOnly;
  field2: keyof DnsHealthDnsValueOnly;
  example?: string | ReactNode;
}


function DefaultDavDialog({ onClose, dnsCheck, title, subtitle, label1, label2, field1, field2, example }: DefaultDavDialogProps) {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dnsRes1 = dnsCheck[field1];
  const dnsRes2 = dnsCheck[field2];
  return (
    <Dialog open maxWidth="md" fullWidth onClose={onClose}>
      <DialogTitle>{t(title)}</DialogTitle>
      <DialogContent>
        <Typography>{t(subtitle)}</Typography>
        <Divider className={classes.divider}/>
        <Typography variant="h6" className={classes.result}>{t(label1)}</Typography>
        <Typography>{t("Internal DNS")}: {dnsRes1.internalDNS ?? t("Unresolvable")}</Typography>
        <Typography>{t("External DNS")}: {dnsRes1.externalDNS ?? t("Unresolvable")}</Typography>
        <Divider className={classes.divider}/>
        <Typography variant="h6" className={classes.result}>{t(label2)}</Typography>
        <Typography>{t("Internal DNS")}: {dnsRes2.internalDNS ?? t("Unresolvable")}</Typography>
        <Typography>{t("External DNS")}: {dnsRes2.externalDNS ?? t("Unresolvable")}</Typography>
        <Divider className={classes.divider} />
        <Typography variant="h6" className={classes.result}>{t("Example")}</Typography>
        {example || ""}
      </DialogContent>
    </Dialog>
  );
}


export default DefaultDavDialog;
